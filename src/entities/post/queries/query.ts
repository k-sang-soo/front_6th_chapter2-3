import { axiosInstance } from '../../../app/libs/axiosInstance.old.ts';
import { PostRequest, PostsResponse } from '../model';
import { UsersResponse } from '../../user/model';
import { queryOptions } from '@tanstack/react-query';

const getPosts = async ({ limit, skip }: PostRequest): Promise<PostsResponse> => {
  const response = await axiosInstance.get(`/posts?limit=${limit}&skip=${skip}`);
  return response.data;
};

const getUsers = async (): Promise<UsersResponse> => {
  const response = await axiosInstance.get('/users?limit=0&select=username,image');
  return response.data;
};

const getPostsWithAuthors = async ({ limit, skip }: PostRequest) => {
  const [postsData, usersData] = await Promise.all([getPosts({ limit, skip }), getUsers()]);
  return postsData.posts.map((post) => ({
    ...post,
    author: usersData.users.find((user) => user.id === post.userId),
  }));
};

export const postQueries = {
  allKey: () => ['posts'] as const,
  withAuthorsKey: () => [...postQueries.allKey(), 'authors'] as const,

  postsWithAuthors: ({ limit, skip }: PostRequest) =>
    queryOptions({
      queryKey: [...postQueries.withAuthorsKey(), limit, skip],
      queryFn: () => getPostsWithAuthors({ limit, skip }),
    }),
};
