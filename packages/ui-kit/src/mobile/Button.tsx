import React from 'react';
import { Button as PaperButton } from 'react-native-paper';
import { theme } from '../tokens';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  children: string;
  onPress?: () => void;
  loading?: boolean;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  children,
  onPress,
  loading = false,
  icon,
}) => {
  const getMode = () => {
    switch (variant) {
      case 'outlined':
        return 'outlined';
      case 'text':
        return 'text';
      default:
        return 'contained';
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case 'secondary':
        return theme.colors.secondary[500];
      case 'primary':
      default:
        return theme.colors.primary[500];
    }
  };

  const getContentStyle = () => {
    switch (size) {
      case 'small':
        return {
          height: 32,
          paddingHorizontal: theme.spacing[2],
        };
      case 'large':
        return {
          height: 48,
          paddingHorizontal: theme.spacing[6],
        };
      case 'medium':
      default:
        return {
          height: 40,
          paddingHorizontal: theme.spacing[4],
        };
    }
  };

  const getLabelStyle = () => {
    switch (size) {
      case 'small':
        return {
          fontSize: theme.fontSizes.sm,
        };
      case 'large':
        return {
          fontSize: theme.fontSizes.lg,
        };
      case 'medium':
      default:
        return {
          fontSize: theme.fontSizes.base,
        };
    }
  };

  return (
    <PaperButton
      mode={getMode()}
      buttonColor={variant === 'outlined' || variant === 'text' ? undefined : getButtonColor()}
      textColor={
        variant === 'outlined' || variant === 'text'
          ? getButtonColor()
          : theme.semanticColors.text.inverse
      }
      disabled={disabled}
      onPress={onPress}
      loading={loading}
      icon={icon}
      contentStyle={getContentStyle()}
      labelStyle={getLabelStyle()}
      style={{
        width: fullWidth ? '100%' : undefined,
        borderRadius: theme.borderRadius.base,
      }}
    >
      {children}
    </PaperButton>
  );
};
