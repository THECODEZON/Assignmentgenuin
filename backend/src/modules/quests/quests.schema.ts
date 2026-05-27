import { z } from 'zod';

export const createQuestSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long'),
    description: z.string().min(5, 'Description must be at least 5 characters long'),
    type: z.enum(['DAILY', 'WEEKLY', 'ACHIEVEMENT']),
    targetValue: z.number().int().positive().optional(),
    rewardXp: z.number().int().nonnegative().optional(),
    rewardPoints: z.number().int().nonnegative().optional(),
    rewardBadge: z.string().optional().nullable(),
    expiresAt: z.string().datetime().optional().nullable(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'EXPIRED']).optional(),
  }),
});

export const updateQuestSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    type: z.enum(['DAILY', 'WEEKLY', 'ACHIEVEMENT']).optional(),
    targetValue: z.number().int().positive().optional(),
    rewardXp: z.number().int().nonnegative().optional(),
    rewardPoints: z.number().int().nonnegative().optional(),
    rewardBadge: z.string().optional().nullable(),
    expiresAt: z.string().datetime().optional().nullable(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'EXPIRED']).optional(),
  }),
});
