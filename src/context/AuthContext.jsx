import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateCredentials, getUserInterviews, getUserProfile, users } from '../data/userData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      if (token && storedUser) {
        // Validate token and user data
        const foundUser = users.interviewers.find(i => i.email === storedUser.email) || 
                         users.candidates.find(c => c.email === storedUser.email);
        
        if (foundUser) {
          // Remove sensitive data
          const { password, ...safeUser } = foundUser;
          setUser(safeUser);
          setIsAuthenticated(true);
        } else {
          // If user not found, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Find user in your data
      const foundUser = users.interviewers.find(i => i.email === credentials.email && i.password === credentials.password) ||
                       users.candidates.find(c => c.email === credentials.email && c.password === credentials.password);

      if (foundUser) {
        // Remove sensitive data
        const { password, ...safeUser } = foundUser;
        
        // Store auth data
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(safeUser));
        
        setUser(safeUser);
        setIsAuthenticated(true);
        return { success: true, user: safeUser };
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Helper functions for role checking
  const isInterviewer = () => user?.role === 'interviewer';
  const isCandidate = () => user?.role === 'candidate';

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      error,
      login,
      logout,
      checkAuthStatus,
      isInterviewer,
      isCandidate
    }}>
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