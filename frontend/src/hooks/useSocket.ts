import { useEffect } from 'react';
import { getSocket } from '../services/socket';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const updateUserStats = useAuthStore((state) => state.updateUserStats);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    // Real-time Notification listener
    socket.on('notification', (notification) => {
      addNotification(notification);

      // Distinguish toast styles by notification type
      if (notification.type === 'QUEST_COMPLETED') {
        toast.success(notification.message, {
          icon: '⚔️',
          duration: 5000,
        });
      } else if (notification.type === 'REWARD_EARNED') {
        toast.success(notification.message, {
          icon: '🏆',
          duration: 5000,
        });
      } else if (notification.type === 'ADMIN_ANNOUNCEMENT') {
        toast(notification.message, {
          icon: '📢',
          duration: 6000,
        });
      } else {
        toast(notification.message);
      }
    });

    // Level up event listener
    socket.on('level_up', (data) => {
      if (user && data.userId === user.id) {
        updateUserStats(data.xp, data.level, user.points);
        toast.success(`🎉 Level Up! You reached Level ${data.level}!`, {
          duration: 8000,
          style: {
            border: '2px solid #8b5cf6',
            padding: '16px',
            color: '#c084fc',
            background: '#1e1b4b',
            fontSize: '18px',
            fontWeight: 'bold',
          },
        });
      }
    });

    // Achievement unlock listener
    socket.on('achievement_unlocked', (userAch) => {
      if (user && userAch.userId === user.id) {
        toast.success(`🏆 Achievement Unlocked: ${userAch.achievement.name}!`, {
          duration: 6000,
          style: {
            border: '2px solid #06b6d4',
            padding: '12px',
            background: '#083344',
            color: '#67e8f9',
          },
        });
      }
    });

    // Leaderboard update signal
    socket.on('leaderboard_updated', () => {
      // Just post a silent info toast or dispatch event to refresh
      window.dispatchEvent(new Event('leaderboard-updated'));
    });

    return () => {
      socket.off('notification');
      socket.off('level_up');
      socket.off('achievement_unlocked');
      socket.off('leaderboard_updated');
    };
  }, [isAuthenticated, user, addNotification, updateUserStats]);
};
