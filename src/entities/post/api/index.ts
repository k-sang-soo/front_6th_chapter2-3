import { PostRequest, PostsResponse, PostFormData } from '../model';
import { axiosInstance } from '../../../app/libs/axiosInstance';
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
  const postsWithAuthors = postsData.posts.map((post) => ({
    ...post,
    author: usersData.users.find((user) => user.id === post.userId),
  }));

  // 클라이언트 사이드 검색 필터링 (dummyjson.com API가 검색을 제대로 지원하지 않음)
  let filteredPosts = postsWithAuthors;
  
  // 검색어가 있을 때만 필터링 수행
  if (params.searchQuery && params.searchQuery.trim() !== '') {
    const searchLower = params.searchQuery.toLowerCase().trim();
    filteredPosts = postsWithAuthors.filter((post) => 
      post.title.toLowerCase().includes(searchLower) || 
      post.body.toLowerCase().includes(searchLower)
    );
  }

  return {
    posts: filteredPosts,
    total: filteredPosts.length, // 필터링된 결과의 총 개수
  };
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
