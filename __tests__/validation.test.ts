import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateName,
} from '../src/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('should reject invalid email format', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('SecurePass123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password is required');
    });

    it('should reject short password', () => {
      const result = validatePassword('Pass1');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters');
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('PASSWORD123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = validatePassword('PasswordTest');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must contain at least one number');
    });
  });

  describe('validatePasswordConfirmation', () => {
    it('should validate matching passwords', () => {
      const result = validatePasswordConfirmation('SecurePass123', 'SecurePass123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty confirmation', () => {
      const result = validatePasswordConfirmation('SecurePass123', '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please confirm your password');
    });

    it('should reject non-matching passwords', () => {
      const result = validatePasswordConfirmation('SecurePass123', 'DifferentPass456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Passwords do not match');
    });
  });

  describe('validateName', () => {
    it('should validate correct name', () => {
      const result = validateName('John');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty name', () => {
      const result = validateName('', 'First name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('First name is required');
    });

    it('should reject too short name', () => {
      const result = validateName('J', 'Name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name must be at least 2 characters');
    });

    it('should reject too long name', () => {
      const result = validateName('a'.repeat(51), 'Name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name must be less than 50 characters');
    });
  });
});
