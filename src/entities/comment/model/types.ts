/**
 * Comment 엔티티 타입 정의
 *
 * 댓글 도메인의 모든 타입을 정의합니다.
 * PostsManagerPage.tsx에서 사용되는 댓글 관련 타입들을 추출하여 정리했습니다.
 */
import { PaginatedResponse } from '../../../shared/model';

// 기본 Comment 타입 (서버에서 받아오는 원본 데이터)
export interface Comment {
  id: number;
  body: string;
  postId: number;
  userId: number;
  likes: number;
  user: {
    id: number;
    username: string;
    fullName: string;
  };
}

// 댓글 목록 API 응답 타입
export type CommentsResponse = PaginatedResponse<Comment, 'comments'>;

// 댓글 작성/수정 폼 데이터 타입
export interface CommentFormData {
  body: string;
  postId: number;
  userId: number;
}
