import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { AchievementsService } from './achievements.service';

export class AchievementsController {
  static async getAchievements(req: AuthenticatedRequest, res: Response) {
    try {
      const achievements = await AchievementsService.getAchievements();
      return res.status(200).json(achievements);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getUserAchievements(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const unlocked = await AchievementsService.getUserAchievements(userId);
      return res.status(200).json(unlocked);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
