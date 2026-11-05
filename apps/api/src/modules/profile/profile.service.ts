import { prisma } from '../../config/index.js';
import { NotFoundError, BadRequestError } from '../../lib/errors.js';
import { extractSignalsFromReadme, extractReadmeSignals } from './readme_extractor.js';

export interface UpdateProfileInput {
  headline?: string;
  primaryFocus?: string;
  bio?: string;
  preferredLanguages?: string[];
  domains?: string[];
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  weeklyAvailabilityHours?: number;
  weeklyCommitmentHours?: number;
}

export class ProfileService {
  /**
   * Retrieves unified developer intelligence profile combining
   * GitHub code metrics, profile README signals, Codeforces, LeetCode, and manual preferences.
   */
  async getUnifiedProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        developerProfile: {
          include: {
            skills: { orderBy: { confidenceScore: 'desc' } },
            interests: true,
            readmeSnapshots: {
              include: { extractedSignals: true },
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
        integrations: true,
        skillProfiles: { orderBy: { confidenceScore: 'desc' } },
        githubRepos: { orderBy: { stargazersCount: 'desc' }, take: 10 },
        contributionMetric: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Ensure DeveloperProfile row exists
    let devProfile = user.developerProfile;
    if (!devProfile) {
      devProfile = await prisma.developerProfile.create({
        data: {
          userId,
          headline: 'Full-Stack & Systems Open Source Developer',
          experienceLevel: 'INTERMEDIATE',
          weeklyAvailabilityHours: 10,
        },
        include: {
          skills: true,
          interests: true,
          readmeSnapshots: { include: { extractedSignals: true } },
        },
      });
    }

    // Merge skills across sources:
    // 1. Stored manual & README skills from DeveloperSkill
    // 2. Verified code skills from UserSkillProfile (GitHub AST/language bytes)
    const skillMap = new Map<string, {
      id: string;
      skillName: string;
      category: string;
      confidenceScore: number;
      source: string;
      evidenceCount: number;
      provenanceLabel: string;
    }>();

    // Add verified GitHub code skills
    for (const s of user.skillProfiles) {
      let evidenceList = [];
      try {
        if (s.verifiedEvidenceJson) evidenceList = JSON.parse(s.verifiedEvidenceJson);
      } catch {}

      skillMap.set(s.skillName.toLowerCase(), {
        id: s.id,
        skillName: s.skillName,
        category: s.category || 'LANGUAGE',
        confidenceScore: Math.round(s.confidenceScore),
        source: 'GITHUB_CODEBASE',
        evidenceCount: Array.isArray(evidenceList) ? evidenceList.length : 1,
        provenanceLabel: `Verified across ${evidenceList.length || 1} GitHub codebase repos`,
      });
    }

    // Overlay or add developer profile skills
    for (const s of devProfile.skills) {
      const key = s.skillName.toLowerCase();
      const existing = skillMap.get(key);
      if (existing) {
        // Boost confidence if verified by both code and stated in README / profile
        existing.confidenceScore = Math.min(99, Math.max(existing.confidenceScore, s.confidenceScore));
        existing.provenanceLabel = `${existing.provenanceLabel} & confirmed in developer profile`;
      } else {
        skillMap.set(key, {
          id: s.id,
          skillName: s.skillName,
          category: s.category,
          confidenceScore: s.confidenceScore,
          source: s.source,
          evidenceCount: s.evidenceCount,
          provenanceLabel: s.source === 'GITHUB_README' ? 'Extracted from GitHub Profile README' : 'Configured in developer skillset',
        });
      }
    }

    // Fetch integration handles
    const githubCred = user.integrations.find(i => i.provider === 'GITHUB');
    const codeforcesCred = user.integrations.find(i => i.provider === 'CODEFORCES');
    const leetcodeCred = user.integrations.find(i => i.provider === 'LEETCODE');

    // Parse preferred languages & domains
    let preferredLanguages: string[] = [];
    let domains: string[] = [];
    try {
      if (devProfile.preferredLanguagesJson) preferredLanguages = JSON.parse(devProfile.preferredLanguagesJson);
    } catch {}
    try {
      if (devProfile.domainsJson) domains = JSON.parse(devProfile.domainsJson);
    } catch {}

    const unifiedSkills = Array.from(skillMap.values()).sort((a, b) => b.confidenceScore - a.confidenceScore);

    return {
      userId: user.id,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl,
        email: user.email,
      },
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      headline: devProfile.headline,
      bio: devProfile.bio,
      experienceLevel: devProfile.experienceLevel,
      weeklyAvailabilityHours: devProfile.weeklyAvailabilityHours,
      weeklyCommitmentHours: devProfile.weeklyAvailabilityHours,
      preferredLanguages,
      domains,
      connectedAccounts: {
        github: githubCred ? { connected: true, username: githubCred.username } : { connected: false },
        codeforces: codeforcesCred ? { connected: true, username: codeforcesCred.username } : { connected: false },
        leetcode: leetcodeCred ? { connected: true, username: leetcodeCred.username } : { connected: false },
      },
      skills: unifiedSkills,
      interests: devProfile.interests.map(i => ({ topic: i.topic, weight: i.weight })),
      recentReadmeSnapshots: devProfile.readmeSnapshots.map(snap => ({
        id: snap.id,
        sourceType: snap.sourceType,
        repositoryFullName: snap.repositoryFullName,
        signalsCount: snap.extractedSignals.length,
        createdAt: snap.createdAt,
      })),
      githubMetrics: user.contributionMetric ? {
        totalCommits: user.contributionMetric.totalCommits,
        totalPullRequests: user.contributionMetric.totalPullRequests,
        mergedPullRequests: user.contributionMetric.mergedPullRequests,
        mergeRate: user.contributionMetric.mergeRate,
        activeStreak: user.contributionMetric.activeStreak,
      } : null,
      topRepositories: user.githubRepos.map(r => ({
        id: r.id,
        fullName: r.fullName,
        description: r.description,
        language: r.language,
        stars: r.stargazersCount,
        forks: r.forksCount,
      })),
    };
  }

  /**
   * Updates manual profile preferences
   */
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const data: any = {};
    if (input.headline !== undefined) data.headline = input.headline;
    if (input.primaryFocus !== undefined) data.headline = input.primaryFocus;
    if (input.bio !== undefined) data.bio = input.bio;
    if (input.experienceLevel) data.experienceLevel = input.experienceLevel;
    if (input.weeklyAvailabilityHours !== undefined) data.weeklyAvailabilityHours = input.weeklyAvailabilityHours;
    if (input.weeklyCommitmentHours !== undefined) data.weeklyAvailabilityHours = input.weeklyCommitmentHours;
    if (input.preferredLanguages) data.preferredLanguagesJson = JSON.stringify(input.preferredLanguages);
    if (input.domains) data.domainsJson = JSON.stringify(input.domains);

    const updated = await prisma.developerProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });

    return {
      ...updated,
      weeklyCommitmentHours: updated.weeklyAvailabilityHours,
    };
  }

  /**
   * Adds or updates a developer skill
   */
  async upsertSkill(userId: string, skill: {
    skillName: string;
    category?: string;
    confidenceScore?: number;
    source?: string;
  }) {
    if (!skill.skillName || skill.skillName.trim().length === 0) {
      throw new BadRequestError('Skill name is required');
    }

    let devProfile = await prisma.developerProfile.findUnique({ where: { userId } });
    if (!devProfile) {
      devProfile = await prisma.developerProfile.create({ data: { userId } });
    }

    const cleanName = skill.skillName.trim();
    const confidence = Math.min(100, Math.max(1, skill.confidenceScore ?? 75));
    const category = skill.category || 'LANGUAGE';
    const source = skill.source || 'MANUAL';

    const savedSkill = await prisma.developerSkill.upsert({
      where: {
        profileId_skillName: {
          profileId: devProfile.id,
          skillName: cleanName,
        },
      },
      create: {
        profileId: devProfile.id,
        skillName: cleanName,
        category,
        confidenceScore: confidence,
        source,
      },
      update: {
        category,
        confidenceScore: confidence,
        source,
      },
    });

    return savedSkill;
  }

  /**
   * Removes a skill from developer profile
   */
  async removeSkill(userId: string, skillName: string) {
    const devProfile = await prisma.developerProfile.findUnique({ where: { userId } });
    if (!devProfile) return { removed: false };

    await prisma.developerSkill.deleteMany({
      where: {
        profileId: devProfile.id,
        skillName: { equals: skillName },
      },
    });

    return { removed: true };
  }

  /**
   * Ingests and processes a profile README text, extracting signals and updating skills.
   */
  async processReadmeSignals(userId: string, content: string, repositoryFullName?: string) {
    let devProfile = await prisma.developerProfile.findUnique({ where: { userId } });
    if (!devProfile) {
      devProfile = await prisma.developerProfile.create({ data: { userId } });
    }

    const signals = extractSignalsFromReadme(content);

    // Create snapshot
    const snapshot = await prisma.readmeSnapshot.create({
      data: {
        profileId: devProfile.id,
        sourceType: repositoryFullName ? 'REPO_README' : 'PROFILE_README',
        repositoryFullName: repositoryFullName || null,
        contentRaw: content.slice(0, 10000), // bounded snapshot
        extractedSignals: {
          create: signals.map(s => ({
            signalType: s.signalType,
            signalKey: s.signalKey,
            signalValue: s.signalValue,
            confidence: s.confidence,
          })),
        },
      },
      include: { extractedSignals: true },
    });

    // Automatically register extracted languages and frameworks as skills
    for (const sig of signals) {
      if (['LANGUAGE', 'FRAMEWORK', 'DATABASE', 'TOOL'].includes(sig.signalType)) {
        await prisma.developerSkill.upsert({
          where: {
            profileId_skillName: {
              profileId: devProfile.id,
              skillName: sig.signalKey,
            },
          },
          create: {
            profileId: devProfile.id,
            skillName: sig.signalKey,
            category: sig.signalType,
            confidenceScore: Math.round(sig.confidence * 85),
            source: 'GITHUB_README',
            evidenceCount: 1,
          },
          update: {
            source: 'GITHUB_README',
          },
        });
      }
    }

    return {
      snapshotId: snapshot.id,
      signalsCount: signals.length,
      signals,
      extractedSignals: extractReadmeSignals(content, repositoryFullName || 'profile_readme'),
    };
  }
}

export const profileService = new ProfileService();
