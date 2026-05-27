import prisma from '../../prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { emitToUser, emitToAll } from '../notifications/socket';
import { AchievementsService } from '../achievements/achievements.service';

export class SubmissionsService {
  static async submitProof(userId: string, questId: string, proofText?: string, proofUrl?: string) {
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!quest) {
      throw new Error('Quest not found');
    }

    if (quest.status !== 'PUBLISHED') {
      throw new Error('Quest is not currently active');
    }

    // Check if there is already a pending or approved submission
    const existing = await prisma.submission.findFirst({
      where: {
        userId,
        questId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existing) {
      if (existing.status === 'PENDING') {
        throw new Error('You already have a pending submission for this quest');
      } else {
        throw new Error('You have already completed this quest');
      }
    }

    return prisma.submission.create({
      data: {
        userId,
        questId,
        proofText,
        proofUrl,
        status: 'PENDING',
      },
      include: {
        quest: true,
      },
    });
  }

  static async getSubmissions(filters: { status?: string; userId?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;

    return prisma.submission.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, email: true, xp: true, level: true } },
        quest: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getSubmissionById(id: string) {
    return prisma.submission.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, email: true, xp: true, level: true } },
        quest: true,
      },
    });
  }

  static async moderateSubmission(id: string, status: 'APPROVED' | 'REJECTED', adminNotes?: string) {
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { quest: true, user: true },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    if (submission.status !== 'PENDING') {
      throw new Error('Submission is already processed');
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: { status, adminNotes },
      include: { quest: true, user: true },
    });

    const userId = submission.userId;
    const quest = submission.quest;
    const user = submission.user;

    if (status === 'APPROVED') {
      // 1. Calculate new XP and level
      const addedXp = quest.rewardXp;
      const addedPoints = quest.rewardPoints;

      const newXp = user.xp + addedXp;
      const newPoints = user.points + addedPoints;

      // Level equation: 1 level per 1000 XP
      const newLevel = Math.floor(newXp / 1000) + 1;
      const didLevelUp = newLevel > user.level;

      // 2. Update user
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: newXp,
          points: newPoints,
          level: newLevel,
        },
      });

      // 3. Log Rewards
      if (addedXp > 0) {
        await prisma.reward.create({
          data: {
            userId,
            type: 'XP',
            amount: addedXp,
            source: 'QUEST',
            sourceId: quest.id,
          },
        });
      }
      if (addedPoints > 0) {
        await prisma.reward.create({
          data: {
            userId,
            type: 'POINTS',
            amount: addedPoints,
            source: 'QUEST',
            sourceId: quest.id,
          },
        });
      }

      // 4. Create Notifications & Real-Time Sync
      const completionMsg = `Quest Completed: "${quest.title}" approved! You earned +${addedXp} XP and +${addedPoints} Points.`;
      await NotificationsService.createNotification(userId, 'QUEST_COMPLETED', completionMsg);

      if (didLevelUp) {
        const levelUpMsg = `Congratulations! You leveled up to Level ${newLevel}!`;
        await NotificationsService.createNotification(userId, 'REWARD_EARNED', levelUpMsg);
        emitToUser(userId, 'level_up', { userId, level: newLevel, xp: newXp });
      }

      // 5. Check and Unlock Achievements
      await AchievementsService.checkAndUnlockAchievements(userId);

      // 6. Broadcast Leaderboard update signal
      emitToAll('leaderboard_updated', {
        message: 'The leaderboard rankings have changed!',
      });

    } else if (status === 'REJECTED') {
      const rejectionMsg = `Quest Submission Rejected: "${quest.title}". Reason: ${adminNotes || 'No notes provided.'}`;
      await NotificationsService.createNotification(userId, 'QUEST_COMPLETED', rejectionMsg);
    }

    return updatedSubmission;
  }
}
