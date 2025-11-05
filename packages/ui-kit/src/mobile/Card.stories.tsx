import React from 'react';
import { View, Text } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { Card } from './Card';

storiesOf('Mobile/Card', module)
  .addDecorator((story) => (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      {story()}
    </View>
  ))
  .add('Default', () => (
    <Card title="Card Title">
      <Text>This is the card content. It can contain any React Native components.</Text>
    </Card>
  ))
  .add('With Subtitle', () => (
    <Card title="Card Title" subtitle="This is a subtitle">
      <Text>Card content goes here.</Text>
    </Card>
  ))
  .add('Only Content', () => (
    <Card>
      <View>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Custom Content</Text>
        <Text style={{ marginTop: 8 }}>This card has no header, only content.</Text>
      </View>
    </Card>
  ))
  .add('Clickable', () => (
    <Card
      title="Clickable Card"
      subtitle="Press me!"
      onPress={() => alert('Card pressed!')}
    >
      <Text>This card has an onPress handler.</Text>
    </Card>
  ))
  .add('Low Elevation', () => (
    <Card title="Low Elevation" elevation={1}>
      <Text>This card has low elevation (shadow).</Text>
    </Card>
  ))
  .add('High Elevation', () => (
    <Card title="High Elevation" elevation={5}>
      <Text>This card has high elevation (shadow).</Text>
    </Card>
  ))
  .add('No Elevation', () => (
    <Card title="No Elevation" elevation={0}>
      <Text>This card has no elevation (shadow).</Text>
    </Card>
  ))
  .add('Custom Padding', () => (
    <Card title="Large Padding" padding={8}>
      <Text>This card has large padding.</Text>
    </Card>
  ))
  .add('Complex Content', () => (
    <Card title="User Profile" subtitle="Active user">
      <View>
        <Text style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Name:</Text> John Doe
        </Text>
        <Text style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Email:</Text> john@example.com
        </Text>
        <Text style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Role:</Text> Administrator
        </Text>
        <Text>
          <Text style={{ fontWeight: 'bold' }}>Status:</Text> Active
        </Text>
      </View>
    </Card>
  ));
