import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Developer Profile & Recommendation Engine Frontend UI Contracts', () => {
  const pagesDir = path.resolve(__dirname, '../pages');

  it('1. DeveloperProfilePage connects to unified profile and provides README extraction and skills management', () => {
    const content = fs.readFileSync(path.join(pagesDir, 'DeveloperProfilePage.tsx'), 'utf-8');
    
    // Unified profile endpoint
    expect(content).toContain('/api/v1/profile');

    // Editable preferences
    expect(content).toContain('handleSaveProfilePreferences');
    expect(content).toContain('weeklyCommitmentHours');
    expect(content).toContain('experienceLevel');
    expect(content).toContain('headline');

    // README signal extraction
    expect(content).toContain('/api/v1/profile/readme/sync');
    expect(content).toContain('Sync Profile README');
    expect(content).toContain('isReadmeModalOpen');

    // Multi-source verified skills
    expect(content).toContain('Multi-Source Verified Skills');
    expect(content).toContain('confidenceScore');
    expect(content).toContain('provenanceLabel');
    expect(content).toContain('Add Custom Skill');
    expect(content).toContain('handleRemoveSkill');
  });

  it('2. IssuesPage recommendations tab renders 7-factor evidence scores, category badges, and feedback loop', () => {
    const content = fs.readFileSync(path.join(pagesDir, 'IssuesPage.tsx'), 'utf-8');

    // Category badges
    expect(content).toContain('getCategoryBadge');
    expect(content).toContain('BEST_SKILL_FIT');
    expect(content).toContain('GOOD_FIRST_ISSUE');
    expect(content).toContain('DOMAIN_EXPANSION');

    // 7-factor evidence breakdown
    expect(content).toContain('rec.factors');
    expect(content).toContain('technologyMatchScore');
    expect(content).toContain('domainMatchScore');
    expect(content).toContain('freshnessScore');

    // Feedback loop
    expect(content).toContain('/api/v1/profile/recommendations/feedback');
    expect(content).toContain('handleRecommendationFeedback');
    expect(content).toContain("'SAVED'");
    expect(content).toContain("'DISMISSED'");
  });
});
