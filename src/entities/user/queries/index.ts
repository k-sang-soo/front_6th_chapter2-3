import { queryOptions } from '@tanstack/react-query';
import { getUsers, getUser } from '../api';

export const userQueries = {
  allKey: () => ['users'] as const,
  detailKey: (userId: number) => [...userQueries.allKey(), 'detail', userId] as const,

  // 사용자 목록 조회 (username, image만)
  list: () =>
    queryOptions({
      queryKey: userQueries.allKey(),
      queryFn: getUsers,
      staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    }),

  // 특정 사용자 상세 정보 조회
  detail: (userId: number) =>
    queryOptions({
      queryKey: userQueries.detailKey(userId),
      queryFn: () => getUser(userId),
      staleTime: 10 * 60 * 1000, // 10분간 fresh 상태 유지
    }),
};