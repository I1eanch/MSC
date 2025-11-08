import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../tokens';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  fullWidth?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

const InputWrapper = styled.div<{ fullWidth?: boolean }>`
  display: inline-flex;
  flex-direction: column;
  gap: ${theme.spacingPx[1]};
  
  ${props =>
    props.fullWidth &&
    css`
      width: 100%;
    `}
`;

const Label = styled.label`
  font-size: ${theme.fontSizes.sm}px;
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.semanticColors.text.primary};
`;

const StyledInput = styled.input<{ error?: boolean }>`
  padding: ${theme.spacingPx[2]} ${theme.spacingPx[3]};
  font-size: ${theme.fontSizes.base}px;
  font-family: ${theme.fontFamilies.primary.regular};
  color: ${theme.semanticColors.text.primary};
  background-color: ${theme.semanticColors.background.default};
  border: ${theme.borderWidthPx[1]} solid ${theme.semanticColors.border.default};
  border-radius: ${theme.borderRadiusPx.base};
  outline: none;
  transition: all 0.2s ease-in-out;
  min-height: 40px;
  
  &:focus {
    border-color: ${theme.semanticColors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.primary[50]};
  }
  
  &:disabled {
    background-color: ${theme.semanticColors.action.disabledBackground};
    color: ${theme.semanticColors.text.disabled};
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${theme.semanticColors.text.disabled};
  }
  
  ${props =>
    props.error &&
    css`
      border-color: ${theme.semanticColors.border.error};
      
      &:focus {
        border-color: ${theme.semanticColors.border.error};
        box-shadow: 0 0 0 3px ${theme.colors.error[50]};
      }
    `}
`;

const HelperText = styled.span<{ error?: boolean }>`
  font-size: ${theme.fontSizes.xs}px;
  color: ${props => (props.error ? theme.colors.error[500] : theme.semanticColors.text.secondary)};
`;

export const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  placeholder,
  disabled = false,
  error = false,
  helperText,
  label,
  fullWidth = false,
  onChange,
  onBlur,
  onFocus,
}) => {
  return (
    <InputWrapper fullWidth={fullWidth}>
      {label && <Label>{label}</Label>}
      <StyledInput
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {helperText && <HelperText error={error}>{helperText}</HelperText>}
    </InputWrapper>
  );
};
