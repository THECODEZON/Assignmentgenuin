import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { SubmissionsService } from './submissions.service';

export class SubmissionsController {
  static async submitProof(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { questId, proofText } = req.body;
      let proofUrl = undefined;

      if (req.file) {
        proofUrl = `/uploads/${req.file.filename}`;
      }

      if (!questId) {
        return res.status(400).json({ error: 'Quest ID is required' });
      }

      const submission = await SubmissionsService.submitProof(userId, questId, proofText, proofUrl);
      return res.status(201).json(submission);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getSubmissions(req: AuthenticatedRequest, res: Response) {
    try {
      const status = req.query.status as string;
      const userId = req.query.userId as string;

      const currentUserId = req.user?.userId;
      const role = req.user?.role;

      let targetUserId = userId;
      if (role !== 'ADMIN') {
        targetUserId = currentUserId!;
      }

      const submissions = await SubmissionsService.getSubmissions({ status, userId: targetUserId });
      return res.status(200).json(submissions);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getSubmissionById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const submission = await SubmissionsService.getSubmissionById(id);

      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      if (req.user?.role !== 'ADMIN' && submission.userId !== req.user?.userId) {
        return res.status(403).json({ error: 'Forbidden: Access denied' });
      }

      return res.status(200).json(submission);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async moderateSubmission(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { status, adminNotes } = req.body;

      const submission = await SubmissionsService.moderateSubmission(id, status, adminNotes);
      return res.status(200).json(submission);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
