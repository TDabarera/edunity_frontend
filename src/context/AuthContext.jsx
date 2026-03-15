import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LoginUser, SignupUser, VerifyEmail, ResendVerification } from '../services';

/**
 * Authentication Context for managing user authentication state
 * Provides login, signup, logout, and user state management
 */
const AuthContext = createContext(null);

/**
 * AuthProvider component that wraps the app and provides authentication state
 * Handles user login/logout, token management, and localStorage persistence
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  // Load saved authentication data from localStorage on app startup
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('edunity_token');
      const savedUser = localStorage.getItem('edunity_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      }
    } catch (error) {
      // Ignore localStorage errors (e.g., private browsing mode)
      console.warn('Failed to load auth data from localStorage:', error);
    } finally {
      setIsAuthInitialized(true);
    }
  }, []);

  // Helper function to persist auth data to localStorage
  const persistAuthData = useCallback((newToken, newUser) => {
    try {
      if (newToken) {
        localStorage.setItem('edunity_token', newToken);
      }
      if (newUser) {
        localStorage.setItem('edunity_user', JSON.stringify(newUser));
      }
    } catch (error) {
      // Ignore localStorage errors
      console.warn('Failed to save auth data to localStorage:', error);
    }
  }, []);

  // Create standardized user object from backend response
  const createUserObject = useCallback((backendUser, email, additionalData = {}) => {
    return {
      id: backendUser?.id || backendUser?._id,
      email: backendUser?.email || email,
      role: backendUser?.userType || 'User',
      classId: backendUser?.classId,
      name: backendUser?.name || additionalData.name || email.split('@')[0],
    };
  }, []);

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object
   */
  const login = async (email, password) => {
    const response = await LoginUser(email, password);
    const { token: newToken, user: backendUser } = response;

    const newUser = createUserObject(backendUser, email);

    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
    persistAuthData(newToken, newUser);

    return newUser;
  };

  /**
   * Register new user (does not auto-login due to email verification)
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Response from server
   */
  const signup = async (userData) => {
    const response = await SignupUser(userData);
    // Note: No auto-login - user must verify email first
    return response;
  };

  /**
   * Verify user email with verification token
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} Verification response
   */
  const verifyEmail = async (token) => {
    const response = await VerifyEmail(token);
    return response;
  };

  /**
   * Resend email verification
   * @param {string} email - User email address
   * @returns {Promise<Object>} Response from server
   */
  const resendVerification = async (email) => {
    const response = await ResendVerification(email);
    return response;
  };

  /**
   * Update user profile information
   * @param {Object} partialUser - Partial user data to update
   */
  const updateProfile = useCallback((partialUser) => {
    setUser((prevUser) => {
      const updatedUser = { ...(prevUser || {}), ...(partialUser || {}) };
      persistAuthData(token, updatedUser);
      return updatedUser;
    });
  }, [token, persistAuthData]);

  /**
   * Logout user and clear all authentication data
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);

    try {
      localStorage.removeItem('edunity_token');
      localStorage.removeItem('edunity_user');
    } catch (error) {
      console.warn('Failed to clear auth data from localStorage:', error);
    }
  }, []);

  const value = {
    user,
    token,
    isLoggedIn,
    isAuthInitialized,
    login,
    logout,
    signup,
    verifyEmail,
    resendVerification,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use authentication context
 * Must be used within an AuthProvider
 * @returns {Object} Authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
