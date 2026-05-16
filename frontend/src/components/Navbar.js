import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import {
  FiHome,
  FiActivity,
  FiPlus,
  FiShield,
  FiFileText,
  FiUser,
  FiLogOut,
  FiBell,
  FiMenu,
  FiX,
  FiTrash2,
  FiCalendar,
  FiChevronDown,
  FiSettings
} from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { 
    notifications = [], // Default to empty array to prevent crashes
    unreadCount = 0, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    getNotificationIcon, 
    getNotificationColor, 
    loadNotifications 
  } = useNotifications();
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'notifications', 'profile', or null
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Toggle Dropdowns
  const toggleDropdown = (name) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
      // Only load notifications if user exists to prevent "User undefined" log
      if (name === 'notifications' && user) {
        loadNotifications();
      }
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current && !notificationRef.current.contains(event.target) &&
        profileRef.current && !profileRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/activities', label: 'Achievements', icon: FiActivity },
    { path: '/events', label: 'Events', icon: FiCalendar },
    { path: '/reports', label: 'Reports', icon: FiFileText },
    { path: '/test-moderation', label: 'Moderation Test', icon: FiShield },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* 1. BRANDING */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-blue-600 p-2 rounded-lg shadow-blue-200 shadow-md group-hover:scale-105 transition-transform duration-200">
              <FaGraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 leading-none tracking-tight">TKIET</span>
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Achievement Portal</span>
            </div>
          </Link>

          {/* 2. CENTER NAVIGATION (Desktop) */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`mr-2 h-4 w-4 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            ))}
          </div>

          {/* 3. RIGHT ACTIONS (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {/* Create Button */}
                <Link
                  to="/activities/create"
                  className="hidden lg:flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-gray-200 hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <FiPlus className="h-4 w-4" />
                  <span>Share Achievement</span>
                </Link>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => toggleDropdown('notifications')}
                    className={`p-2 rounded-full transition-colors relative ${
                      activeDropdown === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <FiBell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                    )}
                  </button>

                  {/* Notification Popup */}
                  {activeDropdown === 'notifications' && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                          <div className="p-8 flex justify-center"><div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div></div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400 text-sm">No new notifications</div>
                        ) : (
                          // FIXED: Added index as fallback key to prevent "unique key" warning
                          notifications.map((notif, index) => (
                            <div 
                              key={notif.id || `notif-${index}`} 
                              onClick={() => !notif.read && markAsRead(notif.id)}
                              className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                            >
                              <div className={`mt-1 ${getNotificationColor(notif.type)}`}>{getNotificationIcon(notif.type)}</div>
                              <div className="flex-1">
                                <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                <p className="text-[10px] text-gray-400 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }} className="text-gray-300 hover:text-red-500 self-start">
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      <Link to="/notifications" onClick={() => setActiveDropdown(null)} className="block p-3 text-center text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-blue-600 border-t border-gray-50">
                        View all history
                      </Link>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-gray-200 mx-1"></div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => toggleDropdown('profile')}
                    className="flex items-center gap-2 hover:bg-gray-50 rounded-full p-1 pr-3 transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name ? user.name.split(' ')[0] : 'User'}</span>
                    <FiChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${activeDropdown === 'profile' ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Menu */}
                  {activeDropdown === 'profile' && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      
                      <div className="p-1">
                        <Link to="/profile" onClick={() => setActiveDropdown(null)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                          <FiUser className="h-4 w-4" /> My Profile
                        </Link>
                        {user?.role === 'admin' && (
                          <Link to="/admin" onClick={() => setActiveDropdown(null)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                            <FiShield className="h-4 w-4" /> Admin Panel
                          </Link>
                        )}
                      </div>
                      
                      <div className="p-1 border-t border-gray-50">
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                          <FiLogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Login</Link>
                <Link to="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">Register</Link>
              </div>
            )}
          </div>

          {/* 4. MOBILE TOGGLE */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
               <button onClick={() => toggleDropdown('notifications')} className="relative p-2 text-gray-600">
                 <FiBell className="h-6 w-6" />
                 {unreadCount > 0 && <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>}
               </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 5. MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-medium ${
                  isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            ))}
            
            {user && (
              <>
                <div className="my-2 border-t border-gray-100"></div>
                <Link to="/activities/create" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-base font-medium text-gray-900">
                  <FiPlus className="mr-3 h-5 w-5" /> Share Achievement
                </Link>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-base font-medium text-gray-900">
                  <FiUser className="mr-3 h-5 w-5" /> My Profile
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-base font-medium text-gray-900">
                    <FiShield className="mr-3 h-5 w-5" /> Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600">
                  <FiLogOut className="mr-3 h-5 w-5" /> Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;