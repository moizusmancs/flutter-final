import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import type { Admin } from '../types/api.types';

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isCheckingRef = useRef(false);

  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingRef.current) return;

    try {
      isCheckingRef.current = true;
      setIsLoading(true);
      const response = await authApi.checkAuth();
      if (response.success && response.admin) {
        setAdmin(response.admin);
      } else {
        setAdmin(null);
      }
    } catch (error) {
      // Silent fail - user is not authenticated
      setAdmin(null);
    } finally {
      setIsLoading(false);
      isCheckingRef.current = false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setAdmin(response.admin);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
      console.error('Logout error:', error);
    } finally {
      // Always clear admin state on logout
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const performAuthCheck = async () => {
      // Set a maximum loading time of 3 seconds
      const timeoutId = setTimeout(() => {
        if (isMounted && isCheckingRef.current) {
          // Only clear if auth check is still pending
          setIsLoading(false);
          setAdmin(null);
          isCheckingRef.current = false;
        }
      }, 3000);

      await checkAuth();
      clearTimeout(timeoutId);
    };

    performAuthCheck();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - run only once on mount

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
