import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { NotificationsController } from './notifications.controller';

const router = Router();

router.use(authenticateToken as any);
router.get('/', NotificationsController.getNotifications as any);
router.patch('/read-all', NotificationsController.markAllAsRead as any);
router.patch('/:id/read', NotificationsController.markAsRead as any);

export default router;
