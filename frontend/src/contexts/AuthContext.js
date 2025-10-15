import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_URL}/api/hikes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser(userData);
        } else {
          localStorage.removeItem('token');
          setToken(null);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Token verification error:', err);
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    const handleEmailVerification = async (verificationToken) => {
      try {
        const response = await fetch(`${API_URL}/api/auth/verify-email/${verificationToken}`);
        const data = await response.json();

        if (response.ok) {
          window.history.replaceState({}, document.title, '/');
          return { success: true, message: data.message || 'Email verified successfully!' };
        } else {
          return { success: false, error: data.error || 'Email verification failed' };
        }
      } catch (err) {
        console.error('Email verification error:', err);
        return { success: false, error: 'Connection error during email verification' };
      }
    };

    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }

    // Check for email verification token in URL
    const params = new URLSearchParams(window.location.search);
    const verificationToken = params.get('token');
    if (verificationToken && window.location.pathname === '/verify-email') {
      handleEmailVerification(verificationToken);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Registration successful! Please check your email to verify your account.'
        };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: 'Password reset code sent! Check your email.' };
      } else {
        return { success: false, error: data.error || 'Password reset failed' };
      }
    } catch (err) {
      console.error('Password reset request error:', err);
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const resetPassword = async (email, resetToken, newPassword) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: resetToken, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: 'Password reset successful! You can now sign in.' };
      } else {
        return { success: false, error: data.error || 'Password reset failed' };
      }
    } catch (err) {
      console.error('Password reset error:', err);
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const value = {
    currentUser,
    token,
    loading,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
