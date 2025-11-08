import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta = {
  title: 'Web/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    elevation: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5],
    },
    padding: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6, 8],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    children: <p>This is the card content. It can contain any React components.</p>,
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'This is a subtitle',
    children: <p>Card content goes here.</p>,
  },
};

export const OnlyContent: Story = {
  args: {
    children: (
      <div>
        <h3 style={{ margin: 0 }}>Custom Content</h3>
        <p style={{ margin: '8px 0 0 0' }}>This card has no header, only content.</p>
      </div>
    ),
  },
};

export const Clickable: Story = {
  args: {
    title: 'Clickable Card',
    subtitle: 'Click me!',
    children: <p>This card has an onClick handler and will show hover effects.</p>,
    onClick: () => alert('Card clicked!'),
  },
};

export const ElevationLow: Story = {
  args: {
    title: 'Low Elevation',
    elevation: 1,
    children: <p>This card has low elevation (shadow).</p>,
  },
};

export const ElevationHigh: Story = {
  args: {
    title: 'High Elevation',
    elevation: 5,
    children: <p>This card has high elevation (shadow).</p>,
  },
};

export const NoElevation: Story = {
  args: {
    title: 'No Elevation',
    elevation: 0,
    children: <p>This card has no elevation (shadow).</p>,
  },
};

export const CustomPadding: Story = {
  args: {
    title: 'Large Padding',
    padding: 8,
    children: <p>This card has large padding.</p>,
  },
};

export const AllElevations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', maxWidth: '800px' }}>
      {[0, 1, 2, 3, 4, 5].map((elevation) => (
        <Card
          key={elevation}
          title={`Elevation ${elevation}`}
          elevation={elevation as 0 | 1 | 2 | 3 | 4 | 5}
        >
          <p>Shadow level {elevation}</p>
        </Card>
      ))}
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const ComplexContent: Story = {
  args: {
    title: 'User Profile',
    subtitle: 'Active user',
    children: (
      <div>
        <p style={{ margin: '0 0 8px 0' }}><strong>Name:</strong> John Doe</p>
        <p style={{ margin: '0 0 8px 0' }}><strong>Email:</strong> john@example.com</p>
        <p style={{ margin: '0 0 8px 0' }}><strong>Role:</strong> Administrator</p>
        <p style={{ margin: 0 }}><strong>Status:</strong> Active</p>
      </div>
    ),
  },
};
