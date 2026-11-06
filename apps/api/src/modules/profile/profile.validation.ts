import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    headline: z.string().trim().max(150, 'Headline cannot exceed 150 characters').optional().nullable(),
    primaryFocus: z.string().trim().max(100, 'Primary focus cannot exceed 100 characters').optional().nullable(),
    bio: z.string().trim().max(1000, 'Bio cannot exceed 1000 characters').optional().nullable(),
    preferredLanguages: z.array(z.string().trim().max(50)).max(50).optional(),
    domains: z.array(z.string().trim().max(50)).max(50).optional(),
    experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    weeklyAvailabilityHours: z.number().int().min(0).max(168).optional().nullable(),
    weeklyCommitmentHours: z.number().int().min(0).max(168).optional().nullable(),
  }),
});

export const upsertSkillSchema = z.object({
  body: z.object({
    skillName: z.string().trim().min(1, 'Skill name is required').max(50, 'Skill name cannot exceed 50 characters').optional(),
    name: z.string().trim().min(1).max(50).optional(),
    category: z.string().trim().max(50).optional().default('TOOLING'),
    confidenceScore: z.number().min(0).max(100).optional(),
    provenanceLabel: z.string().optional(),
  }).passthrough().refine(data => Boolean(data.skillName || data.name), {
    message: 'Either skillName or name is required',
  }),
});

export const recommendationFeedbackSchema = z.object({
  body: z.object({
    recommendationId: z.string().trim().min(1).optional(),
    targetId: z.string().trim().min(1).optional(),
    action: z.enum(['ACCEPTED', 'DISMISSED', 'COMPLETED', 'SAVED']),
  }),
});

export const getRecommendationsSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(15),
  }).optional(),
});
