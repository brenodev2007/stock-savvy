import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }

    if (error.response?.status === 403 && error.response?.data?.upgrade_required) {
      // Dispara evento global para abrir modal de upgrade
      const event = new CustomEvent('upgrade-required', { 
        detail: { 
          message: error.response.data.message || 'Faça upgrade para acessar este recurso',
          feature: 'Limite do Plano'
        } 
      });
      window.dispatchEvent(event);
    }
    return Promise.reject(error);
  }
);

export default api;
