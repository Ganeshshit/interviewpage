import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Dummy user data for testing
  const dummyUsers = [
    {
      id: 1,
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'candidate'
    },
    {
      id: 2,
      email: 'interviewer@example.com',
      password: 'password123',
      name: 'Test Interviewer',
      role: 'interviewer'
    }
  ];

  const login = async (credentials) => {
    try {
      // Replace with actual API call
      // Simulating an API response
      const response = {
        user: {
          id: 1,
          name: 'John Doe',
          email: credentials.email,
          role: 'interviewer', // This will be used for role-based access
        },
        token: 'mock-jwt-token',
      };

      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', response.token);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const register = async (userData) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (dummyUsers.some(user => user.email === userData.email)) {
        throw new Error('User already exists');
      }

      // Create new user (in real app, this would be handled by backend)
      const newUser = {
        id: dummyUsers.length + 1,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'candidate'
      };

      // Remove password from user data before setting in state
      setUser(newUser);
      return true;
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  // Check if user is already logged in (e.g., on page refresh)
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Replace with actual API call to validate token
        // For now, we'll simulate it
        const response = {
          user: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'interviewer',
          },
        };
        setUser(response.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, checkAuth }}>
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