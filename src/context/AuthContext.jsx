import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { LoginUser, SignupUser } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('edunity_token');
      const savedUser = localStorage.getItem('edunity_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      }
    } catch (_) {
      // ignore storage errors
    }
  }, []);

  const persist = (newToken, newUser) => {
    try {
      if (newToken) {
        localStorage.setItem('edunity_token', newToken);
      }
      if (newUser) {
        localStorage.setItem('edunity_user', JSON.stringify(newUser));
      }
    } catch (_) {
      // ignore storage errors
    }
  };

  const login = async (email, password) => {
    const response = await LoginUser(email, password);
    const { token: newToken, user: backendUser } = response;
    
    const newUser = {
      id: backendUser?.id || backendUser?._id,
      email: backendUser?.email || email,
      role: backendUser?.userType || 'User',
      classId: backendUser?.classId,
      name: backendUser?.name || email.split('@')[0],
    };
    
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
    persist(newToken, newUser);
    
    return newUser;
  };

  const signup = async (data) => {
    const response = await SignupUser(data);
    const { token: newToken, user: backendUser } = response;
    
    const newUser = {
      id: backendUser?.id || backendUser?._id,
      email: backendUser?.email || data.email,
      role: backendUser?.userType || 'User',
      classId: backendUser?.classId,
      name: backendUser?.name || data.name || data.email.split('@')[0],
    };
    
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
    persist(newToken, newUser);
    
    return newUser;
  };

  const updateProfile = useCallback((partialUser) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...(partialUser || {}) };
      persist(token, merged);
      return merged;
    });
  }, [token]);

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    try {
      localStorage.removeItem('edunity_token');
      localStorage.removeItem('edunity_user');
    } catch (_) {
      // ignore storage errors
    }
  };

  const value = useMemo(() => ({ user, token, isLoggedIn, login, logout, signup, updateProfile }), [user, token, isLoggedIn, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
