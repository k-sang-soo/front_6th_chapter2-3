import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost, updatePost, deletePost } from '../../../entities/post/api';
import { PostFormData } from '../../../entities/post/model';
import { postQueries } from '../../../entities/post/queries';

/**
 * 게시물 생성 Mutation
 * dummyjson.com은 모의 API이므로 Optimistic Update로 캐시에 직접 추가
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postData: PostFormData) => createPost(postData),
    onSuccess: (data) => {
      // 현재 캐시된 쿼리들을 찾아서 새 게시물 추가
      queryClient.setQueriesData(
        { queryKey: postQueries.withAuthorsKey(), exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          // 새로 생성된 게시물에 작성자 정보 추가
          const newPost = {
            ...data,
            author: { id: data.userId, username: 'You', image: '' }, // 임시 작성자 정보
          };
          
          return {
            ...oldData,
            posts: [newPost, ...oldData.posts], // 맨 앞에 추가
            total: oldData.total + 1,
          };
        }
      );
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
      queryClient.invalidateQueries({ queryKey: postQueries.withAuthorsKey() });
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
      queryClient.invalidateQueries({ queryKey: postQueries.withAuthorsKey() });
    },
    onError: (error) => {
      console.error('게시물 삭제 실패:', error);
    },
  });
};
