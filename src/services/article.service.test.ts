import { ArticleService } from './article.service';
import { articleStore } from '../models/article.model';
import { UserPreferences, Article } from '../types/article.types';

describe('ArticleService', () => {
  let service: ArticleService;

  beforeEach(() => {
    service = new ArticleService();
  });

  describe('getArticles', () => {
    it('should return paginated articles', () => {
      const result = service.getArticles({}, { page: 1, limit: 2 });

      expect(result.data.length).toBeLessThanOrEqual(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBeGreaterThan(0);
    });

    it('should filter articles by category', () => {
      const result = service.getArticles(
        { categories: ['1'] },
        { page: 1, limit: 10 }
      );

      result.data.forEach(article => {
        expect(article.categories).toContain('1');
      });
    });

    it('should filter articles by tag', () => {
      const result = service.getArticles(
        { tags: ['4'] },
        { page: 1, limit: 10 }
      );

      result.data.forEach(article => {
        expect(article.tags).toContain('4');
      });
    });

    it('should filter articles by difficulty', () => {
      const result = service.getArticles(
        { difficulty: 'beginner' },
        { page: 1, limit: 10 }
      );

      result.data.forEach(article => {
        expect(article.metadata?.difficulty).toBe('beginner');
      });
    });

    it('should search articles by title, excerpt, or body', () => {
      const result = service.getArticles(
        { search: 'JavaScript' },
        { page: 1, limit: 10 }
      );

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(article => {
        const searchText = `${article.title} ${article.excerpt} ${article.body}`.toLowerCase();
        expect(searchText).toContain('javascript');
      });
    });

    it('should filter by age range', () => {
      const result = service.getArticles(
        { ageRange: { min: 18, max: 25 } },
        { page: 1, limit: 10 }
      );

      result.data.forEach(article => {
        if (article.metadata?.ageRange) {
          const { min, max } = article.metadata.ageRange;
          expect(min === undefined || 18 >= min).toBe(true);
          expect(max === undefined || 25 <= max).toBe(true);
        }
      });
    });

    it('should filter by goals', () => {
      const result = service.getArticles(
        { goals: ['web-development'] },
        { page: 1, limit: 10 }
      );

      result.data.forEach(article => {
        expect(article.metadata?.goals).toContain('web-development');
      });
    });
  });

  describe('personalization', () => {
    it('should prioritize articles matching user level', () => {
      const preferences: UserPreferences = {
        userId: 'user1',
        level: 'beginner',
      };

      const result = service.getPersonalizedArticles(
        preferences,
        { page: 1, limit: 10 }
      );

      const beginnerArticles = result.data.filter(
        article => article.metadata?.difficulty === 'beginner'
      );
      expect(beginnerArticles.length).toBeGreaterThan(0);
    });

    it('should prioritize articles matching user age', () => {
      const preferences: UserPreferences = {
        userId: 'user1',
        age: 20,
      };

      const result = service.getPersonalizedArticles(
        preferences,
        { page: 1, limit: 10 }
      );

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(article => {
        if (article.metadata?.ageRange) {
          const { min, max } = article.metadata.ageRange;
          const isInRange = (min === undefined || 20 >= min) && 
                           (max === undefined || 20 <= max);
          expect(isInRange).toBe(true);
        }
      });
    });

    it('should prioritize articles matching user goals', () => {
      const preferences: UserPreferences = {
        userId: 'user1',
        goals: ['web-development', 'learn-programming'],
      };

      const result = service.getPersonalizedArticles(
        preferences,
        { page: 1, limit: 10 }
      );

      expect(result.data.length).toBeGreaterThan(0);
      
      const articlesWithMatchingGoals = result.data.filter(article =>
        article.metadata?.goals?.some(goal => 
          preferences.goals?.includes(goal)
        )
      );
      
      expect(articlesWithMatchingGoals.length).toBeGreaterThan(0);
    });

    it('should apply combined personalization filters', () => {
      const preferences: UserPreferences = {
        userId: 'user1',
        level: 'beginner',
        age: 25,
        goals: ['web-development'],
      };

      const result = service.getPersonalizedArticles(
        preferences,
        { page: 1, limit: 10 }
      );

      expect(result.data.length).toBeGreaterThan(0);

      const firstArticle = result.data[0];
      const hasMatchingLevel = firstArticle.metadata?.difficulty === 'beginner';
      const hasMatchingGoals = firstArticle.metadata?.goals?.includes('web-development');

      expect(hasMatchingLevel || hasMatchingGoals).toBe(true);
    });

    it('should return articles with higher relevance scores first', () => {
      const preferences: UserPreferences = {
        userId: 'user1',
        level: 'beginner',
        age: 20,
        goals: ['learn-programming', 'web-development'],
      };

      const result = service.getPersonalizedArticles(
        preferences,
        { page: 1, limit: 10 }
      );

      expect(result.data.length).toBeGreaterThan(1);

      const firstArticle = result.data[0];
      const lastArticle = result.data[result.data.length - 1];

      const countMatches = (article: Article): number => {
        let matches = 0;
        if (article.metadata?.difficulty === preferences.level) matches++;
        if (article.metadata?.ageRange) {
          const { min, max } = article.metadata.ageRange;
          if ((min === undefined || preferences.age! >= min) &&
              (max === undefined || preferences.age! <= max)) {
            matches++;
          }
        }
        if (article.metadata?.goals?.some(goal => preferences.goals?.includes(goal))) {
          matches++;
        }
        return matches;
      };

      const firstMatches = countMatches(firstArticle);
      const lastMatches = countMatches(lastArticle);

      expect(firstMatches).toBeGreaterThanOrEqual(lastMatches);
    });
  });

  describe('pagination', () => {
    it('should handle first page correctly', () => {
      const result = service.getArticles({}, { page: 1, limit: 2 });

      expect(result.pagination.hasPrev).toBe(false);
      expect(result.pagination.page).toBe(1);
    });

    it('should handle last page correctly', () => {
      const totalArticles = articleStore.getAllArticles().length;
      const limit = 2;
      const lastPage = Math.ceil(totalArticles / limit);

      const result = service.getArticles({}, { page: lastPage, limit });

      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.page).toBe(lastPage);
    });

    it('should handle middle pages correctly', () => {
      const result = service.getArticles({}, { page: 2, limit: 1 });

      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
      expect(result.pagination.page).toBe(2);
    });

    it('should calculate total pages correctly', () => {
      const totalArticles = articleStore.getAllArticles().length;
      const limit = 2;
      const expectedPages = Math.ceil(totalArticles / limit);

      const result = service.getArticles({}, { page: 1, limit });

      expect(result.pagination.totalPages).toBe(expectedPages);
    });
  });

  describe('getArticlesByCategory', () => {
    it('should return only articles from specified category', () => {
      const result = service.getArticlesByCategory('1', { page: 1, limit: 10 });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(article => {
        expect(article.categories).toContain('1');
      });
    });

    it('should support pagination', () => {
      const result = service.getArticlesByCategory('1', { page: 1, limit: 1 });

      expect(result.data.length).toBe(1);
      expect(result.pagination.limit).toBe(1);
    });
  });

  describe('getArticlesByTag', () => {
    it('should return only articles with specified tag', () => {
      const result = service.getArticlesByTag('4', { page: 1, limit: 10 });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(article => {
        expect(article.tags).toContain('4');
      });
    });

    it('should support pagination', () => {
      const result = service.getArticlesByTag('4', { page: 1, limit: 1 });

      expect(result.data.length).toBe(1);
      expect(result.pagination.limit).toBe(1);
    });
  });

  describe('searchArticles', () => {
    it('should search across title, excerpt, and body', () => {
      const result = service.searchArticles('TypeScript', { page: 1, limit: 10 });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(article => {
        const content = `${article.title} ${article.excerpt} ${article.body}`.toLowerCase();
        expect(content).toContain('typescript');
      });
    });

    it('should be case-insensitive', () => {
      const lowerResult = service.searchArticles('javascript', { page: 1, limit: 10 });
      const upperResult = service.searchArticles('JAVASCRIPT', { page: 1, limit: 10 });
      const mixedResult = service.searchArticles('JavaScript', { page: 1, limit: 10 });

      expect(lowerResult.data.length).toBe(upperResult.data.length);
      expect(lowerResult.data.length).toBe(mixedResult.data.length);
    });
  });

  describe('getArticleById and getArticleBySlug', () => {
    it('should retrieve article by id', () => {
      const article = service.getArticleById('1');

      expect(article).toBeDefined();
      expect(article?.id).toBe('1');
    });

    it('should retrieve article by slug', () => {
      const article = service.getArticleBySlug('intro-to-javascript');

      expect(article).toBeDefined();
      expect(article?.slug).toBe('intro-to-javascript');
    });

    it('should return undefined for non-existent id', () => {
      const article = service.getArticleById('non-existent');

      expect(article).toBeUndefined();
    });

    it('should return undefined for non-existent slug', () => {
      const article = service.getArticleBySlug('non-existent');

      expect(article).toBeUndefined();
    });
  });
});
