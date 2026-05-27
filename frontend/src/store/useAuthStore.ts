import { create } from 'zustand';
import { apiFetch } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  xp: number;
  points: number;
  level: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
  updateUserStats: (xp: number, level: number, points: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Listen for session expiry from API client
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-failure', () => {
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      disconnectSocket();
    });
  }

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,

    initialize: () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');

      if (accessToken && refreshToken && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ accessToken, refreshToken, user, isAuthenticated: true });
          connectSocket(accessToken);
        } catch (e) {
          localStorage.clear();
        }
      }
    },

    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const data = await apiFetch('/auth/login', {
          method: 'POST',
          body: { email, password },
        });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          loading: false,
        });

        connectSocket(data.accessToken);
      } catch (err: any) {
        set({ error: err.message || 'Login failed', loading: false });
        throw err;
      }
    },

    register: async (username, email, password) => {
      set({ loading: true, error: null });
      try {
        await apiFetch('/auth/register', {
          method: 'POST',
          body: { username, email, password },
        });
        set({ loading: false });
      } catch (err: any) {
        set({ error: err.message || 'Registration failed', loading: false });
        throw err;
      }
    },

    logout: async () => {
      const refreshToken = get().refreshToken;
      if (refreshToken) {
        try {
          await apiFetch('/auth/logout', {
            method: 'POST',
            body: { refreshToken },
          });
        } catch (e) {
          // ignore logout errors
        }
      }
      localStorage.clear();
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      disconnectSocket();
    },

    updateUserStats: (xp, level, points) => {
      const currentUser = get().user;
      if (currentUser) {
        const updated = { ...currentUser, xp, level, points };
        localStorage.setItem('user', JSON.stringify(updated));
        set({ user: updated });
      }
    },
  };
});
