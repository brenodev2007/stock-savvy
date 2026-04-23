import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  cpf_cnpj?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, secretKeyword: string, cpfCnpj?: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string, secretKeyword: string, newPassword: string) => Promise<{ error: Error | null; message?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: new Error(error.response?.data?.error || 'Erro ao fazer login') };
    }
  };

  const signUp = async (email: string, password: string, name: string, secretKeyword: string, cpfCnpj?: string) => {
    try {
      const { data } = await api.post('/auth/register', {
        email,
        password,
        name,
        secretKeyword,
        cpf_cnpj: cpfCnpj
      });
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: new Error(error.response?.data?.error || 'Erro ao registrar') };
    }
  };

  const resetPassword = async (email: string, secretKeyword: string, newPassword: string) => {
    try {
      const { data } = await api.post('/auth/reset-password', { email, secretKeyword, newPassword });
      return { error: null, message: data.message };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { error: new Error(error.response?.data?.error || 'Erro ao redefinir senha') };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        resetPassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
