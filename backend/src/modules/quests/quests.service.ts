import prisma from '../../prisma/client';
import { emitToAll } from '../notifications/socket';
import { NotificationsService } from '../notifications/notifications.service';

export class QuestsService {
  static async createQuest(data: any) {
    return prisma.quest.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        targetValue: data.targetValue ?? 1,
        rewardXp: data.rewardXp ?? 100,
        rewardPoints: data.rewardPoints ?? 50,
        rewardBadge: data.rewardBadge,
        status: data.status ?? 'DRAFT',
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  static async getQuests(filters: { status?: string; type?: string; userId?: string }) {
    const where: any = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.type) {
      where.type = filters.type;
    }

    const quests = await prisma.quest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        submissions: filters.userId ? {
          where: { userId: filters.userId }
        } : false
      }
    });

    return quests;
  }

  static async getQuestById(id: string, userId?: string) {
    return prisma.quest.findUnique({
      where: { id },
      include: {
        submissions: userId ? {
          where: { userId }
        } : true
      }
    });
  }

  static async updateQuest(id: string, data: any) {
    const updateData: any = { ...data };
    if (data.expiresAt) {
      updateData.expiresAt = new Date(data.expiresAt);
    }
    return prisma.quest.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteQuest(id: string) {
    return prisma.quest.delete({
      where: { id },
    });
  }

  static async publishQuest(id: string) {
    const quest = await prisma.quest.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    // Notify all users in real-time
    emitToAll('quest_published', {
      message: `A new quest has been published: ${quest.title}!`,
      quest,
    });

    // We can also create in-app notifications for all users
    const users = await prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
      await NotificationsService.createNotification(
        user.id,
        'ADMIN_ANNOUNCEMENT',
        `New ${quest.type.toLowerCase()} quest: "${quest.title}" is now available!`
      );
    }

    return quest;
  }

  static async checkExpirations() {
    const now = new Date();
    const expiredQuests = await prisma.quest.findMany({
      where: {
        status: 'PUBLISHED',
        expiresAt: {
          lt: now,
        },
      },
    });

    if (expiredQuests.length > 0) {
      const ids = expiredQuests.map((q: any) => q.id);
      await prisma.quest.updateMany({
        where: { id: { in: ids } },
        data: { status: 'EXPIRED' },
      });

      emitToAll('quests_expired', { ids });
    }

    return expiredQuests;
  }
}
