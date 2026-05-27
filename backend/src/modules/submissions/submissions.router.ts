import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import { validateRequest } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import { moderateSubmissionSchema } from './submissions.schema';
import { SubmissionsController } from './submissions.controller';

const router = Router();

router.use(authenticateToken as any);

router.post('/', upload.single('proof'), SubmissionsController.submitProof as any);
router.get('/', SubmissionsController.getSubmissions as any);
router.get('/:id', SubmissionsController.getSubmissionById as any);

// Admin moderation
router.patch(
  '/:id/moderate',
  requireRole(['ADMIN']),
  validateRequest(moderateSubmissionSchema) as any,
  SubmissionsController.moderateSubmission as any
);

export default router;
