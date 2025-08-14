import { create } from 'zustand';
import { UserProfile } from '../model';

export interface UserState {
  selectedUser: UserProfile | null;
  modals: {
    profile: boolean;
  };
}

export interface UserActions {
  // Selection actions
  setSelectedUser: (user: UserProfile | null) => void;
  clearSelectedUser: () => void;
  
  // Modal actions
  openProfileModal: () => void;
  closeProfileModal: () => void;
  closeAllModals: () => void;
}

export type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>((set) => ({
  // State
  selectedUser: null,
  modals: {
    profile: false,
  },

  // Selection Actions
  setSelectedUser: (user) =>
    set(() => ({
      selectedUser: user,
    })),

  clearSelectedUser: () =>
    set(() => ({
      selectedUser: null,
    })),

  // Modal Actions
  openProfileModal: () =>
    set((state) => ({
      modals: { ...state.modals, profile: true },
    })),

  closeProfileModal: () =>
    set((state) => ({
      modals: { ...state.modals, profile: false },
    })),

  closeAllModals: () =>
    set(() => ({
      modals: {
        profile: false,
      },
    })),
}));