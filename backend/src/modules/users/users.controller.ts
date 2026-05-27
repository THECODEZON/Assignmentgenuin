import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { UsersService } from './users.service';

export class UsersController {
  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const info = await UsersService.getMe(userId);
      return res.status(200).json(info);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  static async getUserProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const profile = await UsersService.getUserProfile(id);
      return res.status(200).json(profile);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  static async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await UsersService.getAllUsers();
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateUserRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { role } = req.body;

      if (!id || !role) {
        return res.status(400).json({ error: 'User ID and Role are required' });
      }

      const updated = await UsersService.updateUserRole(id, role);
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getAdminStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await UsersService.getAdminStats();
      return res.status(200).json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
