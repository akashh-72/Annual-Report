import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft
} from 'react-icons/fi';
import {
  FaGraduationCap,
  FaUserShield,
  FaUserFriends,
  FaShieldAlt
} from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    rememberMe: false 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (loading) return; // Prevent double submission
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await login(formData.email, formData.password, formData.rememberMe);
      
      if (result.success) {
        const role = result.user?.role;
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        // Set error and keep it visible
        setError(result.error || 'Login failed. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-10">
      <div className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Section - Branding */}
          <div className="relative hidden md:flex flex-col justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 overflow-hidden">
            {/* Decorative Glow Bubbles */}
            <div className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -right-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <FaGraduationCap className="h-10 w-10 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold">TKIET Warananagar</h1>
                  <p className="text-blue-100 text-sm">
                    Tatyasaheb Kore Institute of Engineering & Technology
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-3">Welcome Back 👋</h2>
              <p className="text-blue-100 mb-8 leading-relaxed">
                Sign in to your account and continue your academic journey with
                confidence and innovation.
              </p>

              <div className="space-y-5">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-4 rounded-xl">
                    <FaUserFriends className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Student Community</h3>
                    <p className="text-blue-100 text-sm">
                      Connect and collaborate with peers
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-4 rounded-xl">
                    <FaUserShield className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Secure Portal</h3>
                    <p className="text-blue-100 text-sm">
                      Advanced authentication and data protection
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-4 rounded-xl">
                    <FaShieldAlt className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Trusted Access</h3>
                    <p className="text-blue-100 text-sm">
                      Built for students and faculty safety
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Login Card */}
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            {/* Back Button */}
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <FaGraduationCap className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sign In to Continue
              </h2>
              <p className="text-gray-600">
                Welcome back to TKIET Warananagar Portal
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800">Login Failed</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="ml-4 text-red-400 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-start">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 rounded-lg border outline-none transition ${
                      error ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                    } focus:border-transparent`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-start">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-3 rounded-lg border outline-none transition ${
                      error ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                    } focus:border-transparent`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-gray-700">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot password?
                </a>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don’t have an account?{' '}
                  <Link
                    to="/register"
                    className="text-blue-600 font-medium hover:text-blue-500 transition"
                  >
                    Create one
                  </Link>
                </p>
              </div>

              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
