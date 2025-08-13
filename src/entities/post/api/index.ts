import { PostRequest, PostsResponse, PostFormData } from '../model';
import { axiosInstance } from '../../../app/libs/axiosInstance.old.ts';
import { UsersResponse } from '../../user/model';

export const getPosts = async ({ 
  limit, 
  skip, 
  searchQuery, 
  selectedTag, 
  sortBy, 
  sortOrder 
}: PostRequest): Promise<PostsResponse> => {
  const url = `/posts?limit=${limit}&skip=${skip}&q=${searchQuery || ''}&tag=${selectedTag || ''}&sortBy=${sortBy || ''}&order=${sortOrder || ''}`;
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getUsers = async (): Promise<UsersResponse> => {
  const response = await axiosInstance.get('/users?limit=0&select=username,image');
  return response.data;
};


// 통합 API 함수 - 모든 파라미터를 getPosts로 전달
export const getPostsWithAuthors = async (params: PostRequest) => {
  const [postsData, usersData] = await Promise.all([
    getPosts(params),
    getUsers()
  ]);

  // 작성자 정보 결합
  return postsData.posts.map((post) => ({
    ...post,
    author: usersData.users.find((user) => user.id === post.userId),
  }));
};

// 게시물 생성
export const createPost = async (postData: PostFormData) => {
  const response = await axiosInstance.post('/posts/add', postData);
  return response.data;
};

// 게시물 수정
export const updatePost = async (postId: number, postData: PostFormData) => {
  const response = await axiosInstance.put(`/posts/${postId}`, postData);
  return response.data;
};

// 게시물 삭제
export const deletePost = async (postId: number) => {
  const response = await axiosInstance.delete(`/posts/${postId}`);
  return response.data;
};
