import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  hydrateAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gippo_access_token', accessToken);
      localStorage.setItem('gippo_refresh_token', refreshToken);
      localStorage.setItem('gippo_user', JSON.stringify(user));
    }
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gippo_user', JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gippo_access_token');
      localStorage.removeItem('gippo_refresh_token');
      localStorage.removeItem('gippo_user');
    }
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  hydrateAuth: () => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('gippo_access_token');
        const refresh = localStorage.getItem('gippo_refresh_token');
        const userStr = localStorage.getItem('gippo_user');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          set({
            user,
            accessToken: token,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } catch (e) {
        console.error('Failed to hydrate auth state:', e);
      }
    }
    set({ isLoading: false });
  },
}));
