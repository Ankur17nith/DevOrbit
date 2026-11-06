import { z } from 'zod';

export const updateDsaProgressSchema = z.object({
  body: z.object({
    status: z.enum(['TODO', 'ATTEMPTED', 'SOLVED', 'REVISE']),
    confidenceRating: z.number().int().min(0).max(5).optional(),
    solutionMode: z.enum(['INDEPENDENT', 'WITH_HINTS', 'WITH_EDITORIAL', 'WITH_AI']).optional(),
    notes: z.string().max(5000).optional(),
    codeSnippet: z.string().max(20000).optional(),
    timeSpentMinutes: z.number().int().min(0).max(1440).optional(),
    timeSpentSeconds: z.number().optional(),
    hintUsed: z.boolean().optional(),
    repeatedMistakes: z.array(z.string()).optional(),
  }).passthrough(),
});

export const submitReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(0, 'Rating must be between 0 and 5').max(5, 'Rating must be between 0 and 5'),
  }),
});

export const importProblemsSchema = z.object({
  body: z.object({
    type: z.enum(['JSON', 'CSV']).optional().default('JSON'),
    content: z.string().min(1, 'Import content is required').max(5000000, 'Import content is too large'),
    defaultCategory: z.string().optional(),
  }),
});
