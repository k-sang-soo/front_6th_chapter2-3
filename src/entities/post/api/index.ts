import { PostRequest, PostsResponse } from '../model';
import { axiosInstance } from '../../../app/libs/axiosInstance.old.ts';
import { UsersResponse } from '../../user/model';

export const getPosts = async ({ limit, skip }: PostRequest): Promise<PostsResponse> => {
  const response = await axiosInstance.get(`/posts?limit=${limit}&skip=${skip}`);
  return response.data;
};

export const getUsers = async (): Promise<UsersResponse> => {
  const response = await axiosInstance.get('/users?limit=0&select=username,image');
  return response.data;
};

export const getPostsWithAuthors = async ({ limit, skip }: PostRequest) => {
  const [postsData, usersData] = await Promise.all([getPosts({ limit, skip }), getUsers()]);
  return postsData.posts.map((post) => ({
    ...post,
    author: usersData.users.find((user) => user.id === post.userId),
  }));
};
