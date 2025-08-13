import { CommentRequest, CommentFormData, CommentLikeRequest } from '../model';
import { axiosInstance } from '../../../app/libs/axiosInstance.old.ts';
import type { CommentsResponse } from '../model';

// 특정 게시물의 댓글 조회
export const getComments = async ({ postId, limit, skip }: CommentRequest): Promise<CommentsResponse> => {
  const url = `/comments/post/${postId}${limit ? `?limit=${limit}&skip=${skip || 0}` : ''}`;
  const response = await axiosInstance.get(url);
  return response.data;
};

// 댓글 생성
export const createComment = async (commentData: CommentFormData) => {
  const response = await axiosInstance.post('/comments/add', commentData);
  return response.data;
};

// 댓글 수정
export const updateComment = async (commentId: number, commentData: Pick<CommentFormData, 'body'>) => {
  const response = await axiosInstance.put(`/comments/${commentId}`, commentData);
  return response.data;
};

// 댓글 삭제
export const deleteComment = async (commentId: number) => {
  const response = await axiosInstance.delete(`/comments/${commentId}`);
  return response.data;
};

// 댓글 좋아요
export const likeComment = async (commentId: number, likeData: CommentLikeRequest) => {
  const response = await axiosInstance.patch(`/comments/${commentId}`, likeData);
  return response.data;
};