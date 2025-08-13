import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment, updateComment, deleteComment, likeComment } from '../../../entities/comment/api';
import { CommentFormData } from '../../../entities/comment/model';
import { commentQueries } from '../../../entities/comment/queries';
import type { CommentsResponse } from '../../../entities/comment/model';

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
 * 댓글 삭제 Mutation (Optimistic Update)
 * API 호출 전에 즉시 UI에서 댓글을 제거하고, 실패 시 롤백
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: number; postId: number }) => deleteComment(commentId),
    
    // 🚀 API 호출 전에 즉시 UI 업데이트 (Optimistic Update)
    onMutate: async ({ commentId, postId }) => {
      // 진행 중인 관련 쿼리들을 취소하여 충돌 방지
      await queryClient.cancelQueries({ queryKey: commentQueries.byPostKey(postId) });
      
      // 현재 캐시 데이터를 백업 (롤백용)
      const previousComments = queryClient.getQueryData(commentQueries.byPostKey(postId));
      
      // 캐시에서 즉시 댓글 제거
      queryClient.setQueryData(commentQueries.byPostKey(postId), (old: CommentsResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments?.filter((comment) => comment.id !== commentId) || []
        };
      });
      
      // 롤백용 컨텍스트 반환
      return { previousComments, postId };
    },
    
    // ❌ API 호출 실패 시 롤백
    onError: (error, variables, context) => {
      console.error('댓글 삭제 실패:', error);
      
      if (context?.previousComments) {
        // 이전 상태로 복원
        queryClient.setQueryData(commentQueries.byPostKey(variables.postId), context.previousComments);
      }
    },
    
    // ✅ API 호출 성공 시 (이미 UI는 업데이트됨)
    onSuccess: (_, variables) => {
      console.log(`댓글 ${variables.commentId} 삭제 완료`);
    }
  });
};

/**
 * 댓글 좋아요 Mutation
 * 성공 시 해당 게시물의 댓글 쿼리 캐시를 무효화
 */
export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, likes }: { commentId: number; likes: number; postId: number }) => 
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