import { PostRequest } from '../model';

import { queryOptions } from '@tanstack/react-query';
import { getPostsWithAuthors } from '../api';

export const postQueries = {
  allKey: () => ['posts'] as const,
  withAuthorsKey: () => [...postQueries.allKey(), 'authors'] as const,

  postsWithAuthors: ({ limit, skip }: PostRequest) =>
    queryOptions({
      queryKey: [...postQueries.withAuthorsKey(), limit, skip],
      queryFn: () => getPostsWithAuthors({ limit, skip }),
    }),
};
