import prisma from '../../prisma/client';

export class LeaderboardService {
  static async getLeaderboard() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        xp: true,
        level: true,
        points: true,
      },
      orderBy: [
        { xp: 'desc' },
        { username: 'asc' },
      ],
      take: 100,
    });
  }
}
