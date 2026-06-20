import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('mindwell_user');
    const token = localStorage.getItem('mindwell_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function login(token, userData) {
    localStorage.setItem('mindwell_token', token);
    localStorage.setItem('mindwell_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('mindwell_token');
    localStorage.removeItem('mindwell_user');
    setUser(null);
  }

  async function refreshUser() {
    try {
      const res = await api.get('/user/me');
      setUser(res.data);
      localStorage.setItem('mindwell_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
