# Design System Documentation

This document provides comprehensive information about the design system implementation in the `@packages/ui-kit` package.

## Overview

The design system provides a unified visual language and component library for all applications in the monorepo, including:

- Web applications (admin dashboard)
- Mobile applications (React Native)
- Backend services (email templates)

## Architecture

### Package Structure

```
packages/ui-kit/
├── src/
│   ├── tokens/           # Design tokens (colors, typography, spacing, etc.)
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── shadows.ts
│   │   ├── borders.ts
│   │   ├── index.ts
│   │   └── Tokens.stories.tsx
│   ├── web/             # Web components (styled-components)
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   ├── Input.tsx
│   │   ├── Input.stories.tsx
│   │   ├── Card.tsx
│   │   ├── Card.stories.tsx
│   │   └── index.ts
│   ├── mobile/          # Mobile components (React Native Paper)
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   ├── Input.tsx
│   │   ├── Input.stories.tsx
│   │   ├── Card.tsx
│   │   ├── Card.stories.tsx
│   │   └── index.ts
│   └── index.ts
├── .storybook/          # Web Storybook configuration
│   ├── main.ts
│   └── preview.ts
├── .storybook-mobile/   # Mobile Storybook configuration
│   ├── main.js
│   ├── Storybook.tsx
│   └── storyLoader.js
├── package.json
├── tsconfig.json
└── README.md
```

## Design Tokens

Design tokens are the foundational elements of the design system. They are platform-agnostic values that can be used across web, mobile, and backend.

### Colors

**Color Palette Structure:**
- Each color has 10 shades (50, 100, 200, ..., 900)
- Primary: Blue tones
- Secondary: Purple tones
- Neutral: Grayscale (0-1000, with 0 being white and 1000 being black)
- Success: Green tones
- Error: Red tones
- Warning: Orange tones
- Info: Light blue tones

**Semantic Colors:**
Predefined colors for specific UI purposes:
- Background colors (default, paper, elevated)
- Text colors (primary, secondary, disabled, inverse)
- Action colors (active, hover, selected, disabled)
- Border colors (default, focus, error)

**Usage:**

```typescript
import { colors, semanticColors } from '@packages/ui-kit/tokens';

// Direct color access
const buttonColor = colors.primary[500];

// Semantic color access
const textColor = semanticColors.text.primary;
```

### Typography

**Font Sizes:** 12px to 60px (xs to 6xl)

**Font Weights:** light (300) to extrabold (800)

**Typography Variants:**
- Headings: h1 - h6
- Body: body1, body2
- Special: button, caption, overline

Each variant includes:
- fontSize
- fontWeight
- lineHeight
- letterSpacing
- textTransform (for button and overline)

**Usage:**

```typescript
import { typography } from '@packages/ui-kit/tokens';

const headingStyle = {
  fontSize: typography.h1.fontSize,
  fontWeight: typography.h1.fontWeight,
  lineHeight: typography.h1.lineHeight,
};
```

### Spacing

Consistent spacing scale based on multiples of 4:
- Values: 0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96, 128

Available in two formats:
- Numbers (for React Native): `spacing[4]` = 16
- Pixel strings (for web CSS): `spacingPx[4]` = "16px"

**Usage:**

```typescript
import { spacing, spacingPx } from '@packages/ui-kit/tokens';

// React Native
const mobileStyle = {
  padding: spacing[4], // 16
};

// Web CSS
const webStyle = css`
  padding: ${spacingPx[4]}; // "16px"
`;
```

### Shadows & Elevation

**Web Shadows:**
CSS box-shadow values: none, sm, base, md, lg, xl, 2xl

**Mobile Elevation:**
React Native shadow properties (0-5) with:
- shadowColor
- shadowOffset
- shadowOpacity
- shadowRadius
- elevation (Android)

**Usage:**

```typescript
import { shadows, elevation } from '@packages/ui-kit/tokens';

// Web
const webCard = css`
  box-shadow: ${shadows.md};
`;

// Mobile
const mobileCard = {
  ...elevation[3],
};
```

### Border Radius

Values: none (0), sm (4), base (8), md (12), lg (16), xl (24), 2xl (32), full (9999)

Available in pixel and string formats.

## Components

### Web Components

Built with styled-components for use in React web applications.

#### Button

**Props:**
- `variant`: 'primary' | 'secondary' | 'outlined' | 'text'
- `size`: 'small' | 'medium' | 'large'
- `disabled`: boolean
- `fullWidth`: boolean
- `onClick`: () => void
- `type`: 'button' | 'submit' | 'reset'

**Features:**
- Hover and active states
- Focus visible outline for accessibility
- Consistent sizing and spacing
- Disabled state styling

#### Input

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
- `value`: string
- `placeholder`: string
- `disabled`: boolean
- `error`: boolean
- `helperText`: string
- `label`: string
- `fullWidth`: boolean
- `onChange`: (event) => void

**Features:**
- Label support
- Helper text (normal and error states)
- Focus styling with ring
- Error state with red border
- Disabled state

#### Card

**Props:**
- `title`: string
- `subtitle`: string
- `elevation`: 0 | 1 | 2 | 3 | 4 | 5
- `padding`: number (spacing key)
- `onClick`: () => void
- `children`: ReactNode

**Features:**
- Optional header with title and subtitle
- Customizable elevation
- Hover effects when clickable
- Flexible content area

### Mobile Components

Built with React Native Paper for use in React Native applications.

#### Button

Similar API to web button but uses React Native Paper's Button component under the hood.

**Additional Props:**
- `loading`: boolean
- `icon`: string (icon name)
- `onPress`: () => void (instead of onClick)

#### Input

Uses React Native Paper's TextInput component.

**Additional Props:**
- `secureTextEntry`: boolean
- `multiline`: boolean
- `numberOfLines`: number
- `onChangeText`: (text: string) => void

#### Card

Uses React Native Paper's Card component with custom styling.

Similar props to web Card but with React Native-specific styling.

## Storybook

### Web Storybook

**Running:**
```bash
cd packages/ui-kit
pnpm storybook:web
```

Access at: http://localhost:6006

**Features:**
- Interactive component playground
- Props controls
- Design token documentation
- Visual regression testing support

**Stories Available:**
- Design System/Tokens (colors, typography, spacing, shadows, borders)
- Web/Button (all variants, sizes, states)
- Web/Input (all types, states, error handling)
- Web/Card (elevation levels, interactive examples)

### Mobile Storybook

**Setup:**
Mobile Storybook uses React Native Storybook which runs inside the mobile app.

**Configuration:**
Located in `.storybook-mobile/`

**Stories:**
- Mobile/Button
- Mobile/Input
- Mobile/Card

## Backend Integration

Design tokens can be imported and used in Node.js backend code without React dependencies.

### Email Templates

```javascript
const { theme } = require('@packages/ui-kit/tokens');

function generateButtonHtml(text, url) {
  return `
    <a href="${url}" style="
      display: inline-block;
      background-color: ${theme.colors.primary[500]};
      color: ${theme.semanticColors.text.inverse};
      padding: ${theme.spacingPx[2]} ${theme.spacingPx[4]};
      border-radius: ${theme.borderRadiusPx.base};
      text-decoration: none;
      font-size: ${theme.fontSizes.base}px;
      font-weight: ${theme.fontWeights.medium};
    ">
      ${text}
    </a>
  `;
}
```

### Server-Side Rendering

```javascript
const { theme } = require('@packages/ui-kit/tokens');

app.get('/api/theme', (req, res) => {
  res.json({
    colors: theme.colors,
    spacing: theme.spacing,
    typography: theme.typography,
  });
});
```

## Best Practices

### Using Design Tokens

1. **Always use tokens instead of hardcoded values**
   ```typescript
   // ✅ Good
   padding: theme.spacing[4]
   
   // ❌ Bad
   padding: 16
   ```

2. **Use semantic colors when appropriate**
   ```typescript
   // ✅ Good
   color: theme.semanticColors.text.primary
   
   // ❌ Less maintainable
   color: theme.colors.neutral[900]
   ```

3. **Maintain consistency across platforms**
   ```typescript
   // Use the same token values for web and mobile
   // This ensures visual consistency
   ```

### Component Development

1. **Export TypeScript types**
   ```typescript
   export interface ButtonProps {
     variant?: 'primary' | 'secondary';
     // ... other props
   }
   ```

2. **Provide sensible defaults**
   ```typescript
   const Button = ({ variant = 'primary', size = 'medium' }) => {
     // ...
   };
   ```

3. **Document with Storybook**
   - Create `.stories.tsx` file for each component
   - Show all variants and states
   - Include interactive examples

4. **Follow accessibility guidelines**
   - Provide focus states
   - Use semantic HTML
   - Support keyboard navigation

## Extending the Design System

### Adding New Tokens

1. Add token to appropriate file in `src/tokens/`
2. Update exports in `src/tokens/index.ts`
3. Create or update Storybook story to document
4. Update README

### Adding New Components

1. **Create component files:**
   - `src/web/ComponentName.tsx`
   - `src/mobile/ComponentName.tsx`

2. **Add stories:**
   - `src/web/ComponentName.stories.tsx`
   - `src/mobile/ComponentName.stories.tsx`

3. **Export from index files:**
   ```typescript
   // src/web/index.ts
   export { ComponentName } from './ComponentName';
   export type { ComponentNameProps } from './ComponentName';
   ```

4. **Document:**
   - Add component documentation to README
   - Include usage examples
   - Document all props

5. **Test:**
   - Verify component in Storybook
   - Test accessibility
   - Test responsive behavior

## Testing

### Visual Testing

Use Storybook for visual regression testing:

```bash
pnpm storybook:web:build
# Use tools like Chromatic or Percy for visual diffs
```

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## Deployment

### Publishing

The ui-kit package is private and used only within the monorepo. It's not published to npm.

### Consuming in Apps

```typescript
// In apps/admin-web
import { Button } from '@packages/ui-kit/web';

// In apps/mobile
import { Button } from '@packages/ui-kit/mobile';

// In apps/backend
const { theme } = require('@packages/ui-kit/tokens');
```

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors about missing types:

```bash
cd packages/ui-kit
pnpm build
```

### Storybook Not Starting

1. Clear cache:
   ```bash
   rm -rf node_modules/.cache
   ```

2. Reinstall dependencies:
   ```bash
   pnpm install
   ```

### React Native Paper Issues

Ensure peer dependencies are installed in the mobile app:

```bash
cd apps/mobile
pnpm add react-native-paper react-native-vector-icons
```

## Future Enhancements

Potential additions to the design system:

1. **More Components:**
   - Modal/Dialog
   - Toast/Snackbar
   - Tabs
   - Drawer/Navigation
   - Form components (Checkbox, Radio, Select)

2. **Theming:**
   - Dark mode support
   - Custom theme creation
   - Theme switching

3. **Animations:**
   - Transition tokens
   - Animation presets

4. **Icons:**
   - Icon library integration
   - Custom icon system

5. **Patterns:**
   - Layout components
   - Page templates
   - Common UI patterns

## Resources

- [Storybook Documentation](https://storybook.js.org/)
- [styled-components Documentation](https://styled-components.com/)
- [React Native Paper Documentation](https://callstack.github.io/react-native-paper/)
- [Design Tokens W3C Community Group](https://www.w3.org/community/design-tokens/)
