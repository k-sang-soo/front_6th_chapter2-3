/**
 * Tag 엔티티 타입 정의
 *
 * 태그 도메인의 모든 타입을 정의합니다.
 * PostsManagerPage.tsx에서 사용되는 태그 관련 타입들을 추출하여 정리했습니다.
 */

// 기본 Tag 타입 (서버에서 받아오는 원본 데이터)
export interface Tag {
  slug: string;
  name: string;
  url: string;
}

// 태그 필터 옵션 타입
export type TagFilterOption = 'all' | Tag['slug'];
