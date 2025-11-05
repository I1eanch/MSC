import React from 'react';
import { TextInput as PaperTextInput, HelperText } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { theme } from '../tokens';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  fullWidth?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  placeholder,
  disabled = false,
  error = false,
  helperText,
  label,
  fullWidth = false,
  secureTextEntry,
  multiline = false,
  numberOfLines = 1,
  onChangeText,
  onBlur,
  onFocus,
}) => {
  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'number':
        return 'numeric';
      case 'tel':
        return 'phone-pad';
      default:
        return 'default';
    }
  };

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      <PaperTextInput
        label={label}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        onChangeText={onChangeText}
        onBlur={onBlur}
        onFocus={onFocus}
        keyboardType={getKeyboardType()}
        secureTextEntry={secureTextEntry || type === 'password'}
        multiline={multiline}
        numberOfLines={numberOfLines}
        mode="outlined"
        style={styles.input}
        outlineColor={theme.semanticColors.border.default}
        activeOutlineColor={error ? theme.colors.error[500] : theme.colors.primary[500]}
        theme={{
          colors: {
            background: theme.semanticColors.background.default,
          },
          roundness: theme.borderRadius.base,
        }}
      />
      {helperText && (
        <HelperText type={error ? 'error' : 'info'} visible={!!helperText}>
          {helperText}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[2],
  },
  fullWidth: {
    width: '100%',
  },
  input: {
    fontSize: theme.fontSizes.base,
  },
});
