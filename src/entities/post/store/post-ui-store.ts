import { create } from 'zustand';
import { Post } from '../model';

export interface PostUIState {
  selectedPost: Post | null;
  modals: {
    add: boolean;
    edit: boolean;
    detail: boolean;
  };
}

export interface PostUIActions {
  // Selection actions
  setSelectedPost: (post: Post | null) => void;
  clearSelectedPost: () => void;
  
  // Modal actions
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: () => void;
  closeEditModal: () => void;
  openDetailModal: () => void;
  closeDetailModal: () => void;
  closeAllModals: () => void;
}

export type PostUIStore = PostUIState & PostUIActions;

export const usePostUIStore = create<PostUIStore>((set) => ({
  // State
  selectedPost: null,
  modals: {
    add: false,
    edit: false,
    detail: false,
  },

  // Selection Actions
  setSelectedPost: (post) =>
    set(() => ({
      selectedPost: post,
    })),

  clearSelectedPost: () =>
    set(() => ({
      selectedPost: null,
    })),

  // Modal Actions
  openAddModal: () =>
    set((state) => ({
      modals: { ...state.modals, add: true },
    })),

  closeAddModal: () =>
    set((state) => ({
      modals: { ...state.modals, add: false },
    })),

  openEditModal: () =>
    set((state) => ({
      modals: { ...state.modals, edit: true },
    })),

  closeEditModal: () =>
    set((state) => ({
      modals: { ...state.modals, edit: false },
    })),

  openDetailModal: () =>
    set((state) => ({
      modals: { ...state.modals, detail: true },
    })),

  closeDetailModal: () =>
    set((state) => ({
      modals: { ...state.modals, detail: false },
    })),

  closeAllModals: () =>
    set((state) => ({
      modals: {
        add: false,
        edit: false,
        detail: false,
      },
    })),
}));