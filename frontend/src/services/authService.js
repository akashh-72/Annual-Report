import axios from 'axios';

// Get API URL from environment or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear token and redirect to login
    // BUT: Don't redirect if it's a login/register request (those are expected to fail)
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = requestUrl.includes('/auth/login') || 
                            requestUrl.includes('/auth/register');
      
      // Only redirect if it's NOT an auth endpoint and we're not already on login/register page
      if (!isAuthEndpoint && 
          window.location.pathname !== '/login' && 
          window.location.pathname !== '/register') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Remember me option
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async login(email, password, rememberMe = false) {
    try {
      const response = await api.post('/api/v1/auth/login', {
        email,
        password,
        remember_me: rememberMe
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  },

  /**
   * Register new user
   * @param {object} userData - User registration data
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async register(userData) {
    try {
      const response = await api.post('/api/v1/auth/register', userData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  },

  /**
   * Get current user
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/api/v1/auth/me');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  },

  /**
   * Update user profile
   * @param {object} userData - Updated user data
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async updateProfile(userData) {
    try {
      const response = await api.put('/api/v1/auth/me', userData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      await api.post('/api/v1/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  },

  /**
   * Refresh access token
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async refreshToken() {
    try {
      const response = await api.post('/api/v1/auth/refresh');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  },

  /**
   * Logout user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async logout() {
    try {
      await api.post('/api/v1/auth/logout');
      
      return {
        success: true
      };
    } catch (error) {
      // Even if logout fails on server, clear local storage
      return {
        success: true
      };
    }
  },

  /**
   * Extract error message from API response
   * @param {Error} error - Error object
   * @returns {string} - Error message
   */
  getErrorMessage(error) {
    if (error.response?.data) {
      const data = error.response.data;
      
      // Check for detail field (FastAPI default)
      if (data.detail) {
        // Handle both string and object detail
        if (typeof data.detail === 'string') {
          return data.detail;
        }
        if (Array.isArray(data.detail)) {
          // Validation errors come as array
          return data.detail[0]?.msg || data.detail[0]?.message || 'Validation error';
        }
      }
      
      // Check for nested error object (from custom exception handlers)
      if (data.error) {
        if (typeof data.error === 'string') {
          return data.error;
        }
        if (data.error.message) {
          return data.error.message;
        }
        if (data.error.detail) {
          return data.error.detail;
        }
      }
      
      // Check for message field
      if (data.message) {
        return data.message;
      }
      
      // If no specific error, return generic message based on status code
      const status = error.response?.status;
      if (status === 401) {
        return 'Invalid email or password';
      }
      if (status === 409) {
        return 'Email already exists';
      }
      if (status === 422) {
        return 'Validation error. Please check your input.';
      }
      
      return 'An error occurred';
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  }
};

export default authService;

