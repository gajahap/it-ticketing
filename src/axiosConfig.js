// src/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://support.portalgapsoft.xyz/api', // replace with your API base URL
  timeout: 60000, // request timeout in milliseconds (optional)
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  config => {
    // Modify config if needed (e.g., add auth token)
    const token = localStorage.getItem('token'); // or get token from context or state
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Handle error globally (e.g., show notifications or log out on 401)
    if (error.response && error.response.status === 401) {
      // handle unauthorized errors
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
