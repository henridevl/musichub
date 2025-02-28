import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, authService } from '../services/supabase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: typeof authService.signIn;
  signUp: typeof authService.signUp;
  signOut: typeof authService.signOut;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setUser(user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn: async (...args) => {
      const user = await authService.signIn(...args);
      setUser(user);
      return user;
    },
    signUp: authService.signUp,
    signOut: async () => {
      await authService.signOut();
      setUser(null);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
