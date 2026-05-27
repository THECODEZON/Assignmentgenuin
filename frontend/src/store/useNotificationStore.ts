import { create } from 'zustand';
import { apiFetch } from '../services/api';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'QUEST_COMPLETED' | 'REWARD_EARNED' | 'LEADERBOARD_CHANGE' | 'ADMIN_ANNOUNCEMENT';
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const data = await apiFetch('/notifications');
      const unreadCount = data.filter((n: Notification) => !n.read).length;
      set({ notifications: data, unreadCount, loading: false });
    } catch (e) {
      set({ loading: false });
    }
  },

  addNotification: (notification) => {
    const current = get().notifications;
    // Avoid duplicates
    if (current.some(n => n.id === notification.id)) return;

    const updated = [notification, ...current];
    set({
      notifications: updated,
      unreadCount: get().unreadCount + 1
    });
  },

  markAsRead: async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      const updated = get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = updated.filter((n) => !n.read).length;
      set({ notifications: updated, unreadCount });
    } catch (e) {
      // ignore
    }
  },

  markAllAsRead: async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PATCH' });
      const updated = get().notifications.map((n) => ({ ...n, read: true }));
      set({ notifications: updated, unreadCount: 0 });
    } catch (e) {
      // ignore
    }
  },
}));
