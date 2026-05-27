import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;
      const user = await AuthService.register(username, email, password);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const data = await AuthService.login(email, password);
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const data = await AuthService.refresh(refreshToken);
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const message = await AuthService.logout(refreshToken);
      return res.status(200).json(message);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
