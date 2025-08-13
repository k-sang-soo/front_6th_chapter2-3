/**
 * Comment 엔티티 요청 타입 정의
 *
 * 댓글 도메인의 요청 관련 타입을 정의합니다.
 */

// 댓글 작성/수정 폼 데이터 타입
export interface CommentFormData {
  body: string;
  postId: number;
  userId: number;
}

// 댓글 조회 요청 타입
export interface CommentRequest {
  postId: number;
}

// 댓글 좋아요 요청 타입
export interface CommentLikeRequest {
  likes: number;
}