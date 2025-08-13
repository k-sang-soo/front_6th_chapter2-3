import { CommentRequest } from '../model';
import { queryOptions } from '@tanstack/react-query';
import { getComments } from '../api';

export const commentQueries = {
  allKey: () => ['comments'] as const,
  byPostKey: (postId: number) => [...commentQueries.allKey(), 'post', postId] as const,

  byPost: ({ postId }: CommentRequest) =>
    queryOptions({
      queryKey: commentQueries.byPostKey(postId),
      queryFn: () => getComments({ postId }),
    }),
};