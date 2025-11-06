const quickLinksService = require('../services/quickLinksService');

describe('QuickLinksService', () => {
  describe('getQuickLinks', () => {
    it('should return quick links with total count', () => {
      const result = quickLinksService.getQuickLinks();
      
      expect(result).toHaveProperty('links');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.links)).toBe(true);
      expect(typeof result.total).toBe('number');
    });

    it('should return links with correct structure', () => {
      const result = quickLinksService.getQuickLinks();
      
      result.links.forEach(link => {
        expect(link).toHaveProperty('id');
        expect(link).toHaveProperty('title');
        expect(link).toHaveProperty('url');
        expect(link).toHaveProperty('icon');
        expect(link).toHaveProperty('category');
        expect(link).toHaveProperty('description');
      });
    });

    it('should have total matching links length', () => {
      const result = quickLinksService.getQuickLinks();
      
      expect(result.total).toBe(result.links.length);
    });
  });

  describe('getQuickLinksByCategory', () => {
    it('should filter links by category', () => {
      const category = 'health';
      const result = quickLinksService.getQuickLinksByCategory(category);
      
      expect(result).toHaveProperty('links');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('total');
      expect(result.category).toBe(category);
      
      result.links.forEach(link => {
        expect(link.category).toBe(category);
      });
    });

    it('should return empty array for non-existent category', () => {
      const result = quickLinksService.getQuickLinksByCategory('nonexistent');
      
      expect(result.links).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should have total matching filtered links length', () => {
      const result = quickLinksService.getQuickLinksByCategory('health');
      
      expect(result.total).toBe(result.links.length);
    });
  });

  describe('getQuickLinkById', () => {
    it('should return link by id', () => {
      const result = quickLinksService.getQuickLinkById(1);
      
      expect(result).not.toBeNull();
      expect(result.id).toBe(1);
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('url');
    });

    it('should return null for non-existent id', () => {
      const result = quickLinksService.getQuickLinkById(9999);
      
      expect(result).toBeNull();
    });
  });

  describe('getCategories', () => {
    it('should return all categories with counts', () => {
      const result = quickLinksService.getCategories();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(category => {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('count');
        expect(typeof category.name).toBe('string');
        expect(typeof category.count).toBe('number');
        expect(category.count).toBeGreaterThan(0);
      });
    });

    it('should have unique categories', () => {
      const result = quickLinksService.getCategories();
      const names = result.map(c => c.name);
      const uniqueNames = [...new Set(names)];
      
      expect(names.length).toBe(uniqueNames.length);
    });
  });
});
