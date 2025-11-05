const motivationalService = require('../services/motivationalService');

describe('MotivationalService', () => {
  describe('getDailyMotivation', () => {
    it('should return a motivation quote with date', () => {
      const result = motivationalService.getDailyMotivation();
      
      expect(result).toHaveProperty('quote');
      expect(result).toHaveProperty('date');
      expect(result.quote).toHaveProperty('id');
      expect(result.quote).toHaveProperty('text');
      expect(result.quote).toHaveProperty('author');
      expect(result.quote).toHaveProperty('category');
      expect(typeof result.quote.text).toBe('string');
      expect(typeof result.quote.author).toBe('string');
    });

    it('should return consistent quote for the same day', () => {
      const result1 = motivationalService.getDailyMotivation();
      const result2 = motivationalService.getDailyMotivation();
      
      expect(result1.quote.id).toBe(result2.quote.id);
    });

    it('should return a valid date string', () => {
      const result = motivationalService.getDailyMotivation();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      expect(result.date).toMatch(dateRegex);
    });
  });

  describe('getRandomMotivation', () => {
    it('should return a motivation quote', () => {
      const result = motivationalService.getRandomMotivation();
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('author');
      expect(result).toHaveProperty('category');
    });

    it('should return a quote from the available quotes', () => {
      const result = motivationalService.getRandomMotivation();
      const allQuotes = motivationalService.getAllMotivations();
      const ids = allQuotes.map(q => q.id);
      
      expect(ids).toContain(result.id);
    });
  });

  describe('getAllMotivations', () => {
    it('should return an array of motivations', () => {
      const result = motivationalService.getAllMotivations();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have valid structure for all quotes', () => {
      const result = motivationalService.getAllMotivations();
      
      result.forEach(quote => {
        expect(quote).toHaveProperty('id');
        expect(quote).toHaveProperty('text');
        expect(quote).toHaveProperty('author');
        expect(quote).toHaveProperty('category');
      });
    });
  });
});
