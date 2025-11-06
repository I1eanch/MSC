import { Article, Category, Tag, Favorite } from '../types/article.types';

export class ArticleStore {
  private articles: Article[] = [];
  private categories: Category[] = [];
  private tags: Tag[] = [];
  private favorites: Favorite[] = [];

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    this.categories = [
      { id: '1', name: 'Technology', slug: 'technology', description: 'Tech articles' },
      { id: '2', name: 'Health', slug: 'health', description: 'Health and wellness' },
      { id: '3', name: 'Education', slug: 'education', description: 'Learning resources' },
      { id: '4', name: 'Music', slug: 'music', description: 'Music and arts' },
    ];

    this.tags = [
      { id: '1', name: 'JavaScript', slug: 'javascript' },
      { id: '2', name: 'Fitness', slug: 'fitness' },
      { id: '3', name: 'Tutorial', slug: 'tutorial' },
      { id: '4', name: 'Beginner', slug: 'beginner' },
      { id: '5', name: 'Advanced', slug: 'advanced' },
    ];

    this.articles = [
      {
        id: '1',
        title: 'Introduction to JavaScript',
        slug: 'intro-to-javascript',
        excerpt: 'Learn the basics of JavaScript programming',
        body: '# Introduction to JavaScript\n\nJavaScript is a versatile programming language...',
        bodyFormat: 'markdown',
        heroImage: '/images/js-intro.jpg',
        categories: ['1', '3'],
        tags: ['1', '3', '4'],
        author: 'John Doe',
        publishedAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        metadata: {
          readTime: 5,
          difficulty: 'beginner',
          goals: ['learn-programming', 'web-development'],
          ageRange: { min: 16, max: 60 },
        },
      },
      {
        id: '2',
        title: 'Advanced TypeScript Patterns',
        slug: 'advanced-typescript',
        excerpt: 'Deep dive into TypeScript design patterns',
        body: '# Advanced TypeScript\n\nExplore advanced patterns in TypeScript...',
        bodyFormat: 'mdx',
        heroImage: '/images/ts-advanced.jpg',
        categories: ['1'],
        tags: ['1', '5'],
        author: 'Jane Smith',
        publishedAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        metadata: {
          readTime: 15,
          difficulty: 'advanced',
          goals: ['advanced-programming', 'web-development'],
          ageRange: { min: 20, max: 60 },
        },
      },
      {
        id: '3',
        title: 'Fitness for Beginners',
        slug: 'fitness-beginners',
        excerpt: 'Start your fitness journey with these simple tips',
        body: '# Fitness for Beginners\n\nGetting started with fitness...',
        bodyFormat: 'markdown',
        heroImage: '/images/fitness.jpg',
        categories: ['2'],
        tags: ['2', '4'],
        author: 'Mike Johnson',
        publishedAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        metadata: {
          readTime: 8,
          difficulty: 'beginner',
          goals: ['health', 'fitness'],
          ageRange: { min: 18, max: 80 },
        },
      },
      {
        id: '4',
        title: 'Music Theory Basics',
        slug: 'music-theory-basics',
        excerpt: 'Understanding the fundamentals of music theory',
        body: '# Music Theory Basics\n\nLearn about notes, scales, and chords...',
        bodyFormat: 'markdown',
        heroImage: '/images/music-theory.jpg',
        categories: ['4', '3'],
        tags: ['3', '4'],
        author: 'Sarah Williams',
        publishedAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
        metadata: {
          readTime: 10,
          difficulty: 'beginner',
          goals: ['learn-music', 'creative-expression'],
          ageRange: { min: 12, max: 70 },
        },
      },
    ];
  }

  getAllArticles(): Article[] {
    return [...this.articles];
  }

  getArticleById(id: string): Article | undefined {
    return this.articles.find(article => article.id === id);
  }

  getArticleBySlug(slug: string): Article | undefined {
    return this.articles.find(article => article.slug === slug);
  }

  createArticle(article: Article): Article {
    this.articles.push(article);
    return article;
  }

  updateArticle(id: string, updates: Partial<Article>): Article | undefined {
    const index = this.articles.findIndex(article => article.id === id);
    if (index === -1) return undefined;
    
    this.articles[index] = { ...this.articles[index], ...updates, updatedAt: new Date() };
    return this.articles[index];
  }

  deleteArticle(id: string): boolean {
    const index = this.articles.findIndex(article => article.id === id);
    if (index === -1) return false;
    
    this.articles.splice(index, 1);
    return true;
  }

  getAllCategories(): Category[] {
    return [...this.categories];
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find(cat => cat.id === id);
  }

  createCategory(category: Category): Category {
    this.categories.push(category);
    return category;
  }

  getAllTags(): Tag[] {
    return [...this.tags];
  }

  getTagById(id: string): Tag | undefined {
    return this.tags.find(tag => tag.id === id);
  }

  createTag(tag: Tag): Tag {
    this.tags.push(tag);
    return tag;
  }

  addFavorite(favorite: Favorite): Favorite {
    this.favorites.push(favorite);
    return favorite;
  }

  removeFavorite(userId: string, articleId: string): boolean {
    const index = this.favorites.findIndex(
      fav => fav.userId === userId && fav.articleId === articleId
    );
    if (index === -1) return false;
    
    this.favorites.splice(index, 1);
    return true;
  }

  getFavoritesByUser(userId: string): Favorite[] {
    return this.favorites.filter(fav => fav.userId === userId);
  }

  isFavorite(userId: string, articleId: string): boolean {
    return this.favorites.some(
      fav => fav.userId === userId && fav.articleId === articleId
    );
  }
}

export const articleStore = new ArticleStore();
