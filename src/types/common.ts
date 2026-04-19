// ──────────────────────────────────────────────
// Backend: PagedResponse<T> & ErrorResult wrapper'larının karşılığı
// ──────────────────────────────────────────────

/** Backend'in PagedResponse<T> sınıfına karşılık gelir */
export interface PagedResponse<T> {
  data: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** Backend'in ErrorResult sınıfına karşılık gelir */
export interface ErrorResult {
  succeeded: boolean;
  message: string;
  errors: string[];
}

/** Sayfalama isteği için ortak parametre tipi */
export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}
