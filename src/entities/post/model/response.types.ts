/**
 * Post 엔티티 타입 정의
 *
 * 게시물 도메인의 모든 타입을 정의합니다.
 * PostsManagerPage.tsx에서 사용되는 게시물 관련 타입들을 추출하여 정리했습니다.
 */
import { PaginatedResponse, User } from '../../../shared/model';

// 기본 Post 타입 (서버에서 받아오는 원본 데이터)
export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags?: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
}

// 게시물 목록 API 응답 타입
export type PostsResponse = PaginatedResponse<Post, 'posts'>;

// 작성자 정보가 포함된 Post 타입 (UI에서 표시용)
export interface PostWithAuthor extends Post {
  author?: User;
}

