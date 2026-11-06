import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').transform(val => val.toLowerCase().trim()),
    username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Username must be alphanumeric'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password cannot exceed 72 characters'),
    name: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    login: z.string().min(1, 'Email or username is required').transform(val => val.trim()),
    password: z.string().min(1, 'Password is required').max(72, 'Password cannot exceed 72 characters'),
  }),
});
