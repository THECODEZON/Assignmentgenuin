import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { QuestsService } from './quests.service';

export class QuestsController {
  static async createQuest(req: AuthenticatedRequest, res: Response) {
    try {
      const quest = await QuestsService.createQuest(req.body);
      return res.status(201).json(quest);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getQuests(req: AuthenticatedRequest, res: Response) {
    try {
      const status = req.query.status as string;
      const type = req.query.type as string;
      const userId = req.user?.userId;

      const quests = await QuestsService.getQuests({ status, type, userId });
      return res.status(200).json(quests);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getQuestById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const userId = req.user?.userId;
      const quest = await QuestsService.getQuestById(id, userId);

      if (!quest) {
        return res.status(404).json({ error: 'Quest not found' });
      }
      return res.status(200).json(quest);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateQuest(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const quest = await QuestsService.updateQuest(id, req.body);
      return res.status(200).json(quest);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async deleteQuest(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params as { id: string };
      await QuestsService.deleteQuest(id);
      return res.status(200).json({ message: 'Quest deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async publishQuest(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const quest = await QuestsService.publishQuest(id);
      return res.status(200).json(quest);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async triggerExpirationCheck(req: AuthenticatedRequest, res: Response) {
    try {
      const expired = await QuestsService.checkExpirations();
      return res.status(200).json({ message: 'Expiration check completed', expiredCount: expired.length });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
