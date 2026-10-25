import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken, clearToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [notifBadge, setNotifBadge] = useState(0);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setReady(true);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.user);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    const on401 = () => {
      clearToken();
      setUser(null);
      setReady(true);
    };
    window.addEventListener('hh:unauthorized', on401);
    return () => window.removeEventListener('hh:unauthorized', on401);
  }, [refresh]);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user) return setNotifBadge(0);
      try {
        const r = await api.get('/auth/notifications/unread');
        setNotifBadge(r.count || 0);
      } catch { setNotifBadge(0); }
    };
    fetchUnread();
    const t = setInterval(fetchUnread, 45000);
    return () => clearInterval(t);
  }, [user]);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post('/auth/register', payload);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user, ready, login, register, logout, refresh, notifBadge,
    role: user?.role || null,
    isOwner: user?.role === 'OWNER',
    isAdmin: user?.role === 'ADMIN',
    isTenant: user?.role === 'TENANT',
    home: user ? (user.role === 'ADMIN' ? '/admin' : user.role === 'OWNER' ? '/owner' : '/tenant') : '/',
  }), [user, ready, login, register, logout, refresh, notifBadge]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
