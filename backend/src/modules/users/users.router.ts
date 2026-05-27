import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import { UsersController } from './users.controller';

const router = Router();

router.use(authenticateToken as any);

router.get('/me', UsersController.getMe as any);
router.get('/stats', requireRole(['ADMIN']), UsersController.getAdminStats as any);
router.get('/:id', UsersController.getUserProfile as any);

// Admin user management
router.get('/', requireRole(['ADMIN']), UsersController.getAllUsers as any);
router.patch('/:id/role', requireRole(['ADMIN']), UsersController.updateUserRole as any);

export default router;
