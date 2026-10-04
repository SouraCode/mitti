import { createContext, useContext, useEffect, useState } from 'react';
import { adminApi } from '../services/api';
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    adminApi
      .session()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  const login = async (values) => {
    const result = await adminApi.login(values);
    setUser(result.user);
  };
  const logout = async () => {
    await adminApi.logout();
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}
