import { Request, Response } from 'express';
import { favoriteService } from '../services/favorite.service';

export class FavoriteController {
  async addFavorite(req: Request, res: Response): Promise<void> {
    try {
      const { userId, articleId } = req.body;

      if (!userId || !articleId) {
        res.status(400).json({ error: 'userId and articleId are required' });
        return;
      }

      const favorite = favoriteService.addFavorite(userId, articleId);

      if (!favorite) {
        res.status(400).json({ error: 'Article not found or already favorited' });
        return;
      }

      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add favorite' });
    }
  }

  async removeFavorite(req: Request, res: Response): Promise<void> {
    try {
      const { userId, articleId } = req.params;

      const removed = favoriteService.removeFavorite(userId, articleId);

      if (!removed) {
        res.status(404).json({ error: 'Favorite not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove favorite' });
    }
  }

  async getUserFavorites(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const favorites = favoriteService.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  }

  async checkFavorite(req: Request, res: Response): Promise<void> {
    try {
      const { userId, articleId } = req.params;
      const isFavorite = favoriteService.isFavorite(userId, articleId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check favorite status' });
    }
  }
}

export const favoriteController = new FavoriteController();
