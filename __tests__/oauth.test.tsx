import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../src/screens/LoginScreen';
import SignUpScreen from '../src/screens/SignUpScreen';
import { AuthProvider } from '../src/contexts/AuthContext';
import { AnalyticsProvider } from '../src/contexts/AnalyticsContext';
import * as oauth from '../src/utils/oauth';
import * as identityApi from '../src/api/identity';

jest.mock('../src/utils/oauth');
jest.mock('../src/api/identity');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
};

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <NavigationContainer>
      <AnalyticsProvider>
        <AuthProvider>{children}</AuthProvider>
      </AnalyticsProvider>
    </NavigationContainer>
  );
};

describe('OAuth Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LoginScreen OAuth Buttons', () => {
    it('should render all OAuth provider buttons', () => {
      const { getByTestId } = render(
        <AllTheProviders>
          <LoginScreen navigation={mockNavigation as any} />
        </AllTheProviders>
      );

      expect(getByTestId('google-login-button')).toBeTruthy();
      expect(getByTestId('apple-login-button')).toBeTruthy();
      expect(getByTestId('vk-login-button')).toBeTruthy();
      expect(getByTestId('yandex-login-button')).toBeTruthy();
    });

    it('should handle successful Google OAuth login', async () => {
      const mockOAuthResult = {
        accessToken: 'google-access-token',
        idToken: 'google-id-token',
      };

      const mockAuthResponse = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        user: {
          id: '123',
          email: 'test@example.com',
        },
      };

      (oauth.signInWithProvider as jest.Mock).mockResolvedValueOnce(mockOAuthResult);
      (identityApi.identityApi.oauthLogin as jest.Mock).mockResolvedValueOnce(
        mockAuthResponse
      );

      const { getByTestId } = render(
        <AllTheProviders>
          <LoginScreen navigation={mockNavigation as any} />
        </AllTheProviders>
      );

      const googleButton = getByTestId('google-login-button');
      fireEvent.press(googleButton);

      await waitFor(() => {
        expect(oauth.signInWithProvider).toHaveBeenCalledWith(
          oauth.OAuthProvider.GOOGLE
        );
        expect(identityApi.identityApi.oauthLogin).toHaveBeenCalledWith({
          provider: oauth.OAuthProvider.GOOGLE,
          accessToken: 'google-access-token',
          idToken: 'google-id-token',
          userData: undefined,
        });
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Success', {
          message: 'You have successfully logged in!',
          type: 'login',
        });
      });
    });

    it('should handle cancelled Google OAuth flow', async () => {
      (oauth.signInWithProvider as jest.Mock).mockResolvedValueOnce(null);

      const { getByTestId } = render(
        <AllTheProviders>
          <LoginScreen navigation={mockNavigation as any} />
        </AllTheProviders>
      );

      const googleButton = getByTestId('google-login-button');
      fireEvent.press(googleButton);

      await waitFor(() => {
        expect(oauth.signInWithProvider).toHaveBeenCalled();
        expect(identityApi.identityApi.oauthLogin).not.toHaveBeenCalled();
        expect(mockNavigation.navigate).toHaveBeenCalledWith(
          'Failed',
          expect.objectContaining({
            type: 'login',
          })
        );
      });
    });

    it('should handle Apple OAuth login', async () => {
      const mockOAuthResult = {
        accessToken: 'apple-auth-code',
        idToken: 'apple-id-token',
        userData: {
          fullName: 'Test User',
        },
      };

      const mockAuthResponse = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        user: {
          id: '123',
          email: 'test@example.com',
        },
      };

      (oauth.signInWithProvider as jest.Mock).mockResolvedValueOnce(mockOAuthResult);
      (identityApi.identityApi.oauthLogin as jest.Mock).mockResolvedValueOnce(
        mockAuthResponse
      );

      const { getByTestId } = render(
        <AllTheProviders>
          <LoginScreen navigation={mockNavigation as any} />
        </AllTheProviders>
      );

      const appleButton = getByTestId('apple-login-button');
      fireEvent.press(appleButton);

      await waitFor(() => {
        expect(oauth.signInWithProvider).toHaveBeenCalledWith(
          oauth.OAuthProvider.APPLE
        );
        expect(identityApi.identityApi.oauthLogin).toHaveBeenCalledWith({
          provider: oauth.OAuthProvider.APPLE,
          accessToken: 'apple-auth-code',
          idToken: 'apple-id-token',
          userData: {
            fullName: 'Test User',
          },
        });
      });
    });

    it('should handle VK OAuth login', async () => {
      const mockOAuthResult = {
        accessToken: 'vk-access-token',
      };

      const mockAuthResponse = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        user: {
          id: '123',
          email: 'test@example.com',
        },
      };

      (oauth.signInWithProvider as jest.Mock).mockResolvedValueOnce(mockOAuthResult);
      (identityApi.identityApi.oauthLogin as jest.Mock).mockResolvedValueOnce(
        mockAuthResponse
      );

      const { getByTestId } = render(
        <AllTheProviders>
          <LoginScreen navigation={mockNavigation as any} />
        </AllTheProviders>
      );

      const vkButton = getByTestId('vk-login-button');
      fireEvent.press(vkButton);

      await waitFor(() => {
        expect(oauth.signInWithProvider).toHaveBeenCalledWith(oauth.OAuthProvider.VK);
      });
    });

    it('should handle Yandex OAuth login', async () => {
      const mockOAuthResult = {
        accessToken: 'yandex-access-token',
      };

      const mockAuthResponse = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        user: {
          id: '123',
          email: 'test@example.com',
        },
      };

      (oauth.signInWithProvider as jest.Mock).mockResolvedValueOnce(mockOAuthResult);
      (identityApi.identityApi.oauthLogin as jest.Mock).mockResolvedValueOnce(
        mockAuthResponse
      );

      const { getByTestId } = render(
        <AllTheProviders>
          <LoginScreen navigation={mockNavigation as any} />
        </AllTheProviders>
      );

      const yandexButton = getByTestId('yandex-login-button');
      fireEvent.press(yandexButton);

      await waitFor(() => {
        expect(oauth.signInWithProvider).toHaveBeenCalledWith(
          oauth.OAuthProvider.YANDEX
        );
      });
    });

    it('should handle OAuth API error', async () => {
      const mockOAuthResult = {
        accessToken: 'google-access-token',
      };

      (oauth.signInWithProvider as jest.Mock).mockResolvedValueOnce(mockOAuthResult);
      (identityApi.identityApi.oauthLogin as jest.Mock).mockRejectedValueOnce(
        new Error('Invalid OAuth token')
      );

      const { getByTestId } = render(
        <AllTheProviders>
          <LoginScreen navigation={mockNavigation as any} />
        </AllTheProviders>
      );

      const googleButton = getByTestId('google-login-button');
      fireEvent.press(googleButton);

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith(
          'Failed',
          expect.objectContaining({
            type: 'login',
          })
        );
      });
    });
  });

  describe('SignUpScreen OAuth Buttons', () => {
    it('should render all OAuth provider buttons', () => {
      const { getByTestId } = render(
        <AllTheProviders>
          <SignUpScreen navigation={mockNavigation as any} />
        </AllTheProviders>
      );

      expect(getByTestId('google-signup-button')).toBeTruthy();
      expect(getByTestId('apple-signup-button')).toBeTruthy();
      expect(getByTestId('vk-signup-button')).toBeTruthy();
      expect(getByTestId('yandex-signup-button')).toBeTruthy();
    });

    it('should handle successful Google OAuth signup', async () => {
      const mockOAuthResult = {
        accessToken: 'google-access-token',
        idToken: 'google-id-token',
      };

      const mockAuthResponse = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        user: {
          id: '123',
          email: 'newuser@example.com',
        },
      };

      (oauth.signInWithProvider as jest.Mock).mockResolvedValueOnce(mockOAuthResult);
      (identityApi.identityApi.oauthLogin as jest.Mock).mockResolvedValueOnce(
        mockAuthResponse
      );

      const { getByTestId } = render(
        <AllTheProviders>
          <SignUpScreen navigation={mockNavigation as any} />
        </AllTheProviders>
      );

      const googleButton = getByTestId('google-signup-button');
      fireEvent.press(googleButton);

      await waitFor(() => {
        expect(oauth.signInWithProvider).toHaveBeenCalledWith(
          oauth.OAuthProvider.GOOGLE
        );
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Success', {
          message: 'Your account has been created successfully!',
          type: 'signup',
        });
      });
    });
  });

  describe('OAuth Account Linking', () => {
    it('should link OAuth account to existing email-based account', async () => {
      const mockOAuthResult = {
        accessToken: 'google-access-token',
      };

      const mockAuthResponse = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'existing-user-id',
          email: 'existing@example.com',
          provider: 'google',
        },
      };

      (oauth.signInWithProvider as jest.Mock).mockResolvedValueOnce(mockOAuthResult);
      (identityApi.identityApi.oauthLogin as jest.Mock).mockResolvedValueOnce(
        mockAuthResponse
      );

      const { getByTestId } = render(
        <AllTheProviders>
          <LoginScreen navigation={mockNavigation as any} />
        </AllTheProviders>
      );

      const googleButton = getByTestId('google-login-button');
      fireEvent.press(googleButton);

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Success', {
          message: 'You have successfully logged in!',
          type: 'login',
        });
      });
    });

    it('should reject linking to account with different provider', async () => {
      const mockOAuthResult = {
        accessToken: 'google-access-token',
      };

      (oauth.signInWithProvider as jest.Mock).mockResolvedValueOnce(mockOAuthResult);
      (identityApi.identityApi.oauthLogin as jest.Mock).mockRejectedValueOnce({
        response: {
          data: {
            message: 'This email is already linked with apple. Please use that provider to sign in.',
          },
        },
      });

      const { getByTestId } = render(
        <AllTheProviders>
          <LoginScreen navigation={mockNavigation as any} />
        </AllTheProviders>
      );

      const googleButton = getByTestId('google-login-button');
      fireEvent.press(googleButton);

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith(
          'Failed',
          expect.objectContaining({
            message: expect.stringContaining('already linked with'),
          })
        );
      });
    });
  });
});
