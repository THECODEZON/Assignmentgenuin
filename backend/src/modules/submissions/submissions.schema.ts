import { z } from 'zod';

export const submitProofSchema = z.object({
  body: z.object({
    questId: z.string().uuid('Invalid quest ID'),
    proofText: z.string().optional(),
  }),
});

export const moderateSubmissionSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    adminNotes: z.string().optional(),
  }),
});
