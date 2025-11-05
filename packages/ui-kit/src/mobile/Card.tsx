import React from 'react';
import { Card as PaperCard, Text } from 'react-native-paper';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme, elevation as elevationStyles } from '../tokens';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  padding?: keyof typeof theme.spacing;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  elevation = 1,
  padding = 4,
  onPress,
}) => {
  const hasHeader = title || subtitle;
  const paddingValue = theme.spacing[padding];

  const content = (
    <View
      style={[
        styles.card,
        elevationStyles[elevation as keyof typeof elevationStyles],
        { borderRadius: theme.borderRadius.md },
      ]}
    >
      {hasHeader && (
        <PaperCard.Title
          title={title}
          subtitle={subtitle}
          titleStyle={styles.title}
          subtitleStyle={styles.subtitle}
          style={{ paddingHorizontal: paddingValue, paddingVertical: paddingValue }}
        />
      )}
      {children && (
        <PaperCard.Content style={{ padding: paddingValue }}>
          {children}
        </PaperCard.Content>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.semanticColors.background.paper,
    overflow: 'hidden',
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.semanticColors.text.primary,
  },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.semanticColors.text.secondary,
    marginTop: theme.spacing[1],
  },
});
