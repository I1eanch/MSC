export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  bodyFormat: 'markdown' | 'mdx';
  heroImage?: string;
  categories: string[];
  tags: string[];
  author?: string;
  publishedAt: Date;
  updatedAt: Date;
  metadata?: {
    readTime?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    goals?: string[];
    ageRange?: {
      min?: number;
      max?: number;
    };
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface UserPreferences {
  userId: string;
  goals?: string[];
  age?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface Favorite {
  id: string;
  userId: string;
  articleId: string;
  createdAt: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ArticleFilters {
  categories?: string[];
  tags?: string[];
  search?: string;
  difficulty?: string;
  goals?: string[];
  ageRange?: {
    min?: number;
    max?: number;
  };
}
