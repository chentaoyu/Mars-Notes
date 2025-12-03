// 用户类型
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 笔记本类型
export interface Notebook {
  id: string;
  userId: string;
  parentId?: string | null;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  children?: Notebook[];
  _count?: {
    notes: number;
    children?: number;
  };
}

// 标签类型
export interface Tag {
  id: string;
  userId: string;
  name: string;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    notes: number;
  };
}

// 笔记类型
export interface Note {
  id: string;
  userId: string;
  notebookId?: string | null;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  notebook?: Notebook | null;
  tags?: Tag[];
}

// 笔记排序选项
export type NoteSortBy = 'updatedAt' | 'createdAt' | 'title';
export type NoteSortOrder = 'asc' | 'desc';

// 笔记查询参数
export interface NoteQueryParams {
  search?: string;
  notebookId?: string;
  tagIds?: string[];
  sortBy?: NoteSortBy;
  sortOrder?: NoteSortOrder;
  page?: number;
  limit?: number;
}

// API 响应类型
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

// 分页类型
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// NextAuth v5 扩展类型
// 为了兼容性，我们现在暂时移除类型扩展
// 将在运行时处理类型转换
