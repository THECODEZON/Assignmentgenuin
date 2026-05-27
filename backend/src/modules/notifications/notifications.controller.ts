import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { NotificationsService } from './notifications.service';

export class NotificationsController {
  static async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const notifications = await NotificationsService.getUserNotifications(userId);
      return res.status(200).json(notifications);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params as { id: string };
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const notification = await NotificationsService.markAsRead(userId, id);
      return res.status(200).json(notification);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      await NotificationsService.markAllAsRead(userId);
      return res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
