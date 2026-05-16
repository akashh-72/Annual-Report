import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const result = await authService.getCurrentUser();
        if (result.success) {
          setUser(result.data);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const result = await authService.login(email, password, rememberMe);
      
      if (result.success) {
        const { access_token, user: userData } = result.data;
        
        // Store token
        localStorage.setItem('token', access_token);
        
        // Update state
        setUser(userData);
        
        toast.success('Login successful!');
        return { success: true, user: userData };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        toast.success('Registration successful! Please login with your credentials.');
        return { success: true };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('token_expires');
    
    // Clear state
    setUser(null);
    
    // Call logout API (don't wait for response)
    authService.logout();
    
    toast.success('Logged out successfully');
  };

  const updateUser = async (userData) => {
    try {
      const result = await authService.updateProfile(userData);
      
      if (result.success) {
        setUser(result.data);
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        toast.error(result.error || 'Failed to update profile');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to update profile';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const result = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      
      if (result.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      } else {
        toast.error(result.error || 'Failed to change password');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to change password';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const refreshToken = async () => {
    try {
      const result = await authService.refreshToken();
      
      if (result.success) {
        const { access_token } = result.data;
        localStorage.setItem('token', access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const isAdmin = () => user?.role === 'admin';
  const isFaculty = () => user?.role === 'faculty';
  const isStudent = () => user?.role === 'student';
  const canAccessAdmin = () => isAdmin();
  const canAccessFaculty = () => isAdmin() || isFaculty();

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    refreshToken,
    isAdmin,
    isFaculty,
    isStudent,
    canAccessAdmin,
    canAccessFaculty
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
