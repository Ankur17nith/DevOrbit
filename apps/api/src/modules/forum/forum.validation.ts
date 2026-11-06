import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
    content: z.string().trim().min(5, 'Content must be at least 5 characters').max(50000, 'Content cannot exceed 50000 characters'),
    tags: z.array(z.string().trim().max(30)).max(10).optional(),
  }),
});

export const replyPostSchema = z.object({
  body: z.object({
    content: z.string().trim().min(1, 'Reply content cannot be empty').max(20000, 'Reply content cannot exceed 20000 characters'),
  }),
});
