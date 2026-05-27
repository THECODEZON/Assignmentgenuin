import { describe, expect, it, jest, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { QuestsService } from '../src/modules/quests/quests.service';
import { SubmissionsService } from '../src/modules/submissions/submissions.service';
import { verifyAccessToken } from '../src/utils/jwt';

jest.mock('../src/modules/quests/quests.service');
jest.mock('../src/modules/submissions/submissions.service');
jest.mock('../src/utils/jwt');

describe('Quests and Submissions Router Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/quests', () => {
    it('should return 401 when token is missing', async () => {
      const res = await request(app).get('/api/quests');
      expect(res.status).toBe(401);
    });

    it('should return 200 and quest list when authenticated', async () => {
      jest.mocked(verifyAccessToken).mockReturnValue({ userId: 'user-123', role: 'USER' } as any);
      jest.mocked(QuestsService.getQuests).mockResolvedValue([
        { id: 'quest-1', title: 'Daily match', type: 'DAILY' },
      ] as any);

      const res = await request(app)
        .get('/api/quests')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Daily match');
    });
  });

  describe('POST /api/quests', () => {
    it('should return 403 Forbidden for non-admin user', async () => {
      jest.mocked(verifyAccessToken).mockReturnValue({ userId: 'user-123', role: 'USER' } as any);

      const res = await request(app)
        .post('/api/quests')
        .set('Authorization', 'Bearer user-token')
        .send({
          title: 'Admin Quest',
          description: 'A special quest',
          type: 'DAILY',
        });

      expect(res.status).toBe(403);
    });

    it('should allow Admin to create a draft quest successfully', async () => {
      jest.mocked(verifyAccessToken).mockReturnValue({ userId: 'admin-123', role: 'ADMIN' } as any);
      const mockCreatedQuest = {
        id: 'quest-2',
        title: 'Epic Challenge',
        description: 'Do something epic',
        type: 'WEEKLY',
        status: 'DRAFT',
      };
      jest.mocked(QuestsService.createQuest).mockResolvedValue(mockCreatedQuest as any);

      const res = await request(app)
        .post('/api/quests')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: 'Epic Challenge',
          description: 'Do something epic',
          type: 'WEEKLY',
          rewardXp: 200,
          rewardPoints: 100,
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('DRAFT');
      expect(res.body.title).toBe('Epic Challenge');
    });
  });

  describe('POST /api/submissions', () => {
    it('should allow user to submit proof of completion', async () => {
      jest.mocked(verifyAccessToken).mockReturnValue({ userId: 'user-123', role: 'USER' } as any);
      const mockSubmission = {
        id: 'sub-1',
        userId: 'user-123',
        questId: 'quest-2',
        proofText: 'I finished the daily game match.',
        status: 'PENDING',
      };
      jest.mocked(SubmissionsService.submitProof).mockResolvedValue(mockSubmission as any);

      const res = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer user-token')
        .send({
          questId: 'quest-2',
          proofText: 'I finished the daily game match.',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('PENDING');
      expect(res.body.proofText).toBe('I finished the daily game match.');
    });
  });
});
