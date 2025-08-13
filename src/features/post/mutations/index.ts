import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost, updatePost, deletePost } from '../../../entities/post/api';
import { PostFormData } from '../../../entities/post/model';
import { postQueries } from '../../../entities/post/queries';

/**
 * 게시물 생성 Mutation
 * 성공 시 posts 쿼리 캐시를 무효화하여 목록 새로고침
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postData: PostFormData) => createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postQueries.allKey() });
    },
    onError: (error) => {
      console.error('게시물 생성 실패:', error);
    },
  });
};

/**
 * 게시물 수정 Mutation
 * 성공 시 posts 쿼리 캐시를 무효화하여 목록 새로고침
 */
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, postData }: { postId: number; postData: PostFormData }) =>
      updatePost(postId, postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postQueries.allKey() });
    },
    onError: (error) => {
      console.error('게시물 수정 실패:', error);
    },
  });
};

/**
 * 게시물 삭제 Mutation
 * 성공 시 posts 쿼리 캐시를 무효화하여 목록 새로고침
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postQueries.allKey() });
    },
    onError: (error) => {
      console.error('게시물 삭제 실패:', error);
    },
  });
};
