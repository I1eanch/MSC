import { v4 as uuidv4 } from 'uuid';
import { Favorite, Article } from '../types/article.types';
import { articleStore } from '../models/article.model';

export class FavoriteService {
  addFavorite(userId: string, articleId: string): Favorite | null {
    const article = articleStore.getArticleById(articleId);
    if (!article) {
      return null;
    }

    if (articleStore.isFavorite(userId, articleId)) {
      return null;
    }

    const favorite: Favorite = {
      id: uuidv4(),
      userId,
      articleId,
      createdAt: new Date(),
    };

    return articleStore.addFavorite(favorite);
  }

  removeFavorite(userId: string, articleId: string): boolean {
    return articleStore.removeFavorite(userId, articleId);
  }

  getUserFavorites(userId: string): Article[] {
    const favorites = articleStore.getFavoritesByUser(userId);
    const articles: Article[] = [];

    for (const favorite of favorites) {
      const article = articleStore.getArticleById(favorite.articleId);
      if (article) {
        articles.push(article);
      }
    }

    return articles;
  }

  isFavorite(userId: string, articleId: string): boolean {
    return articleStore.isFavorite(userId, articleId);
  }
}

export const favoriteService = new FavoriteService();
