export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  xp: number;
  points: number;
  level: number;
  createdAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'ACHIEVEMENT';
  targetValue: number;
  rewardXp: number;
  rewardPoints: number;
  rewardBadge?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'EXPIRED';
  expiresAt?: string | null;
  createdAt: string;
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  userId: string;
  questId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  proofUrl?: string | null;
  proofText?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>;
  quest?: Quest;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badgeUrl: string;
  xpRequired: number;
  pointsRequired: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: Achievement;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'QUEST_COMPLETED' | 'REWARD_EARNED' | 'LEADERBOARD_CHANGE' | 'ADMIN_ANNOUNCEMENT';
  read: boolean;
  createdAt: string;
}

export interface AdminStats {
  summary: {
    totalUsers: number;
    totalQuests: number;
    totalSubmissions: number;
    pendingSubmissions: number;
    approvedSubmissions: number;
    rejectedSubmissions: number;
    activeConnections: number;
  };
  questTypeDistribution: {
    type: string;
    count: number;
  }[];
  recentSubmissions: Submission[];
  activityTrends: {
    date: string;
    completions: number;
    signups: number;
  }[];
}
