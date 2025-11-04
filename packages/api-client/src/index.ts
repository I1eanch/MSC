export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export function createApiClient(baseURL: string = API_BASE_URL) {
  return {
    baseURL,
    getUrl: (path: string) => `${baseURL}${path}`,
  };
}
