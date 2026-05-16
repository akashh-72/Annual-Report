import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiEdit3, 
  FiSave, 
  FiX, 
  FiShield, 
  FiLock,
  FiCamera,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

// Fixed: Moved InputField outside the main component to prevent re-rendering/focus loss issues
const InputField = ({ label, name, value, onChange, icon: Icon, disabled = false, type = "text", placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-200 
          ${disabled 
            ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed' 
            : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          }`}
      />
    </div>
  </div>
);

const Profile = () => {
  const { user, updateUser, changePassword } = useAuth();
  
  // UI States
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'security'
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Form Data States
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    phone: '',
    student_id: '',
    year_of_study: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        phone: user.phone || '',
        student_id: user.student_id || '',
        year_of_study: user.year_of_study || ''
      });
    }
  }, [user]);

  // Clear notifications after 3 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ type: '', message: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const result = await updateUser(formData);
      if (result.success) {
        setIsEditing(false);
        setNotification({ type: 'success', message: 'Profile updated successfully!' });
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setNotification({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (passwordData.new_password.length < 6) {
      setNotification({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(passwordData);
      if (result.success) {
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        setNotification({ type: 'success', message: 'Password changed successfully!' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Incorrect current password or server error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        phone: user.phone || '',
        student_id: user.student_id || '',
        year_of_study: user.year_of_study || ''
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Notification Toast */}
        {notification.message && (
          <div className={`fixed top-24 right-4 sm:right-8 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 border ${
            notification.type === 'success' ? 'bg-white border-green-100 text-green-700' : 'bg-white border-red-100 text-red-700'
          }`}>
            {notification.type === 'success' ? <FiCheckCircle className="h-5 w-5" /> : <FiAlertCircle className="h-5 w-5" />}
            <p className="font-medium text-sm">{notification.message}</p>
          </div>
        )}

        {/* 1. Header Card with Cover */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          
          <div className="px-6 sm:px-8 pb-6 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-16 gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center text-4xl font-bold text-blue-600 overflow-hidden relative">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="bg-blue-50 h-full w-full flex items-center justify-center">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Hover Edit Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <FiCamera className="text-white h-8 w-8" />
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center sm:text-left space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FiShield className="h-4 w-4" />
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiMapPin className="h-4 w-4" />
                    {user?.department || 'Department not set'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiCalendar className="h-4 w-4" />
                    Joined {new Date(user?.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Edit Toggle Button */}
              {activeTab === 'general' && (
                <div className="mt-4 sm:mt-0">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <FiEdit3 className="mr-2 -ml-1 h-4 w-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <FiX className="mr-2 -ml-1 h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        {loading ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                        ) : (
                          <FiSave className="mr-2 -ml-1 h-4 w-4" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="mt-8 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === 'general'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FiUser className="h-4 w-4" />
                  Personal Information
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === 'security'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FiLock className="h-4 w-4" />
                  Security & Password
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* 2. Main Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          
          {/* TAB: General Information */}
          {activeTab === 'general' && (
            <div className="animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InputField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={FiUser}
                />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FiMail className="w-4 h-4 text-gray-400" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400">Read-only</span>
                  </div>
                </div>

                <InputField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={FiPhone}
                  placeholder="+91 00000 00000"
                />

                <InputField
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={FiMapPin}
                />

                {user?.role === 'student' && (
                  <>
                    <InputField
                      label="Student ID"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      disabled={!isEditing}
                      icon={FiShield}
                    />
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        Year of Study
                      </label>
                      <select
                        name="year_of_study"
                        value={formData.year_of_study}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-200 ${
                          !isEditing 
                            ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed' 
                            : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB: Security */}
          {activeTab === 'security' && (
            <div className="max-w-xl animate-in fade-in duration-300">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Ensure your account is using a long, random password to stay secure.
                </p>
              </div>

              <div className="space-y-5">
                <InputField
                  label="Current Password"
                  name="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  icon={FiLock}
                  placeholder="••••••••"
                />
                
                <div className="border-t border-gray-100 my-4"></div>

                <InputField
                  label="New Password"
                  name="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  icon={FiLock}
                  placeholder="••••••••"
                />

                <InputField
                  label="Confirm New Password"
                  name="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  icon={FiLock}
                  placeholder="••••••••"
                />

                <div className="pt-4">
                  <button
                    onClick={handleSavePassword}
                    disabled={loading || !passwordData.current_password || !passwordData.new_password}
                    className="flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                    ) : (
                      <FiShield className="mr-2 h-4 w-4" />
                    )}
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;