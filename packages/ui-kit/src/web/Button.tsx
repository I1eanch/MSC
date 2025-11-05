import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../tokens';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const getVariantStyles = (variant: ButtonProps['variant']) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${theme.colors.primary[500]};
        color: ${theme.semanticColors.text.inverse};
        border: none;
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primary[600]};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.colors.primary[700]};
        }
      `;
    case 'secondary':
      return css`
        background-color: ${theme.colors.secondary[500]};
        color: ${theme.semanticColors.text.inverse};
        border: none;
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.secondary[600]};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.colors.secondary[700]};
        }
      `;
    case 'outlined':
      return css`
        background-color: transparent;
        color: ${theme.colors.primary[500]};
        border: ${theme.borderWidthPx[2]} solid ${theme.colors.primary[500]};
        
        &:hover:not(:disabled) {
          background-color: ${theme.semanticColors.action.hover};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.semanticColors.action.selected};
        }
      `;
    case 'text':
      return css`
        background-color: transparent;
        color: ${theme.colors.primary[500]};
        border: none;
        
        &:hover:not(:disabled) {
          background-color: ${theme.semanticColors.action.hover};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.semanticColors.action.selected};
        }
      `;
    default:
      return '';
  }
};

const getSizeStyles = (size: ButtonProps['size']) => {
  switch (size) {
    case 'small':
      return css`
        padding: ${theme.spacingPx[1]} ${theme.spacingPx[3]};
        font-size: ${theme.fontSizes.sm}px;
        min-height: 32px;
      `;
    case 'large':
      return css`
        padding: ${theme.spacingPx[3]} ${theme.spacingPx[6]};
        font-size: ${theme.fontSizes.lg}px;
        min-height: 48px;
      `;
    case 'medium':
    default:
      return css`
        padding: ${theme.spacingPx[2]} ${theme.spacingPx[4]};
        font-size: ${theme.fontSizes.base}px;
        min-height: 40px;
      `;
  }
};

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.fontWeights.medium};
  letter-spacing: ${theme.letterSpacing.wide}px;
  text-transform: uppercase;
  border-radius: ${theme.borderRadiusPx.base};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-family: ${theme.fontFamilies.primary.medium};
  
  ${props => getVariantStyles(props.variant || 'primary')}
  ${props => getSizeStyles(props.size || 'medium')}
  
  ${props =>
    props.fullWidth &&
    css`
      width: 100%;
    `}
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background-color: ${theme.semanticColors.action.disabledBackground};
    color: ${theme.semanticColors.text.disabled};
  }
  
  &:focus-visible {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      onClick={onClick}
      type={type}
    >
      {children}
    </StyledButton>
  );
};
