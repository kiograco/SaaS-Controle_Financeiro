export interface ApiErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  errors?: Record<string, string>;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
}
