import type { Meta, StoryObj } from '@storybook/react';
import { theme } from './index';

const meta = {
  title: 'Design System/Tokens',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {
  render: () => (
    <div>
      <h2>Color Palette</h2>
      
      <h3>Primary</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {Object.entries(theme.colors.primary).map(([key, value]) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: value,
                borderRadius: '8px',
                border: '1px solid #ddd',
              }}
            />
            <div style={{ fontSize: '12px', marginTop: '4px' }}>{key}</div>
            <div style={{ fontSize: '10px', color: '#666' }}>{value}</div>
          </div>
        ))}
      </div>

      <h3>Secondary</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {Object.entries(theme.colors.secondary).map(([key, value]) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: value,
                borderRadius: '8px',
                border: '1px solid #ddd',
              }}
            />
            <div style={{ fontSize: '12px', marginTop: '4px' }}>{key}</div>
            <div style={{ fontSize: '10px', color: '#666' }}>{value}</div>
          </div>
        ))}
      </div>

      <h3>Neutral</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {Object.entries(theme.colors.neutral).map(([key, value]) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: value,
                borderRadius: '8px',
                border: '1px solid #ddd',
              }}
            />
            <div style={{ fontSize: '12px', marginTop: '4px' }}>{key}</div>
            <div style={{ fontSize: '10px', color: '#666' }}>{value}</div>
          </div>
        ))}
      </div>

      <h3>Semantic Colors</h3>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {['success', 'error', 'warning', 'info'].map((color) => (
          <div key={color}>
            <h4 style={{ textTransform: 'capitalize' }}>{color}</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(theme.colors[color as keyof typeof theme.colors] as Record<string, string>).map(([key, value]) => (
                <div key={key} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: value,
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                    }}
                  />
                  <div style={{ fontSize: '10px', marginTop: '4px' }}>{key}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div>
      <h2>Typography</h2>
      
      {Object.entries(theme.typography).map(([variant, styles]) => (
        <div key={variant} style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: `${styles.fontSize}px`,
              fontWeight: styles.fontWeight,
              lineHeight: styles.lineHeight,
              letterSpacing: `${styles.letterSpacing}px`,
            }}
          >
            {variant} - The quick brown fox jumps over the lazy dog
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Size: {styles.fontSize}px, Weight: {styles.fontWeight}, Line Height: {styles.lineHeight}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div>
      <h2>Spacing Scale</h2>
      <p>Consistent spacing values for padding, margins, and gaps</p>
      
      {Object.entries(theme.spacing).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', fontWeight: 'bold' }}>
            {key}
          </div>
          <div
            style={{
              width: `${value}px`,
              height: '24px',
              backgroundColor: theme.colors.primary[500],
              borderRadius: '4px',
            }}
          />
          <div style={{ fontSize: '14px', color: '#666' }}>
            {value}px
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Shadows: Story = {
  render: () => (
    <div>
      <h2>Shadows</h2>
      <p>Elevation levels for web components</p>
      
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '24px' }}>
        {Object.entries(theme.shadows).map(([key, value]) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: value,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {key}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const BorderRadius: Story = {
  render: () => (
    <div>
      <h2>Border Radius</h2>
      <p>Corner radius values for components</p>
      
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '24px' }}>
        {Object.entries(theme.borderRadius).map(([key, value]) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: theme.colors.primary[500],
                borderRadius: `${value}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              {key}
            </div>
            <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
              {value}px
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
