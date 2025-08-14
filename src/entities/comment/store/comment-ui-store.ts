import { create } from 'zustand';
import { Comment } from '../model';

export interface CommentUIState {
  selectedComment: Comment | null;
  modals: {
    add: boolean;
    edit: boolean;
  };
}

export interface CommentUIActions {
  // Selection actions
  setSelectedComment: (comment: Comment | null) => void;
  clearSelectedComment: () => void;
  
  // Modal actions
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: () => void;
  closeEditModal: () => void;
  closeAllModals: () => void;
}

export type CommentUIStore = CommentUIState & CommentUIActions;

export const useCommentUIStore = create<CommentUIStore>((set) => ({
  // State
  selectedComment: null,
  modals: {
    add: false,
    edit: false,
  },

  // Selection Actions
  setSelectedComment: (comment) =>
    set(() => ({
      selectedComment: comment,
    })),

  clearSelectedComment: () =>
    set(() => ({
      selectedComment: null,
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

  closeAllModals: () =>
    set((state) => ({
      modals: {
        add: false,
        edit: false,
      },
    })),
}));