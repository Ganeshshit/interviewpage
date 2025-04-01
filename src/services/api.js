import axios from 'axios';

const api = axios.create({
  baseURL: 'https://interviewbackend-zfwp.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add error handling interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

export const emailAPI = {
  sendMeetingEmail: async (data) => {
    try {
      // Validate required fields
      if (!data.receiverEmail || !data.candidateName || !data.roomLink) {
        throw new Error(`Missing required fields: ${[
          !data.receiverEmail && 'receiverEmail',
          !data.candidateName && 'candidateName',
          !data.roomLink && 'roomLink'
        ].filter(Boolean).join(', ')}`);
      }

      const response = await fetch('https://interviewbackend-zfwp.onrender.com/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      return await response.json();
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }
}; 