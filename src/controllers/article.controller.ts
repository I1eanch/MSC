import { Request, Response } from 'express';
import { articleService } from '../services/article.service';
import { ArticleFilters, PaginationParams, UserPreferences } from '../types/article.types';

export class ArticleController {
  async getArticles(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const pagination: PaginationParams = { page, limit };

      const filters: ArticleFilters = {};
      
      if (req.query.categories) {
        filters.categories = Array.isArray(req.query.categories) 
          ? req.query.categories as string[]
          : [req.query.categories as string];
      }
      
      if (req.query.tags) {
        filters.tags = Array.isArray(req.query.tags)
          ? req.query.tags as string[]
          : [req.query.tags as string];
      }
      
      if (req.query.search) {
        filters.search = req.query.search as string;
      }
      
      if (req.query.difficulty) {
        filters.difficulty = req.query.difficulty as string;
      }
      
      if (req.query.goals) {
        filters.goals = Array.isArray(req.query.goals)
          ? req.query.goals as string[]
          : [req.query.goals as string];
      }

      if (req.query.minAge || req.query.maxAge) {
        filters.ageRange = {
          min: req.query.minAge ? parseInt(req.query.minAge as string) : undefined,
          max: req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined,
        };
      }

      let preferences: UserPreferences | undefined;
      if (req.query.personalize === 'true' && req.query.userId) {
        preferences = {
          userId: req.query.userId as string,
          level: req.query.level as any,
          age: req.query.age ? parseInt(req.query.age as string) : undefined,
          goals: req.query.userGoals 
            ? (Array.isArray(req.query.userGoals) 
              ? req.query.userGoals as string[]
              : [req.query.userGoals as string])
            : undefined,
        };
      }

      const result = articleService.getArticles(filters, pagination, preferences);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  }

  async getArticleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const article = articleService.getArticleById(id);
      
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  }

  async getArticleBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const article = articleService.getArticleBySlug(slug);
      
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  }

  async searchArticles(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const pagination: PaginationParams = { page, limit };

      const result = articleService.searchArticles(query, pagination);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search articles' });
    }
  }

  async getPersonalizedArticles(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const level = req.query.level as any;
      const age = req.query.age ? parseInt(req.query.age as string) : undefined;
      const goals = req.query.goals 
        ? (Array.isArray(req.query.goals) 
          ? req.query.goals as string[]
          : [req.query.goals as string])
        : undefined;

      const preferences: UserPreferences = {
        userId,
        level,
        age,
        goals,
      };

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const pagination: PaginationParams = { page, limit };

      const result = articleService.getPersonalizedArticles(preferences, pagination);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch personalized articles' });
    }
  }

  async getArticlesByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const pagination: PaginationParams = { page, limit };

      const result = articleService.getArticlesByCategory(categoryId, pagination);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch articles by category' });
    }
  }

  async getArticlesByTag(req: Request, res: Response): Promise<void> {
    try {
      const { tagId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const pagination: PaginationParams = { page, limit };

      const result = articleService.getArticlesByTag(tagId, pagination);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch articles by tag' });
    }
  }

  async createArticle(req: Request, res: Response): Promise<void> {
    try {
      const article = req.body;
      const created = articleService.createArticle(article);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create article' });
    }
  }

  async updateArticle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = articleService.updateArticle(id, updates);
      
      if (!updated) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update article' });
    }
  }

  async deleteArticle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = articleService.deleteArticle(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete article' });
    }
  }
}

export const articleController = new ArticleController();
