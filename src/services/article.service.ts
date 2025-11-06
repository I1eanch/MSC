import { Article, ArticleFilters, PaginatedResponse, PaginationParams, UserPreferences } from '../types/article.types';
import { articleStore } from '../models/article.model';

export class ArticleService {
  private calculateRelevanceScore(article: Article, preferences?: UserPreferences): number {
    if (!preferences) return 0;

    let score = 0;

    if (preferences.level && article.metadata?.difficulty === preferences.level) {
      score += 30;
    }

    if (preferences.age && article.metadata?.ageRange) {
      const { min, max } = article.metadata.ageRange;
      if ((min === undefined || preferences.age >= min) && 
          (max === undefined || preferences.age <= max)) {
        score += 20;
      }
    }

    if (preferences.goals && preferences.goals.length > 0 && article.metadata?.goals) {
      const matchingGoals = preferences.goals.filter(goal => 
        article.metadata?.goals?.includes(goal)
      );
      score += matchingGoals.length * 15;
    }

    return score;
  }

  private filterArticles(articles: Article[], filters: ArticleFilters): Article[] {
    let filtered = [...articles];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.excerpt.toLowerCase().includes(searchLower) ||
        article.body.toLowerCase().includes(searchLower)
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(article =>
        filters.categories!.some(catId => article.categories.includes(catId))
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(article =>
        filters.tags!.some(tagId => article.tags.includes(tagId))
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(article =>
        article.metadata?.difficulty === filters.difficulty
      );
    }

    if (filters.goals && filters.goals.length > 0) {
      filtered = filtered.filter(article =>
        article.metadata?.goals?.some(goal => filters.goals!.includes(goal))
      );
    }

    if (filters.ageRange) {
      filtered = filtered.filter(article => {
        if (!article.metadata?.ageRange) return false;
        
        const { min: filterMin, max: filterMax } = filters.ageRange!;
        const { min: articleMin, max: articleMax } = article.metadata.ageRange;

        const minMatch = filterMin === undefined || articleMin === undefined || 
                        filterMin >= articleMin;
        const maxMatch = filterMax === undefined || articleMax === undefined || 
                        filterMax <= articleMax;

        return minMatch && maxMatch;
      });
    }

    return filtered;
  }

  private paginateResults<T>(items: T[], params: PaginationParams): PaginatedResponse<T> {
    const { page, limit } = params;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);
    const total = items.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  getArticles(
    filters: ArticleFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 },
    preferences?: UserPreferences
  ): PaginatedResponse<Article> {
    let articles = articleStore.getAllArticles();

    articles = this.filterArticles(articles, filters);

    if (preferences) {
      articles = articles.map(article => ({
        ...article,
        relevanceScore: this.calculateRelevanceScore(article, preferences),
      })).sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore);
    } else {
      articles = articles.sort((a, b) => 
        b.publishedAt.getTime() - a.publishedAt.getTime()
      );
    }

    return this.paginateResults(articles, pagination);
  }

  getArticleById(id: string): Article | undefined {
    return articleStore.getArticleById(id);
  }

  getArticleBySlug(slug: string): Article | undefined {
    return articleStore.getArticleBySlug(slug);
  }

  searchArticles(
    query: string,
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): PaginatedResponse<Article> {
    return this.getArticles({ search: query }, pagination);
  }

  getPersonalizedArticles(
    preferences: UserPreferences,
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): PaginatedResponse<Article> {
    return this.getArticles({}, pagination, preferences);
  }

  getArticlesByCategory(
    categoryId: string,
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): PaginatedResponse<Article> {
    return this.getArticles({ categories: [categoryId] }, pagination);
  }

  getArticlesByTag(
    tagId: string,
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): PaginatedResponse<Article> {
    return this.getArticles({ tags: [tagId] }, pagination);
  }

  createArticle(article: Article): Article {
    return articleStore.createArticle(article);
  }

  updateArticle(id: string, updates: Partial<Article>): Article | undefined {
    return articleStore.updateArticle(id, updates);
  }

  deleteArticle(id: string): boolean {
    return articleStore.deleteArticle(id);
  }
}

export const articleService = new ArticleService();
