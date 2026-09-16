import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { authApi, type User } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<void>;

  register: (payload: {
    email: string;
    password: string;
    fullName: string;
  }) => Promise<void>;

  completeProfile: (payload: {
    gender: string;
    age: number;
    heightCm: number;
    weightKg: number;
    fitnessLevel: string;
    primaryGoal: string;
  }) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // App load hone par existing session check
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const data = await authApi.getMe();
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // LOGIN
  const login = async (credentials: {
    email: string;
    password: string;
  }) => {
    setIsLoading(true);

    try {
      const data = await authApi.login(credentials);

      if (!data?.user) {
        throw new Error('Login failed');
      }

      setUser(data.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTER
  const register = async (payload: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    setIsLoading(true);

    try {
      const data = await authApi.register(payload);

      if (!data?.user) {
        throw new Error('Registration failed');
      }

      setUser(data.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // COMPLETE PROFILE
  const completeProfile = async (payload: {
    gender: string;
    age: number;
    heightCm: number;
    weightKg: number;
    fitnessLevel: string;
    primaryGoal: string;
  }) => {
    setIsLoading(true);

    try {
      const data = await authApi.completeProfile(payload);

      if (!data?.user) {
        throw new Error('Profile completion failed');
      }

      setUser(data.user);
    } catch (error) {
      // Error ko yahan swallow mat karo
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        register,
        logout,
        completeProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};
