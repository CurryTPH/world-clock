"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
  loginWithGoogle: async () => {},
  loginWithGithub: async () => {}
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

// Check for token in localStorage on initial start up
  useEffect(() => {
// Verify the authentication status when components start up
    const checkAuthStatus = async () => {
      try {
// Get the token from local storage
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

// Verify token validity by requesting to server
        const response = await fetch('http://localhost:3001/api/auth/session', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

// If token is valid, set the user data
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        } else {
// If token is invalid, remove it from storage
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

// Login method, authenticates user with email and password
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
// Send login request to server
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

// Handle failed login
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

// Process successful login
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

// Login with Google
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Redirect to Google OAuth endpoint
      window.location.href = 'http://localhost:3001/api/auth/google';
      // Note: The actual authentication process will be handled by the server redirects
    } catch (error) {
      console.error('Google login error:', error);
      setLoading(false);
      throw error;
    }
  };

// Login with GitHub
  const loginWithGithub = async () => {
    setLoading(true);
    try {
      // Redirect to GitHub OAuth endpoint
      window.location.href = 'http://localhost:3001/api/auth/github';
      // Note: The actual authentication process will be handled by the server redirects
    } catch (error) {
      console.error('GitHub login error:', error);
      setLoading(false);
      throw error;
    }
  };

// Logout method, clears user session and redirects to login
  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

// Signup method, registers a new user account (SETUP BETTER SECURITY AND AUTHENTICATION)
  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
// Send signup request to server
      const response = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

// Handle failed signup
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

// Process successful signup
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      signup,
      loginWithGoogle,
      loginWithGithub
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
