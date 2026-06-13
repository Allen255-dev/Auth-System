import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate authentication status
  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axiosInstance.get('/users/me');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.log('Session validation failed or expired:', err.message);
      localStorage.removeItem('access_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for unauthorized logout events from axios interceptor
    const handleLogoutEvent = () => {
      localStorage.removeItem('access_token');
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, []);

  const login = async (usernameOrEmail, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/login', {
        username_or_email: usernameOrEmail,
        password,
      });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('access_token', access_token);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err.message);
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const registerUser = async (username, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/register', {
        username,
        email,
        password,
      });
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Registration failed.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userId, updateData) => {
    setError(null);
    try {
      const response = await axiosInstance.put(`/users/update/${userId}`, updateData);
      const updatedUser = response.data;
      // If updating our own profile, update the Auth state
      if (user && user.id === userId) {
        setUser(updatedUser);
      }
      return updatedUser;
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to update profile.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    registerUser,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
