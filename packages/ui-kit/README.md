# UI Kit - Design System

A comprehensive design system package with shared UI components, design tokens, and theming for web and mobile applications.

## 📦 Features

- **Design Tokens**: Colors, typography, spacing, shadows, and border radius
- **Web Components**: Built with styled-components for React web applications
- **Mobile Components**: Built with React Native Paper for mobile applications
- **Storybook**: Interactive documentation for all components
- **TypeScript**: Full type safety for all components and tokens
- **Backend Compatible**: Export theme tokens for use in email templates and server-side rendering

## 🚀 Installation

```bash
# From the monorepo root
pnpm install
```

## 📖 Usage

### Web Components

```tsx
import { Button, Input, Card } from '@packages/ui-kit/web';
import { theme } from '@packages/ui-kit/tokens';

function App() {
  return (
    <div>
      <Button variant="primary" size="medium">
        Click Me
      </Button>
      
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
      />
      
      <Card title="Card Title" subtitle="Subtitle">
        Card content goes here
      </Card>
    </div>
  );
}
```

### Mobile Components

```tsx
import { Button, Input, Card } from '@packages/ui-kit/mobile';
import { theme } from '@packages/ui-kit/tokens';

function MobileApp() {
  return (
    <View>
      <Button variant="primary" size="medium">
        Click Me
      </Button>
      
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
      />
      
      <Card title="Card Title" subtitle="Subtitle">
        <Text>Card content goes here</Text>
      </Card>
    </View>
  );
}
```

### Design Tokens

```tsx
import { theme } from '@packages/ui-kit/tokens';

// Access colors
const primaryColor = theme.colors.primary[500];
const textColor = theme.semanticColors.text.primary;

// Access spacing
const padding = theme.spacing[4]; // 16

// Access typography
const heading = theme.typography.h1;

// For backend (Node.js) - tokens work without React
const tokens = require('@packages/ui-kit/tokens');
const emailButtonColor = tokens.theme.colors.primary[500];
```

## 🎨 Design Tokens

### Colors

The design system includes a comprehensive color palette:

- **Primary**: Blue color scale (50-900)
- **Secondary**: Purple color scale (50-900)
- **Neutral**: Grayscale (0-1000)
- **Success**: Green color scale (50-900)
- **Error**: Red color scale (50-900)
- **Warning**: Orange color scale (50-900)
- **Info**: Light blue color scale (50-900)
- **Semantic Colors**: Predefined colors for backgrounds, text, actions, borders

### Typography

Typography system includes:

- **Font Families**: System fonts for regular, medium, and bold weights
- **Font Sizes**: xs (12px) to 6xl (60px)
- **Font Weights**: light (300) to extrabold (800)
- **Line Heights**: tight (1.2) to loose (2)
- **Letter Spacing**: tight (-0.5) to wider (1)
- **Typography Variants**: h1-h6, body1, body2, button, caption, overline

### Spacing

Consistent spacing scale from 0 to 32:
- 0: 0px
- 1: 4px
- 2: 8px
- 3: 12px
- 4: 16px
- 5: 20px
- 6: 24px
- 7: 28px
- 8: 32px
- 10: 40px
- 12: 48px
- 16: 64px
- 20: 80px
- 24: 96px
- 32: 128px

### Shadows

Web shadows (CSS box-shadow):
- none, sm, base, md, lg, xl, 2xl

Mobile elevation (React Native):
- 0-5 with corresponding shadow properties

### Border Radius

Border radius values:
- none: 0px
- sm: 4px
- base: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px
- full: 9999px (circular)

## 🔧 Components

### Button

Available variants:
- `primary`: Solid primary color button
- `secondary`: Solid secondary color button
- `outlined`: Outlined button with border
- `text`: Text-only button without background

Sizes: `small`, `medium`, `large`

### Input

Text input component with:
- Label support
- Helper text
- Error states
- Multiple input types (text, email, password, number, tel, url)
- Full width option

### Card

Card component with:
- Optional title and subtitle
- Customizable elevation/shadow
- Customizable padding
- Click handler support
- Flexible content area

## 📚 Storybook

### Web Storybook

Run Storybook for web components:

```bash
cd packages/ui-kit
pnpm storybook:web
```

Open [http://localhost:6006](http://localhost:6006) to view the component documentation.

### Build Storybook

```bash
pnpm storybook:web:build
```

## 🏗️ Development

### Building

```bash
pnpm build
```

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

### Formatting

```bash
pnpm format
```

## 📄 Exports

The package provides multiple entry points:

- `@packages/ui-kit`: Main entry (all exports)
- `@packages/ui-kit/tokens`: Design tokens only
- `@packages/ui-kit/web`: Web components only
- `@packages/ui-kit/mobile`: Mobile components only

## 🔌 Backend Integration

Design tokens can be used in backend code for consistent theming in email templates:

```javascript
// In a Node.js email template
const { theme } = require('@packages/ui-kit/tokens');

const emailTemplate = `
  <button style="
    background-color: ${theme.colors.primary[500]};
    color: ${theme.semanticColors.text.inverse};
    padding: ${theme.spacingPx[2]} ${theme.spacingPx[4]};
    border-radius: ${theme.borderRadiusPx.base};
    font-size: ${theme.fontSizes.base}px;
    font-weight: ${theme.fontWeights.medium};
  ">
    Click Here
  </button>
`;
```

## 📝 Adding New Components

1. Create component in `src/web/` or `src/mobile/`
2. Export from respective index file
3. Create `.stories.tsx` file for Storybook documentation
4. Add TypeScript types
5. Update this README

## 🤝 Contributing

Please follow the existing code style and patterns when contributing new components or features.
