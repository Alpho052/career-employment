import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase-config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login function
  const login = async (email, password) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
    } else if (data.needsVerification) {
      localStorage.setItem('emailForVerification', email);
    } else {
      throw new Error(data.error);
    }
    return data; // Return the full response
  };

  // Register function
  const register = async (userData) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('emailForVerification', userData.email);
      return data;
    } else {
      throw new Error(data.error);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('emailForVerification');
    setCurrentUser(null);
  };

  // Verify email function
  const verifyEmail = async (email, verificationCode) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, verificationCode }),
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      localStorage.removeItem('emailForVerification');
      return data;
    } else {
      throw new Error(data.error);
    }
  };

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      fetch(`${process.env.REACT_APP_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setCurrentUser(data.user);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const value = {
    currentUser,
    login,
    register,
    logout,
    verifyEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};