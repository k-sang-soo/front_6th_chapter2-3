import { Comment, CommentFormData } from '../../../entities/comment/model';
import { Post } from '../../../entities/post/model';
import { useCommentStore } from '../../../entities/comment/store/useCommentStore';
import { useCreateComment, useUpdateComment, useDeleteComment, useLikeComment } from '../mutations';

export const useCommentManagement = (selectedPost: Post | null, comments: Comment[]) => {
  const {
    closeAddModal: closeCommentAddModal,
    closeEditModal: closeCommentEditModal,
  } = useCommentStore();

  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const likeCommentMutation = useLikeComment();

  const addComment = (commentData: CommentFormData, onSuccess?: () => void) => {
    createCommentMutation.mutate(commentData, {
      onSuccess: () => {
        closeCommentAddModal();
        onSuccess?.();
      },
    });
  };

  const updateComment = (commentId: Comment['id'], commentData: Pick<CommentFormData, 'body'>, onSuccess?: () => void) => {
    if (!commentId) return;

    updateCommentMutation.mutate(
      { commentId, commentData },
      {
        onSuccess: () => {
          closeCommentEditModal();
          onSuccess?.();
        },
      },
    );
  };

  const deleteComment = (commentId: Comment['id']) => {
    if (!selectedPost?.id) {
      console.error('선택된 게시물이 없습니다');
      return;
    }

    deleteCommentMutation.mutate({
      commentId,
      postId: selectedPost.id,
    });
  };

  const likeComment = (commentId: Comment['id']) => {
    const targetComment = comments.find((comment) => comment.id === commentId);

    if (!targetComment || !selectedPost?.id) {
      console.error('댓글 또는 선택된 게시물을 찾을 수 없습니다:', commentId);
      return;
    }

    likeCommentMutation.mutate({
      commentId,
      likes: targetComment.likes + 1,
      postId: selectedPost.id,
    });
  };

  return {
    // Actions
    addComment,
    updateComment,
    deleteComment,
    likeComment,

    // Loading states
    isCreating: createCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
    isLiking: likeCommentMutation.isPending,
  };
};