import { describe, expect, it, jest, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { AuthService } from '../src/modules/auth/auth.service';

jest.mock('../src/modules/auth/auth.service');

describe('Auth Router Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.mocked(AuthService.register).mockResolvedValue(mockUser as any);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(expect.objectContaining({
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
      }));
      expect(AuthService.register).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
    });

    it('should return 400 validation error for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return access/refresh tokens', async () => {
      const mockLoginResponse = {
        user: { id: 'user-123', username: 'testuser', email: 'test@example.com', role: 'USER' },
        accessToken: 'access-token-xyz',
        refreshToken: 'refresh-token-abc',
      };

      jest.mocked(AuthService.login).mockResolvedValue(mockLoginResponse as any);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockLoginResponse);
    });
  });
});
