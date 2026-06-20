import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Attach the JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mindwell_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If token expires/invalid, log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mindwell_token');
      localStorage.removeItem('mindwell_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
