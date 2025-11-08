import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../tokens';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  padding?: keyof typeof theme.spacing;
  onClick?: () => void;
}

const StyledCard = styled.div<{ elevation: number; clickable: boolean }>`
  background-color: ${theme.semanticColors.background.paper};
  border-radius: ${theme.borderRadiusPx.md};
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  
  ${props => {
    const elevationMap: Record<number, string> = {
      0: theme.shadows.none,
      1: theme.shadows.sm,
      2: theme.shadows.base,
      3: theme.shadows.md,
      4: theme.shadows.lg,
      5: theme.shadows.xl,
    };
    return css`
      box-shadow: ${elevationMap[props.elevation] || theme.shadows.base};
    `;
  }}
  
  ${props =>
    props.clickable &&
    css`
      cursor: pointer;
      
      &:hover {
        box-shadow: ${theme.shadows.lg};
        transform: translateY(-2px);
      }
      
      &:active {
        transform: translateY(0);
      }
    `}
`;

const CardHeader = styled.div<{ padding: string }>`
  padding: ${props => props.padding};
  border-bottom: ${theme.borderWidthPx[1]} solid ${theme.semanticColors.divider};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${theme.fontSizes.lg}px;
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.semanticColors.text.primary};
`;

const CardSubtitle = styled.p`
  margin: ${theme.spacingPx[1]} 0 0 0;
  font-size: ${theme.fontSizes.sm}px;
  color: ${theme.semanticColors.text.secondary};
`;

const CardContent = styled.div<{ padding: string }>`
  padding: ${props => props.padding};
`;

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  elevation = 1,
  padding = 4,
  onClick,
}) => {
  const paddingValue = theme.spacingPx[padding];
  const hasHeader = title || subtitle;

  return (
    <StyledCard elevation={elevation} clickable={!!onClick} onClick={onClick}>
      {hasHeader && (
        <CardHeader padding={paddingValue}>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        </CardHeader>
      )}
      {children && <CardContent padding={paddingValue}>{children}</CardContent>}
    </StyledCard>
  );
};
