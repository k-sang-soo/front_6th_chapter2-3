import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SortOrder } from '../../../entities/post/model';

export interface PostFilters {
  skip: number;
  limit: number;
  searchQuery: string;
  sortBy: string;
  sortOrder: SortOrder;
  selectedTag: string;
}

export const usePostFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 전체 게시물 개수 (페이지네이션용)
  const [total, setTotal] = useState(0);

  // URL 파라미터에서 필터 상태 파싱 (Single Source of Truth)
  const filters = useMemo(
    (): PostFilters => ({
      skip: parseInt(searchParams.get('skip') || '0'),
      limit: parseInt(searchParams.get('limit') || '10'),
      searchQuery: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || '',
      sortOrder: (searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc') as SortOrder,
      selectedTag: searchParams.get('tag') || '',
    }),
    [searchParams],
  );

  // 필터 업데이트 함수
  const updateFilters = useCallback(
    (updates: Partial<PostFilters>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);

        Object.entries(updates).forEach(([key, value]) => {
          const paramKey = key === 'searchQuery' ? 'search' : 
                          key === 'selectedTag' ? 'tag' : key;
          
          if (value === null || value === undefined || value === '') {
            newParams.delete(paramKey);
          } else {
            newParams.set(paramKey, String(value));
          }
        });

        return newParams;
      });
    },
    [setSearchParams],
  );

  return {
    filters,
    updateFilters,
    total,
    setTotal,
  };
};