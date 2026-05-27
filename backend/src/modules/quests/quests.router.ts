import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import { validateRequest } from '../../middleware/validate';
import { createQuestSchema, updateQuestSchema } from './quests.schema';
import { QuestsController } from './quests.controller';

const router = Router();

router.use(authenticateToken as any);

router.get('/', QuestsController.getQuests as any);
router.post('/check-expirations', QuestsController.triggerExpirationCheck as any);
router.get('/:id', QuestsController.getQuestById as any);

// Admin only endpoints
router.post('/', requireRole(['ADMIN']), validateRequest(createQuestSchema) as any, QuestsController.createQuest as any);
router.put('/:id', requireRole(['ADMIN']), validateRequest(updateQuestSchema) as any, QuestsController.updateQuest as any);
router.delete('/:id', requireRole(['ADMIN']), QuestsController.deleteQuest as any);
router.post('/:id/publish', requireRole(['ADMIN']), QuestsController.publishQuest as any);

export default router;
