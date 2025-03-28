import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token and validate it
    const token = localStorage.getItem('authToken');
    if (token) {
      // TODO: Validate token with backend
      setIsAuthenticated(true);
      // TODO: Fetch user data
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
      try {
        if (credentials.email === 'admin@gmail.com' && credentials.password === 'admin') {
          // TODO: Implement actual login logic with backend
          setIsAuthenticated(true);
          setUser({ id: 1, role: 'user' }); // Replace with actual user data
          localStorage.setItem('authToken', 'dummy-token');
        } else {
          throw new Error('Invalid credentials');
        }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
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

export { AuthContext }; 