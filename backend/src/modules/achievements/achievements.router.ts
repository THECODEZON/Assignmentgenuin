import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { AchievementsController } from './achievements.controller';

const router = Router();

router.use(authenticateToken as any);
router.get('/', AchievementsController.getAchievements as any);
router.get('/user', AchievementsController.getUserAchievements as any);

export default router;
