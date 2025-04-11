import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetchUserProfile(token);
        } catch (error) {
          console.error('Auth check failed:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      console.log('Fetching user profile...');
      const response = await api.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Profile response:', response.data);

      if (response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
        setError(null);
      } else {
        console.error('Profile fetch failed:', response.data);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setError(response.data.message);
        toast.error('Session expired. Please login again.');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setError(error.message);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.message === 'Network Error') {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to fetch profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('Login request to:', import.meta.env.VITE_BACKEND_URL);
      console.log('Login request data:', credentials);
      
      const response = await api.post('/api/auth/login', credentials);
      console.log('Login response:', response.data);

      if (response.data.success) {
        const { token, data } = response.data;
        localStorage.setItem('token', token);
        setUser(data);
        setIsAuthenticated(true);
        setError(null);
        toast.success('Login successful!');
        
        return { 
          success: true,
          user: data
        };
      } else {
        const errorMessage = response.data.message || 'Login failed';
        setError(errorMessage);
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage;
      
      if (error.message === 'Network Error') {
        errorMessage = 'Network error - Please check your connection and try again';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid credentials';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
        isInterviewer: user?.role === 'interviewer',
        isCandidate: user?.role === 'candidate',
      }}
    >
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