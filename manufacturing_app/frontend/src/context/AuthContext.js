// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        const userData = {
          ...response.data,
          is_staff: response.data.is_staff || false,
          role: response.data.role || 'customer',
        };
        setUser(userData);
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    const response = await authAPI.login({ username, password });
    const token = response.data.token;
    
    localStorage.setItem('token', token);
    
    // Create user object with role info
    const loggedInUser = {
      id: response.data.user_id || response.data.id,
      username: response.data.username,
      email: response.data.email,
      is_staff: response.data.is_staff || false,
      role: response.data.role || 'customer',
    };
    
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    
    return loggedInUser;
  };

  const register = async (formData) => {
    const response = await authAPI.register(formData);
    const token = response.data.token;
    
    localStorage.setItem('token', token);
    
    // Create user object with role info
    const registeredUser = {
      ...response.data.user,
      is_staff: response.data.user.is_staff || false,
      role: response.data.user.role || 'customer',
    };
    
    localStorage.setItem('user', JSON.stringify(registeredUser));
    setUser(registeredUser);
    
    return registeredUser;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};