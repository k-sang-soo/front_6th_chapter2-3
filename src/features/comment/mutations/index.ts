import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment, updateComment, deleteComment, likeComment } from '../../../entities/comment/api';
import { CommentFormData } from '../../../entities/comment/model';
import { commentQueries } from '../../../entities/comment/queries';

/**
 * 댓글 생성 Mutation
 * 성공 시 해당 게시물의 댓글 쿼리 캐시를 무효화
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentData: CommentFormData) => createComment(commentData),
    onSuccess: (data) => {
      // 해당 게시물의 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({ 
        queryKey: commentQueries.byPostKey(data.postId) 
      });
    },
    onError: (error) => {
      console.error('댓글 생성 실패:', error);
    },
  });
};

/**
 * 댓글 수정 Mutation
 * 성공 시 해당 게시물의 댓글 쿼리 캐시를 무효화
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, commentData }: { commentId: number; commentData: Pick<CommentFormData, 'body'> }) => 
      updateComment(commentId, commentData),
    onSuccess: (data) => {
      // 해당 게시물의 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({ 
        queryKey: commentQueries.byPostKey(data.postId) 
      });
    },
    onError: (error) => {
      console.error('댓글 수정 실패:', error);
    },
  });
};

/**
 * 댓글 삭제 Mutation
 * 성공 시 해당 게시물의 댓글 쿼리 캐시를 무효화
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, postId }: { commentId: number; postId: number }) => deleteComment(commentId),
    onSuccess: (_, variables) => {
      // 해당 게시물의 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({ 
        queryKey: commentQueries.byPostKey(variables.postId) 
      });
    },
    onError: (error) => {
      console.error('댓글 삭제 실패:', error);
    },
  });
};

/**
 * 댓글 좋아요 Mutation
 * 성공 시 해당 게시물의 댓글 쿼리 캐시를 무효화
 */
export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, likes, postId }: { commentId: number; likes: number; postId: number }) => 
      likeComment(commentId, { likes }),
    onSuccess: (data) => {
      // 해당 게시물의 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({ 
        queryKey: commentQueries.byPostKey(data.postId) 
      });
    },
    onError: (error) => {
      console.error('댓글 좋아요 실패:', error);
    },
  });
};