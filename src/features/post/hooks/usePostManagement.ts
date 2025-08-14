import { useState } from 'react';
import { Post, PostFormData } from '../../../entities/post/model';
import { usePostStore } from '../../../entities/post/store/usePostStore';
import { useCreatePost, useUpdatePost, useDeletePost } from '../mutations';

export const usePostManagement = () => {
  const {
    setSelectedPost,
    openDetailModal: openPostDetailModal,
    closeAddModal: closePostAddModal,
    closeEditModal: closePostEditModal,
  } = usePostStore();

  // 새 게시물 폼 상태
  const [newPost, setNewPost] = useState<PostFormData>({ 
    title: '', 
    body: '', 
    userId: 1 
  });

  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  const addPost = () => {
    createPostMutation.mutate(newPost, {
      onSuccess: () => {
        closePostAddModal();
        setNewPost({ title: '', body: '', userId: 1 });
      },
    });
  };

  const updatePost = (postId: Post['id'], postData: PostFormData, onSuccess?: () => void) => {
    updatePostMutation.mutate(
      { postId, postData },
      {
        onSuccess: () => {
          closePostEditModal();
          onSuccess?.();
        },
      },
    );
  };

  const deletePost = (postId: Post['id']) => {
    deletePostMutation.mutate(postId);
  };

  const openPostDetail = (post: Post) => {
    setSelectedPost(post);
    openPostDetailModal();
  };

  return {
    // Actions
    addPost,
    updatePost,
    deletePost,
    openPostDetail,

    // Form state
    newPost,
    setNewPost,

    // Loading states
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
  };
};