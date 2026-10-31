import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getCurrentUser } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ user: null, status: 'loading' });
  const revision = useRef(0);

  const setUser = useCallback((user) => {
    revision.current += 1;
    setAuth({ user, status: user ? 'authenticated' : 'anonymous' });
  }, []);

  const refreshUser = useCallback(async () => {
    const requestRevision = revision.current;
    try {
      const { user } = await getCurrentUser();
      if (requestRevision === revision.current) {
        setAuth({ user, status: user ? 'authenticated' : 'anonymous' });
      }
      return user;
    } catch {
      if (requestRevision === revision.current) {
        setAuth((current) => ({
          user: current.user,
          status: current.user ? 'authenticated' : 'error',
        }));
      }
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ ...auth, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
