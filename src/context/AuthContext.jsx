import React, { createContext, useContext, useState } from 'react';
import { validateCredentials, getUserInterviews, getUserProfile } from '../data/userData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const validatedUser = validateCredentials(credentials.email, credentials.password);
      
      if (validatedUser) {
        // Get user's interviews
        const userInterviews = getUserInterviews(validatedUser.id, validatedUser.role);
        
        // Set user data with interviews
        setUser({ ...validatedUser, interviews: userInterviews });
        setIsAuthenticated(true);
        
        // Store minimal data in localStorage
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('userId', validatedUser.id);
        localStorage.setItem('userRole', validatedUser.role);
        
        return { success: true, user: validatedUser };
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  };

  // Check authentication status on mount
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (token && userId && userRole) {
      const userProfile = getUserProfile(parseInt(userId), userRole);
      if (userProfile) {
        const userInterviews = getUserInterviews(parseInt(userId), userRole);
        setUser({ ...userProfile, interviews: userInterviews });
        setIsAuthenticated(true);
      } else {
        logout();
      }
    }
  };

  // Helper functions for role checking
  const isInterviewer = () => user?.role === 'interviewer';
  const isCandidate = () => user?.role === 'candidate';

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      error,
      login,
      logout,
      checkAuth,
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