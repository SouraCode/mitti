import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      const result = await authApi.session();
      setUser(result.user);
      return result.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const login = async (values) => {
    const result = await authApi.login(values);
    setUser(result.user);
    return result;
  };
  const register = async (values) => {
    const result = await authApi.register(values);
    setUser(result.user);
    return result;
  };
  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };
  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, refresh]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
