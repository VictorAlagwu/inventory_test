export interface SuccessResponse<T> {
  status: 'success';
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FailResponse {
  status: 'fail';
  data: {
    message: string;
    code: string;
    details?: unknown[];
  };
}
