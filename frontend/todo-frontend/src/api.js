import axios from 'axios';

const api = axios.create({
  // FIXED: Base URL now includes '/api' to match your Backend Controller paths
  baseURL: 'https://aligntogther-assessment-todo.onrender.com/api', 
});

// Add a request interceptor to add the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;