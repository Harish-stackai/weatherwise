import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('weatherwise_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and check current user on load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('weatherwise_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session expired or invalid token:', err.message);
          logout();
        }
      } else {
        const savedUser = localStorage.getItem('weatherwise_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {}
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('weatherwise_token', res.data.token);
      localStorage.setItem('weatherwise_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const register = async (name, email, password, defaultLocation) => {
    const res = await api.post('/auth/register', { name, email, password, defaultLocation });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('weatherwise_token', res.data.token);
      localStorage.setItem('weatherwise_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('weatherwise_token');
    localStorage.removeItem('weatherwise_user');
  };

  const updateProfile = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('weatherwise_user', JSON.stringify(updatedUserData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
