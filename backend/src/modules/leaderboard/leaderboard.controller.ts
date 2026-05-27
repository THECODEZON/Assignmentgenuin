import { Request, Response } from 'express';
import { LeaderboardService } from './leaderboard.service';

export class LeaderboardController {
  static async getLeaderboard(req: Request, res: Response) {
    try {
      const standings = await LeaderboardService.getLeaderboard();
      return res.status(200).json(standings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
