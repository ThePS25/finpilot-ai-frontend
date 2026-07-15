import { create } from 'zustand';
import type { User, Profile } from '@/types';
import { authApi } from '@/api/auth.api';
import { tokenStorage } from '@/utils/tokenStorage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  fetchUser: async () => {
    try {
      const { data } = await authApi.getMe();
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      tokenStorage.clear();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authApi.logout({ refreshToken: tokenStorage.getRefreshToken() || undefined });
    } finally {
      tokenStorage.clear();
      set({ user: null, isAuthenticated: false });
    }
  },
}));

interface ProfileState {
  profiles: Profile[];
  activeProfileId: string | null;
  setProfiles: (profiles: Profile[]) => void;
  setActiveProfile: (id: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profiles: [],
  activeProfileId: null,
  setProfiles: (profiles) => {
    const primary = profiles.find((p) => p.isPrimary);
    set((state) => ({
      profiles,
      activeProfileId: state.activeProfileId || primary?._id || profiles[0]?._id || null,
    }));
  },
  setActiveProfile: (id) => set({ activeProfileId: id }),
}));

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
