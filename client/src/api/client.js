import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 12000
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('margem_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && sessionStorage.getItem('margem_token')) {
    sessionStorage.removeItem('margem_token');
    sessionStorage.removeItem('margem_user');
  }
  return Promise.reject(error);
});

export default api;
