import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies
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
    const token = localStorage.getItem('token');
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

      // Format the email data according to backend expectations
      const emailData = {
        to: data.receiverEmail,
        subject: `Interview Invitation - ${data.candidateName}`,
        html: `
          <h1>Interview Invitation</h1>
          <p>Hello ${data.candidateName},</p>
          <p>You have been invited to an interview. Please join using the link below:</p>
          <p><a href="${data.roomLink}">Join Interview</a></p>
          <p>Best regards,<br>The Interview Team</p>
        `
      };

      const response = await api.post('/email/send', emailData);
      return response.data;
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }
};

// WebRTC Signaling API
export const webrtcAPI = {
  sendOffer: async (roomId, offer) => {
    try {
      const response = await api.post(`/api/interview/${roomId}/offer`, { offer });
      return response.data;
    } catch (error) {
      console.error('Error sending offer:', error);
      // Don't throw the error, just log it
      return null;
    }
  },

  sendAnswer: async (roomId, answer) => {
    try {
      const response = await api.post(`/api/interview/${roomId}/answer`, { answer });
      return response.data;
    } catch (error) {
      console.error('Error sending answer:', error);
      return null;
    }
  },

  sendIceCandidate: async (roomId, candidate) => {
    try {
      const response = await api.post(`/api/interview/${roomId}/ice-candidate`, { candidate });
      return response.data;
    } catch (error) {
      console.error('Error sending ICE candidate:', error);
      // Don't throw the error, just log it
      return null;
    }
  },

  listenToSignaling: (roomId, callbacks) => {
    const eventSource = new EventSource(`/api/interview/${roomId}/events`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'answer':
            callbacks.onAnswer?.(data.answer);
            break;
          case 'ice-candidate':
            callbacks.onIceCandidate?.(data.candidate);
            break;
          case 'user-joined':
            callbacks.onUserJoined?.(data.user);
            break;
          case 'user-left':
            callbacks.onUserLeft?.(data.user);
            break;
        }
      } catch (error) {
        console.error('Error handling signaling event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }
}; 