import { queryOptions } from '@tanstack/react-query';
import { getTags } from '../api';

export const tagQueries = {
  allKey: () => ['tags'] as const,

  // 태그 목록 조회
  list: () =>
    queryOptions({
      queryKey: tagQueries.allKey(),
      queryFn: getTags,
      staleTime: 30 * 60 * 1000, // 30분간 fresh 상태 유지 (태그는 자주 변경되지 않음)
    }),
};