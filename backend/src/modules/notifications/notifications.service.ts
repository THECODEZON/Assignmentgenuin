import prisma from '../../prisma/client';
import { emitToUser } from './socket';

export class NotificationsService {
  static async createNotification(userId: string, type: string, message: string) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
      },
    });

    emitToUser(userId, 'notification', notification);
    return notification;
  }

  static async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  static async markAsRead(userId: string, id: string) {
    return prisma.notification.update({
      where: { id, userId },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
