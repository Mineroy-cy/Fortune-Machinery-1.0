// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/adminAPI';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    setAdmin(res.data.admin || { role: 'admin' });
    localStorage.setItem('adminToken', res.data.token);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  const verify = async () => {
    try {
      const res = await authAPI.verify();
      setAdmin(res.data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      verify();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
