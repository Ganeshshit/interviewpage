import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in dummy data
      const matchedUser = dummyUsers.find(
        user => user.email === credentials.email && user.password === credentials.password
      );

      if (!matchedUser) {
        throw new Error('Invalid credentials');
      }

      // Remove password from user data before setting in state
      const { password, ...userWithoutPassword } = matchedUser;
      setUser(userWithoutPassword);
      return true;
    } catch (error) {
      throw new Error('Login failed');
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
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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