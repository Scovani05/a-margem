import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('margem_user') || 'null'); } catch { return null; }
  });
  const [checking, setChecking] = useState(Boolean(sessionStorage.getItem('margem_token')));

  useEffect(() => {
    if (!sessionStorage.getItem('margem_token')) return;
    api.get('/auth/me')
      .then(({ data }) => { setUser(data.user); sessionStorage.setItem('margem_user', JSON.stringify(data.user)); })
      .catch(() => { sessionStorage.removeItem('margem_token'); sessionStorage.removeItem('margem_user'); setUser(null); })
      .finally(() => setChecking(false));
  }, []);

  const acceptSession = useCallback((data) => {
    sessionStorage.setItem('margem_token', data.token);
    sessionStorage.setItem('margem_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (credentials) => acceptSession((await api.post('/auth/login', credentials)).data), [acceptSession]);
  const register = useCallback(async (details) => acceptSession((await api.post('/auth/register', details)).data), [acceptSession]);
  const updateUser = useCallback((next) => {
    setUser(next);
    sessionStorage.setItem('margem_user', JSON.stringify(next));
  }, []);
  const logout = useCallback(() => {
    sessionStorage.removeItem('margem_token');
    sessionStorage.removeItem('margem_user');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, checking, login, register, logout, updateUser }), [user, checking, login, register, logout, updateUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
};
