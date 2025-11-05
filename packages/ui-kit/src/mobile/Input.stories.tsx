import React from 'react';
import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { Input } from './Input';

storiesOf('Mobile/Input', module)
  .addDecorator((story) => (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      {story()}
    </View>
  ))
  .add('Default', () => <Input placeholder="Enter text..." />)
  .add('With Label', () => (
    <Input label="Email Address" placeholder="name@example.com" type="email" />
  ))
  .add('With Helper Text', () => (
    <Input
      label="Username"
      placeholder="Enter your username"
      helperText="Must be at least 3 characters"
    />
  ))
  .add('With Error', () => (
    <Input
      label="Email"
      placeholder="name@example.com"
      type="email"
      error
      helperText="Please enter a valid email address"
    />
  ))
  .add('Password', () => (
    <Input label="Password" type="password" placeholder="Enter your password" />
  ))
  .add('Disabled', () => (
    <Input
      label="Disabled Input"
      placeholder="Cannot edit this"
      disabled
      value="Disabled value"
    />
  ))
  .add('Multiline', () => (
    <Input
      label="Description"
      placeholder="Enter description..."
      multiline
      numberOfLines={4}
    />
  ))
  .add('All Types', () => (
    <View style={{ gap: 16 }}>
      <Input label="Text" type="text" placeholder="Text input" />
      <Input label="Email" type="email" placeholder="email@example.com" />
      <Input label="Password" type="password" placeholder="Enter password" />
      <Input label="Number" type="number" placeholder="123" />
      <Input label="Tel" type="tel" placeholder="+1234567890" />
    </View>
  ));
