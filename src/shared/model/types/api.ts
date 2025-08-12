interface PaginationMeta {
  total: number;
  skip: number;
  limit: number;
}

export type PaginatedResponse<T, K extends string = 'items'> = Record<K, T[]> & PaginationMeta;
