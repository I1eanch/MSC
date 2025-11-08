export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  return { isValid: true };
};

export const validatePasswordConfirmation = (
  password: string,
  confirmation: string
): ValidationResult => {
  if (!confirmation) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmation) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  if (!name) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (name.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }

  if (name.length > 50) {
    return { isValid: false, error: `${fieldName} must be less than 50 characters` };
  }

  return { isValid: true };
};
