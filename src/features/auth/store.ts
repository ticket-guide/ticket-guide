import { create } from 'zustand';
import { UserProfile, AuthMode } from './types';

interface AuthState {
    user: UserProfile | null;
    isModalOpen: boolean;
    modalMode: AuthMode;
    isLoading: boolean;

    setUser: (user: UserProfile | null) => void;
    openModal: (mode?: AuthMode) => void;
    closeModal: () => void;
    setLoading: (v: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isModalOpen: false,
    modalMode: 'login',
    isLoading: false,

    setUser: (user) => set({ user }),
    openModal: (mode = 'login') => set({ isModalOpen: true, modalMode: mode }),
    closeModal: () => set({ isModalOpen: false }),
    setLoading: (v) => set({ isLoading: v }),
    logout: () => set({ user: null }),
}));
