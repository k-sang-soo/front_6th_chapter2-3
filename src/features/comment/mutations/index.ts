import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment, updateComment, deleteComment, likeComment } from '../../../entities/comment/api';
import { CommentFormData } from '../../../entities/comment/model';
import { commentQueries } from '../../../entities/comment/queries';
import type { CommentsResponse } from '../../../entities/comment/model';

/**
 * 댓글 생성 Mutation (Optimistic Update)
 * API 호출 성공 시 서버 응답 데이터를 캐시에 추가
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentData: CommentFormData) => createComment(commentData),
    
    // ✅ API 호출 성공 시 서버 응답을 캐시에 즉시 추가
    onSuccess: (data, variables) => {
      // 서버에서 반환된 새 댓글을 캐시에 추가
      queryClient.setQueryData(commentQueries.byPostKey(variables.postId), (old: CommentsResponse | undefined) => {
        if (!old) return { comments: [data], total: 1, skip: 0, limit: 30 };
        return {
          ...old,
          comments: [...(old.comments || []), data],
        };
      });
      console.log(`댓글 ${data.id} 생성 완료`);
    },
    
    onError: (error) => {
      console.error('댓글 생성 실패:', error);
    }
  });
};

/**
 * 댓글 수정 Mutation (Optimistic Update)  
 * API 호출 성공 시 서버 응답 데이터로 캐시 업데이트
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, commentData }: { commentId: number; commentData: Pick<CommentFormData, 'body'> }) => 
      updateComment(commentId, commentData),
    
    // ✅ API 호출 성공 시 서버 응답으로 캐시의 해당 댓글 업데이트
    onSuccess: (data) => {
      queryClient.setQueryData(commentQueries.byPostKey(data.postId), (old: CommentsResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments?.map((comment) =>
            comment.id === data.id ? data : comment
          ) || [],
        };
      });
      console.log(`댓글 ${data.id} 수정 완료`);
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
 * 댓글 좋아요 Mutation (Optimistic Update)
 * API 호출 전에 즉시 UI에서 좋아요 수를 업데이트하고, 실패 시 롤백
 */
export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, likes }: { commentId: number; likes: number; postId: number }) => 
      likeComment(commentId, { likes }),
    
    // 🚀 API 호출 전에 즉시 UI 업데이트 (Optimistic Update)
    onMutate: async ({ commentId, likes, postId }) => {
      // 진행 중인 관련 쿼리들을 취소하여 충돌 방지
      await queryClient.cancelQueries({ queryKey: commentQueries.byPostKey(postId) });
      
      // 현재 캐시 데이터를 백업 (롤백용)
      const previousComments = queryClient.getQueryData(commentQueries.byPostKey(postId));
      
      // 캐시에서 즉시 좋아요 수 업데이트
      queryClient.setQueryData(commentQueries.byPostKey(postId), (old: CommentsResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments?.map((comment) =>
            comment.id === commentId 
              ? { ...comment, likes } // 새로운 좋아요 수로 즉시 업데이트
              : comment
          ) || [],
        };
      });
      
      // 롤백용 컨텍스트 반환
      return { previousComments, postId };
    },
    
    // ❌ API 호출 실패 시 롤백
    onError: (error, variables, context) => {
      console.error('댓글 좋아요 실패:', error);
      
      if (context?.previousComments) {
        // 이전 상태로 복원
        queryClient.setQueryData(commentQueries.byPostKey(variables.postId), context.previousComments);
      }
    },
    
    // ✅ API 호출 성공 시 (이미 UI는 업데이트됨)
    onSuccess: (_, variables) => {
      console.log(`댓글 ${variables.commentId} 좋아요 업데이트 완료: ${variables.likes}개`);
    }
  });
};