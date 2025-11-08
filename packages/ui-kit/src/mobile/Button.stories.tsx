import React from 'react';
import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { Button } from './Button';

storiesOf('Mobile/Button', module)
  .addDecorator((story) => (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      {story()}
    </View>
  ))
  .add('Primary', () => <Button variant="primary">Primary Button</Button>)
  .add('Secondary', () => <Button variant="secondary">Secondary Button</Button>)
  .add('Outlined', () => <Button variant="outlined">Outlined Button</Button>)
  .add('Text', () => <Button variant="text">Text Button</Button>)
  .add('Small', () => <Button size="small">Small Button</Button>)
  .add('Medium', () => <Button size="medium">Medium Button</Button>)
  .add('Large', () => <Button size="large">Large Button</Button>)
  .add('Disabled', () => <Button disabled>Disabled Button</Button>)
  .add('Loading', () => <Button loading>Loading Button</Button>)
  .add('With Icon', () => <Button icon="camera">With Icon</Button>)
  .add('Full Width', () => <Button fullWidth>Full Width Button</Button>)
  .add('All Variants', () => (
    <View style={{ gap: 16 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="text">Text</Button>
      <Button disabled>Disabled</Button>
    </View>
  ));
