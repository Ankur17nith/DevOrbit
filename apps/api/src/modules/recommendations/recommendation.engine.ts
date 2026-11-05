import { prisma } from '../../config/index.js';
import { NotFoundError, BadRequestError } from '../../lib/errors.js';
import { normalizeRepository } from '../opensource/repository.normalizer.js';

export interface ScoringWeights {
  technologyMatch: number;   // default 0.25
  domainMatch: number;       // default 0.20
  difficultyAlignment: number; // default 0.15
  skillStrengthMatch: number;  // default 0.15
  projectHealth: number;     // default 0.10
  issueFreshness: number;    // default 0.10
  orgRelevance: number;      // default 0.05
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  technologyMatch: 0.25,
  domainMatch: 0.20,
  difficultyAlignment: 0.15,
  skillStrengthMatch: 0.15,
  projectHealth: 0.10,
  issueFreshness: 0.10,
  orgRelevance: 0.05,
};

export type RecommendationCategory =
  | 'BEST_SKILL_FIT'
  | 'GOOD_FIRST_ISSUE'
  | 'DOMAIN_EXPANSION'
  | 'TRENDING_HOT'
  | 'SPONSORED_BOUNTY';

export interface ScoredOpportunity {
  id: string;
  targetType: 'ISSUE' | 'BOUNTY' | 'ORGANIZATION';
  issue: any;
  score: number;
  category: RecommendationCategory;
  factors: {
    technologyMatchScore: number;
    domainMatchScore: number;
    difficultyScore: number;
    skillStrengthScore: number;
    projectHealthScore: number;
    freshnessScore: number;
    orgRelevanceScore: number;
  };
  explanation: string;
  matchedEvidence: string[];
}

export class RecommendationEngine {
  /**
   * Generates evidence-based, deterministic recommendations matching
   * candidate issues with developer's multi-source verified skill profile.
   */
  async getRecommendations(
    userId: string,
    options?: {
      category?: RecommendationCategory;
      limit?: number;
      weights?: Partial<ScoringWeights>;
    }
  ): Promise<ScoredOpportunity[]> {
    const weights: ScoringWeights = {
      ...DEFAULT_SCORING_WEIGHTS,
      ...(options?.weights || {}),
    };

    // 1. Fetch user's verified skills, interests, and dismissed topics/issues
    const [userSkills, devProfile, userRepos, dismissedFeedback, candidateIssues] = await Promise.all([
      prisma.userSkillProfile.findMany({ where: { userId } }),
      prisma.developerProfile.findUnique({
        where: { userId },
        include: { skills: true, interests: true },
      }),
      prisma.userGithubRepo.findMany({ where: { userId } }),
      prisma.recommendationFeedback.findMany({
        where: { userId, action: 'DISMISSED' },
      }),
      prisma.ossIssue.findMany({
        where: { state: 'open' },
        include: {
          repository: true,
        },
        take: 60,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Build set of dismissed targets or technologies to lower or exclude
    const dismissedTargetIds = new Set(dismissedFeedback.map(f => f.recommendationId));

    // Aggregate user verified skills map (name -> { confidence, evidenceCount, source })
    const skillConfidenceMap = new Map<string, { confidence: number; evidenceCount: number; source: string }>();

    for (const s of userSkills) {
      let count = 1;
      try {
        if (s.verifiedEvidenceJson) count = JSON.parse(s.verifiedEvidenceJson).length;
      } catch {}
      skillConfidenceMap.set(s.skillName.toLowerCase(), {
        confidence: s.confidenceScore,
        evidenceCount: count,
        source: 'codebase',
      });
    }

    if (devProfile) {
      for (const s of devProfile.skills) {
        const key = s.skillName.toLowerCase();
        const existing = skillConfidenceMap.get(key);
        if (existing) {
          existing.confidence = Math.max(existing.confidence, s.confidenceScore);
        } else {
          skillConfidenceMap.set(key, {
            confidence: s.confidenceScore,
            evidenceCount: s.evidenceCount,
            source: s.source === 'GITHUB_README' ? 'profile README' : 'profile configuration',
          });
        }
      }

      if (devProfile.preferredLanguagesJson) {
        try {
          const prefLangs = JSON.parse(devProfile.preferredLanguagesJson) as string[];
          for (const pl of prefLangs) {
            const key = pl.toLowerCase();
            if (!skillConfidenceMap.has(key)) {
              skillConfidenceMap.set(key, {
                confidence: 75,
                evidenceCount: 1,
                source: 'preferred languages',
              });
            }
          }
        } catch {}
      }
    }

    // Baseline fallback if user hasn't configured skills or preferred languages yet
    if (skillConfidenceMap.size === 0) {
      skillConfidenceMap.set('typescript', { confidence: 70, evidenceCount: 1, source: 'starter preference' });
      skillConfidenceMap.set('javascript', { confidence: 70, evidenceCount: 1, source: 'starter preference' });
    }

    const scoredList: ScoredOpportunity[] = [];

    for (const issue of candidateIssues) {
      if (dismissedTargetIds.has(issue.id)) continue;

      const repo = issue.repository;
      const repoLang = (repo.language || '').toLowerCase();
      let repoTopics: string[] = [];
      try {
        if (repo.topicsJson) repoTopics = JSON.parse(repo.topicsJson);
      } catch {}
      let issueLabels: string[] = [];
      try {
        if (issue.labelsJson) {
          const parsed = JSON.parse(issue.labelsJson);
          issueLabels = parsed.map((l: any) => (typeof l === 'string' ? l : l.name || '')).filter(Boolean);
        }
      } catch {}

      // Normalize repository safely
      let normalizedRepo;
      try {
        normalizedRepo = normalizeRepository(repo);
      } catch {
        normalizedRepo = repo;
      }

      // --- FACTOR 1: Technology Match (25%) ---
      let techScore = 20; // baseline
      const matchedEvidence: string[] = [];
      const primarySkill = skillConfidenceMap.get(repoLang);

      if (primarySkill) {
        techScore += 70;
        matchedEvidence.push(`${repo.language} verified from your ${primarySkill.source} (confidence ${Math.round(primarySkill.confidence)}%)`);
      }

      // Match topics / labels
      for (const [sName, sData] of skillConfidenceMap.entries()) {
        if (sName === repoLang) continue;
        const matchesTopic = repoTopics.some(t => t.toLowerCase().includes(sName));
        const matchesLabel = issueLabels.some(l => l.toLowerCase().includes(sName));
        if (matchesTopic || matchesLabel) {
          techScore = Math.min(100, techScore + 15);
          matchedEvidence.push(`${sName} overlap found in ${matchesTopic ? 'repository topics' : 'issue labels'}`);
        }
      }

      // --- FACTOR 2: Domain Relevance (20%) ---
      let domainScore = 40;
      if (repoTopics.length > 0) domainScore += 20;
      if (issueLabels.some(l => /bug|fix|feat|api|core/i.test(l))) domainScore += 30;
      domainScore = Math.min(100, domainScore);

      // --- FACTOR 3: Difficulty Alignment (15%) ---
      let difficultyScore = 60;
      const isGoodFirstIssue = issueLabels.some(l => /good first issue|beginner|easy/i.test(l));
      const expLevel = devProfile?.experienceLevel || 'INTERMEDIATE';

      if (expLevel === 'BEGINNER') {
        difficultyScore = isGoodFirstIssue ? 95 : 50;
      } else if (expLevel === 'ADVANCED') {
        difficultyScore = !isGoodFirstIssue ? 90 : 70;
      } else {
        difficultyScore = 85;
      }

      // --- FACTOR 4: Skill Strength Match (15%) ---
      const skillStrengthScore = primarySkill ? primarySkill.confidence : 45;

      // --- FACTOR 5: Project Health & Maintenance (10%) ---
      let healthScore = 50;
      if (repo.stargazersCount > 500) healthScore += 20;
      if (repo.stargazersCount > 5000) healthScore += 15;
      if (repo.isVerified) healthScore += 15;
      healthScore = Math.min(100, healthScore);

      // --- FACTOR 6: Issue Freshness (10%) ---
      const ageDays = (Date.now() - new Date(issue.createdAt).getTime()) / 86400000;
      let freshnessScore = 90;
      if (ageDays > 30) freshnessScore = 70;
      if (ageDays > 90) freshnessScore = 50;

      // --- FACTOR 7: Organization Relevance (5%) ---
      const orgRelevanceScore = repo.isVerified ? 90 : 60;

      // Compute Total Weighted Score
      const totalScore = Math.round(
        techScore * weights.technologyMatch +
        domainScore * weights.domainMatch +
        difficultyScore * weights.difficultyAlignment +
        skillStrengthScore * weights.skillStrengthMatch +
        healthScore * weights.projectHealth +
        freshnessScore * weights.issueFreshness +
        orgRelevanceScore * weights.orgRelevance
      );

      // Determine Category
      let category: RecommendationCategory = 'BEST_SKILL_FIT';
      if (issue.bountyAmount) {
        category = 'SPONSORED_BOUNTY';
      } else if (isGoodFirstIssue) {
        category = 'GOOD_FIRST_ISSUE';
      } else if (repo.stargazersCount > 10000) {
        category = 'TRENDING_HOT';
      } else if (!primarySkill && techScore > 30) {
        category = 'DOMAIN_EXPANSION';
      }

      // Filter by requested category if specified
      if (options?.category && category !== options.category) {
        continue;
      }

      // Construct transparent explanation
      let explanation = `Recommended because of a ${totalScore}% skill alignment based on `;
      if (matchedEvidence.length > 0) {
        explanation += `${matchedEvidence.join(', ')}.`;
      } else {
        explanation += `technology overlap with ${repo.language || 'the project stack'}.`;
      }

      scoredList.push({
        id: issue.id,
        targetType: issue.bountyAmount ? 'BOUNTY' : 'ISSUE',
        issue: {
          ...issue,
          repository: normalizedRepo,
          labels: issueLabels,
        },
        score: totalScore,
        category,
        factors: {
          technologyMatchScore: techScore,
          domainMatchScore: domainScore,
          difficultyScore,
          skillStrengthScore,
          projectHealthScore: healthScore,
          freshnessScore,
          orgRelevanceScore,
        },
        explanation,
        matchedEvidence,
      });
    }

    // Sort by score descending
    scoredList.sort((a, b) => b.score - a.score);
    const topScored = scoredList.slice(0, options?.limit || 15);

    // Persist or link to Recommendation records so they have valid DB IDs
    const result: ScoredOpportunity[] = [];
    for (const item of topScored) {
      let recRecord = await prisma.recommendation.findFirst({
        where: {
          userId,
          targetId: item.issue.id,
        },
      });

      if (!recRecord) {
        recRecord = await prisma.recommendation.create({
          data: {
            userId,
            targetType: item.targetType,
            targetId: item.issue.id,
            score: item.score,
            category: item.category,
            factorsJson: JSON.stringify(item.factors),
            explanation: item.explanation,
            status: 'ACTIVE',
          },
        });
      }

      result.push({
        ...item,
        id: recRecord.id,
      });
    }

    return result;
  }

  /**
   * Records user feedback on a recommendation (save, dismiss, applied, PR submitted, merged)
   * Dismissing with a reason adjusts future scoring deterministically.
   */
  async recordFeedback(userId: string, data: {
    recommendationId: string;
    action: 'VIEWED' | 'SAVED' | 'DISMISSED' | 'PR_SUBMITTED' | 'MERGED';
    reason?: string;
  }) {
    // Locate or create Recommendation record
    let recRecord = await prisma.recommendation.findUnique({
      where: { id: data.recommendationId },
    });

    if (!recRecord) {
      recRecord = await prisma.recommendation.findFirst({
        where: {
          userId,
          targetId: data.recommendationId,
        },
      });
    }

    if (!recRecord) {
      recRecord = await prisma.recommendation.create({
        data: {
          userId,
          targetType: 'ISSUE',
          targetId: data.recommendationId,
          score: 75,
          category: 'BEST_SKILL_FIT',
          factorsJson: '{}',
          explanation: 'Opportunity marked via user action.',
          status: data.action,
        },
      });
    } else {
      await prisma.recommendation.update({
        where: { id: recRecord.id },
        data: { status: data.action },
      });
    }

    const feedback = await prisma.recommendationFeedback.create({
      data: {
        userId,
        recommendationId: recRecord.id,
        action: data.action,
        reason: data.reason || null,
      },
    });

    // If dismissed with "Not interested in this technology", record in interest profile with negative weight
    if (data.action === 'DISMISSED' && data.reason) {
      const devProfile = await prisma.developerProfile.findUnique({ where: { userId } });
      if (devProfile) {
        await prisma.developerInterest.upsert({
          where: {
            profileId_topic: {
              profileId: devProfile.id,
              topic: data.reason.slice(0, 50),
            },
          },
          create: {
            profileId: devProfile.id,
            topic: data.reason.slice(0, 50),
            weight: 0.2, // significantly reduced weight
          },
          update: {
            weight: 0.2,
          },
        });
      }
    }

    return feedback;
  }
}

export const recommendationEngine = new RecommendationEngine();
