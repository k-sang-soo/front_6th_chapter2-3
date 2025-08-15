import { axiosInstance } from '../../../app/libs/axiosInstance';
import type { UsersResponse, UserProfile } from '../model';

// 모든 사용자 목록 조회 (username, image만 select)
export const getUsers = async (): Promise<UsersResponse> => {
  const response = await axiosInstance.get('/users?limit=0&select=username,image');
  return response.data;
};

// 특정 사용자의 상세 정보 조회
export const getUser = async (userId: number): Promise<UserProfile> => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};