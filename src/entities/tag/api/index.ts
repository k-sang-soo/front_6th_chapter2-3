import { axiosInstance } from '../../../app/libs/axiosInstance';
import type { Tag } from '../model';

// 모든 태그 목록 조회
export const getTags = async (): Promise<Tag[]> => {
  const response = await axiosInstance.get('/posts/tags');
  return response.data;
};