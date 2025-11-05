import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export enum OAuthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  VK = 'vk',
  YANDEX = 'yandex',
}

interface OAuthConfig {
  clientId: string;
  redirectUri: string;
}

interface OAuthResult {
  accessToken: string;
  idToken?: string;
  userData?: any;
}

const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'com.example.mobileauthapp',
    }),
  },
  vk: {
    clientId: process.env.VK_CLIENT_ID || 'your-vk-client-id',
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'com.example.mobileauthapp',
    }),
  },
  yandex: {
    clientId: process.env.YANDEX_CLIENT_ID || 'your-yandex-client-id',
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'com.example.mobileauthapp',
    }),
  },
};

const OAUTH_ENDPOINTS = {
  google: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    scopes: ['openid', 'profile', 'email'],
  },
  vk: {
    authorizationEndpoint: 'https://oauth.vk.com/authorize',
    tokenEndpoint: 'https://oauth.vk.com/access_token',
    scopes: ['email'],
  },
  yandex: {
    authorizationEndpoint: 'https://oauth.yandex.ru/authorize',
    tokenEndpoint: 'https://oauth.yandex.ru/token',
    scopes: ['login:email', 'login:info', 'login:avatar'],
  },
};

export const signInWithGoogle = async (): Promise<OAuthResult | null> => {
  try {
    const config = OAUTH_CONFIGS.google;
    const discovery = OAUTH_ENDPOINTS.google;

    const authRequestConfig: AuthSession.AuthRequestConfig = {
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      scopes: discovery.scopes,
      responseType: AuthSession.ResponseType.Token,
    };

    const request = new AuthSession.AuthRequest(authRequestConfig);

    const result = await request.promptAsync({
      authorizationEndpoint: discovery.authorizationEndpoint,
    });

    if (result.type === 'success') {
      const { access_token, id_token } = result.params;
      return {
        accessToken: access_token,
        idToken: id_token,
      };
    }

    return null;
  } catch (error) {
    console.error('Google sign in error:', error);
    return null;
  }
};

export const signInWithApple = async (): Promise<OAuthResult | null> => {
  try {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign In is only available on iOS');
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    return {
      accessToken: credential.authorizationCode,
      idToken: credential.identityToken || undefined,
      userData: {
        fullName: credential.fullName
          ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
          : undefined,
      },
    };
  } catch (error: any) {
    if (error.code === 'ERR_CANCELED') {
      return null;
    }
    console.error('Apple sign in error:', error);
    return null;
  }
};

export const signInWithVK = async (): Promise<OAuthResult | null> => {
  try {
    const config = OAUTH_CONFIGS.vk;
    const discovery = OAUTH_ENDPOINTS.vk;

    const authRequestConfig: AuthSession.AuthRequestConfig = {
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      scopes: discovery.scopes,
      responseType: AuthSession.ResponseType.Token,
    };

    const request = new AuthSession.AuthRequest(authRequestConfig);

    const result = await request.promptAsync({
      authorizationEndpoint: discovery.authorizationEndpoint,
    });

    if (result.type === 'success') {
      const { access_token } = result.params;
      return {
        accessToken: access_token,
      };
    }

    return null;
  } catch (error) {
    console.error('VK sign in error:', error);
    return null;
  }
};

export const signInWithYandex = async (): Promise<OAuthResult | null> => {
  try {
    const config = OAUTH_CONFIGS.yandex;
    const discovery = OAUTH_ENDPOINTS.yandex;

    const authRequestConfig: AuthSession.AuthRequestConfig = {
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      scopes: discovery.scopes,
      responseType: AuthSession.ResponseType.Token,
    };

    const request = new AuthSession.AuthRequest(authRequestConfig);

    const result = await request.promptAsync({
      authorizationEndpoint: discovery.authorizationEndpoint,
    });

    if (result.type === 'success') {
      const { access_token } = result.params;
      return {
        accessToken: access_token,
      };
    }

    return null;
  } catch (error) {
    console.error('Yandex sign in error:', error);
    return null;
  }
};

export const signInWithProvider = async (
  provider: OAuthProvider,
): Promise<OAuthResult | null> => {
  switch (provider) {
    case OAuthProvider.GOOGLE:
      return signInWithGoogle();
    case OAuthProvider.APPLE:
      return signInWithApple();
    case OAuthProvider.VK:
      return signInWithVK();
    case OAuthProvider.YANDEX:
      return signInWithYandex();
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
};
