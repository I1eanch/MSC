export interface ButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const colors = {
  primary: '#0066CC',
  secondary: '#666666',
  success: '#00AA00',
  error: '#CC0000',
  warning: '#FFAA00',
  background: '#FFFFFF',
  text: '#000000',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

export const typography = {
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    bold: 700,
  },
};
