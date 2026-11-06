import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Workspace name must be at least 2 characters').max(100, 'Workspace name cannot exceed 100 characters'),
    slug: z.string().trim().min(2, 'Slug must be at least 2 characters').max(50, 'Slug cannot exceed 50 characters').regex(/^[a-z0-9-]+$/, 'Slug must consist of lowercase alphanumeric characters and hyphens'),
    description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  }),
});

export const addWorkspaceMemberSchema = z.object({
  body: z.object({
    targetUsername: z.string().trim().min(1).optional(),
    userId: z.string().trim().min(1).optional(),
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).optional().default('MEMBER'),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
  }),
});
