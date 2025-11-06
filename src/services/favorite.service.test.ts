import { FavoriteService } from './favorite.service';
import { articleStore } from '../models/article.model';

jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('FavoriteService', () => {
  let service: FavoriteService;

  beforeEach(() => {
    service = new FavoriteService();
    while (articleStore.getFavoritesByUser('test-user').length > 0) {
      const favorites = articleStore.getFavoritesByUser('test-user');
      if (favorites.length > 0) {
        articleStore.removeFavorite('test-user', favorites[0].articleId);
      }
    }
  });

  describe('addFavorite', () => {
    it('should add a favorite successfully', () => {
      const favorite = service.addFavorite('test-user', '1');

      expect(favorite).not.toBeNull();
      expect(favorite?.userId).toBe('test-user');
      expect(favorite?.articleId).toBe('1');
    });

    it('should not add duplicate favorites', () => {
      service.addFavorite('test-user', '1');
      const duplicate = service.addFavorite('test-user', '1');

      expect(duplicate).toBeNull();
    });

    it('should return null for non-existent article', () => {
      const favorite = service.addFavorite('test-user', 'non-existent');

      expect(favorite).toBeNull();
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite successfully', () => {
      service.addFavorite('test-user', '1');
      const removed = service.removeFavorite('test-user', '1');

      expect(removed).toBe(true);
    });

    it('should return false for non-existent favorite', () => {
      const removed = service.removeFavorite('test-user', 'non-existent');

      expect(removed).toBe(false);
    });
  });

  describe('getUserFavorites', () => {
    it('should return all favorites for a user', () => {
      service.addFavorite('test-user', '1');
      service.addFavorite('test-user', '2');

      const favorites = service.getUserFavorites('test-user');

      expect(favorites.length).toBe(2);
      expect(favorites[0].id).toBe('1');
      expect(favorites[1].id).toBe('2');
    });

    it('should return empty array for user with no favorites', () => {
      const favorites = service.getUserFavorites('new-user');

      expect(favorites).toEqual([]);
    });
  });

  describe('isFavorite', () => {
    it('should return true for favorited article', () => {
      service.addFavorite('test-user', '1');
      const isFav = service.isFavorite('test-user', '1');

      expect(isFav).toBe(true);
    });

    it('should return false for non-favorited article', () => {
      const isFav = service.isFavorite('test-user', '1');

      expect(isFav).toBe(false);
    });
  });
});
