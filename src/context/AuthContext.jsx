import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    try {
      // TODO: Replace with actual API call
      // For now, we'll simulate a successful login
      setUser({
        id: 1,
        email: credentials.email,
        name: 'Test User'
      });
      return true;
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (userData) => {
    try {
      // TODO: Replace with actual API call
      // For now, we'll simulate a successful registration
      setUser({
        id: 1,
        email: userData.email,
        name: userData.name
      });
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