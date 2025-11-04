import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to include auth token
axiosInstance.interceptors.request.use(
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

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Return the response data directly
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({ message: 'Network Error: Unable to connect to the server' });
    }

    // Handle different HTTP status codes
    const { status, data } = error.response;
    
    if (status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized:', data?.message || 'Please log in');
      // You might want to redirect to login here
    } else if (status === 403) {
      console.error('Forbidden:', data?.message || 'You do not have permission');
    } else if (status === 404) {
      console.error('Not Found:', data?.message || 'The requested resource was not found');
    } else if (status >= 500) {
      console.error('Server Error:', data?.message || 'Internal server error');
    }

    // Return a consistent error object
    return Promise.reject({
      message: data?.message || 'An error occurred',
      status: status,
      data: data
    });
  }
);
