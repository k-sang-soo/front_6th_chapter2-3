import { PostRequest } from '../model';

import { queryOptions } from '@tanstack/react-query';
import { getPostsWithAuthors } from '../api';

export const postQueries = {
  allKey: () => ['posts'] as const,
  withAuthorsKey: () => [...postQueries.allKey(), 'authors'] as const,

  postsWithAuthors: ({ limit, skip, searchQuery, selectedTag, sortBy, sortOrder }: PostRequest) =>
    queryOptions({
      queryKey: [...postQueries.withAuthorsKey(), { limit, skip, searchQuery, selectedTag, sortBy, sortOrder }],
      queryFn: () => getPostsWithAuthors({ limit, skip, searchQuery, selectedTag, sortBy, sortOrder }),
    }),
};
