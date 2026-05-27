import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema';
import { authRateLimiter } from '../../middleware/rateLimit';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerSchema) as any, AuthController.register as any);
router.post('/login', authRateLimiter, validateRequest(loginSchema) as any, AuthController.login as any);
router.post('/refresh', validateRequest(refreshTokenSchema) as any, AuthController.refresh as any);
router.post('/logout', AuthController.logout as any);

export default router;
