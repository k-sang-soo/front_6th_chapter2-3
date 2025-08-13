export type SortBy = '' | 'id' | 'title' | 'reactions';
export type SortOrder = 'asc' | 'desc';

// 게시물 작성/수정 폼 데이터 타입
export interface PostFormData {
  title: string;
  body: string;
  userId: number;
}

export interface PostRequest {
  limit: number;
  skip: number;
  searchQuery?: string;
  selectedTag?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PostFilters {
  searchQuery: string;
  selectedTag: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  skip: number;
  limit: number;
}
