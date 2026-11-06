import { z } from 'zod';

export const addToPipelineSchema = z.object({
  body: z.object({
    issueId: z.string().trim().min(1, 'Issue ID is required'),
    stage: z.enum(['SHORTLISTED', 'EXPLORING', 'PREPARING', 'WORKING', 'PR_SUBMITTED', 'MERGED']).optional().default('SHORTLISTED'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
    deadline: z.string().optional().nullable(),
    notes: z.string().max(2000, 'Notes cannot exceed 2000 characters').optional().nullable(),
  }),
});

export const updatePipelineStageSchema = z.object({
  body: z.object({
    stage: z.string().trim().optional(),
    priority: z.string().trim().optional(),
    deadline: z.string().optional().nullable(),
    notes: z.string().max(2000, 'Notes cannot exceed 2000 characters').optional().nullable(),
  }).passthrough(),
});

export const toggleBookmarkSchema = z.object({
  body: z.object({
    targetType: z.string().trim().min(1),
    repositoryId: z.string().trim().optional(),
    issueId: z.string().trim().optional(),
    organizationId: z.string().trim().optional(),
    targetId: z.string().trim().optional(),
  }).passthrough(),
});

export const updateSelfbotConfigSchema = z.object({
  body: z.object({
    repository: z.string().trim().min(1, 'Repository name is required').max(200),
    isEnabled: z.boolean().optional(),
    autoGreet: z.boolean().optional(),
    autoTriage: z.boolean().optional(),
    welcomeTemplate: z.string().max(5000).optional(),
    labelRules: z.any().optional(),
  }),
});
