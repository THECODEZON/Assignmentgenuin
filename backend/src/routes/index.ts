import { Router } from 'express';
import authRouter from '../modules/auth/auth.router';
import questsRouter from '../modules/quests/quests.router';
import submissionsRouter from '../modules/submissions/submissions.router';
import notificationsRouter from '../modules/notifications/notifications.router';
import leaderboardRouter from '../modules/leaderboard/leaderboard.router';
import usersRouter from '../modules/users/users.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/quests', questsRouter);
router.use('/submissions', submissionsRouter);
router.use('/notifications', notificationsRouter);
router.use('/leaderboard', leaderboardRouter);
router.use('/users', usersRouter);

export default router;
