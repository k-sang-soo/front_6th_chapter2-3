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

  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  const addPost = (formData: PostFormData, onSuccess?: () => void) => {
    createPostMutation.mutate(formData, {
      onSuccess: () => {
        closePostAddModal();
        onSuccess?.();
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

    // Loading states
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
  };
};