import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../../utils/logger';

let io: Server;
const userSockets = new Map<string, string[]>(); // userId -> socketIds

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      logger.warn(`Socket connection rejected: Token missing`);
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey1234567890!';
      const decoded = jwt.verify(token as string, JWT_SECRET) as any;
      socket.data = { userId: decoded.userId, role: decoded.role };
      next();
    } catch (err) {
      logger.warn(`Socket connection rejected: Invalid token`);
      return next(new Error('Authentication error: Token invalid'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    logger.info(`Socket connected: ${socket.id} for user ${userId}`);

    if (userId) {
      const current = userSockets.get(userId) || [];
      userSockets.set(userId, [...current, socket.id]);
    }

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      if (userId) {
        const current = userSockets.get(userId) || [];
        const filtered = current.filter(id => id !== socket.id);
        if (filtered.length === 0) {
          userSockets.delete(userId);
        } else {
          userSockets.set(userId, filtered);
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
  const socketIds = userSockets.get(userId);
  if (socketIds && socketIds.length > 0) {
    socketIds.forEach((socketId) => {
      if (io) io.to(socketId).emit(event, data);
    });
  }
};

export const emitToAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};
export const getActiveConnectionsCount = (): number => {
  return io ? io.engine.clientsCount : 0;
};
