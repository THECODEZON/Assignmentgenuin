import prisma from '../../prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { emitToUser } from '../notifications/socket';

export class AchievementsService {
  // Seed initial achievements
  static async seedAchievements() {
    const defaultAchievements = [
      {
        name: 'First Steps',
        description: 'Complete your first quest successfully!',
        badgeUrl: '🚀',
        xpRequired: 0,
        pointsRequired: 0,
      },
      {
        name: 'Quest Enthusiast',
        description: 'Successfully complete 5 quests.',
        badgeUrl: '🔥',
        xpRequired: 0,
        pointsRequired: 0,
      },
      {
        name: 'Level 5 Elite',
        description: 'Reach Level 5 and prove your dedication.',
        badgeUrl: '👑',
        xpRequired: 4000, // level 5 is 4000+ XP in our formula
        pointsRequired: 0,
      },
      {
        name: 'Point Collector',
        description: 'Accumulate a total of 500 points.',
        badgeUrl: '💎',
        xpRequired: 0,
        pointsRequired: 500,
      },
    ];

    for (const ach of defaultAchievements) {
      await prisma.achievement.upsert({
        where: { name: ach.name },
        update: {
          badgeUrl: ach.badgeUrl,
          description: ach.description,
          xpRequired: ach.xpRequired,
          pointsRequired: ach.pointsRequired,
        },
        create: ach,
      });
    }
  }

  static async getAchievements() {
    return prisma.achievement.findMany();
  }

  static async getUserAchievements(userId: string) {
    return prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });
  }

  // Check and unlock achievements for a user
  static async checkAndUnlockAchievements(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { submissions: true, achievements: true },
    });

    if (!user) return [];

    const completedQuestsCount = await prisma.submission.count({
      where: { userId, status: 'APPROVED' },
    });

    const allAchievements = await prisma.achievement.findMany();
    const unlockedList: any[] = [];

    for (const achievement of allAchievements) {
      // Check if user already has it
      const alreadyUnlocked = user.achievements.some(
        (ua: any) => ua.achievementId === achievement.id
      );
      if (alreadyUnlocked) continue;

      let shouldUnlock = false;

      // Rule: First Steps
      if (achievement.name === 'First Steps' && completedQuestsCount >= 1) {
        shouldUnlock = true;
      }
      // Rule: Quest Enthusiast
      if (achievement.name === 'Quest Enthusiast' && completedQuestsCount >= 5) {
        shouldUnlock = true;
      }
      // Rule: Level 5 Elite
      if (achievement.name === 'Level 5 Elite' && user.xp >= achievement.xpRequired) {
        shouldUnlock = true;
      }
      // Rule: Point Collector
      if (achievement.name === 'Point Collector' && user.points >= achievement.pointsRequired) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        // Unlock it!
        const userAch = await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
          include: { achievement: true },
        });

        unlockedList.push(userAch);

        // Save notification and send socket
        const msg = `Achievement Unlocked: "${achievement.name}"! You earned the badge.`;
        await NotificationsService.createNotification(userId, 'REWARD_EARNED', msg);
        emitToUser(userId, 'achievement_unlocked', userAch);
      }
    }

    return unlockedList;
  }
}
