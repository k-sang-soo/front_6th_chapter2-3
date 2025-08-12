/**
 * User 엔티티 타입 정의
 *
 * 사용자 도메인의 모든 타입을 정의합니다.
 * PostsManagerPage.tsx에서 사용되는 사용자 관련 타입들을 추출하여 정리했습니다.
 */
import { PaginatedResponse, User } from '../../../shared/model';

// 사용자 목록 API 응답 타입
export type UsersResponse = PaginatedResponse<User, 'users'>;

// 상세 사용자 프로필 타입 (사용자 모달에서 표시용)
export interface UserProfile {
  id: number;
  username: string;
  image: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  address: {
    address: string;
    city: string;
    state: string;
  };
  company: {
    name: string;
    title: string;
  };
}
