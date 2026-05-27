import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { LeaderboardController } from './leaderboard.controller';

const router = Router();

router.use(authenticateToken as any);
router.get('/', LeaderboardController.getLeaderboard as any);

export default router;
