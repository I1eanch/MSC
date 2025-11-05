import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { identityApi, AuthResponse } from '../api/identity';
import {
  saveToken,
  saveRefreshToken,
  saveUser,
  getToken,
  getUser,
  clearAllStorage,
} from '../utils/secureStorage';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await getToken();
      if (token) {
        const userData = await getUser();
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    const response: AuthResponse = await identityApi.signUp({
      email,
      password,
      firstName,
      lastName,
    });

    await saveToken(response.token);
    await saveRefreshToken(response.refreshToken);
    await saveUser(response.user);
    setUser(response.user);
  };

  const login = async (email: string, password: string) => {
    const response: AuthResponse = await identityApi.login({ email, password });

    await saveToken(response.token);
    await saveRefreshToken(response.refreshToken);
    await saveUser(response.user);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await identityApi.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await clearAllStorage();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
