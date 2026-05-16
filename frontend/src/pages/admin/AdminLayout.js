import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMenu, FiBarChart2, FiActivity, FiUsers, FiTrendingUp, FiFileText, FiSettings, FiMoon, FiSun, FiClock, FiBell, FiLogOut, FiChevronDown, FiCalendar, FiAward } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const nav = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: FiBarChart2 },
    { to: '/admin/activities', label: 'Achievements', icon: FiAward },
    { to: '/admin/events', label: 'Events', icon: FiCalendar },
    { to: '/admin/users', label: 'Users', icon: FiUsers },
    { to: '/admin/analytics', label: 'Analytics', icon: FiTrendingUp },
    { to: '/admin/reports', label: 'Reports', icon: FiFileText },
    { to: '/admin/notifications', label: 'Notifications', icon: FiBell },
    { to: '/admin/settings', label: 'Settings', icon: FiSettings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
      <header className="backdrop-blur bg-white/90 border-b-2 border-blue-100 fixed top-0 left-0 right-0 z-40 shadow-sm">
        <div className="flex items-center px-6 h-16">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-blue-50 transition-colors">
            <FiMenu className="h-5 w-5 text-gray-700" />
          </button>
          <div className="flex-1 flex justify-between items-center px-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-blue-600 font-medium">TKIET Warananagar · Achievement Portal</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggle}
                title="Toggle dark mode"
                className="p-2 rounded-md hover:bg-blue-50 transition-colors text-gray-700"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </button>
              
              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-semibold">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-blue-600">{user?.email}</p>
                  </div>
                  <FiChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-blue-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-blue-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-blue-600 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/admin/settings');
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        >
                          <FiSettings className="h-4 w-4" />
                          <span>Settings</span>
                        </button>
                      </div>
                      <div className="border-t border-blue-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                        >
                          <FiLogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <aside className={`fixed left-0 top-16 bottom-0 z-30 transition-all duration-300 ${
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
        }`}>
          <div className="h-full bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl">
            <div className="px-5 py-4 border-b border-blue-700">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-700 p-2 rounded-lg">
                  <FiBarChart2 className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-blue-100">Navigation</p>
              </div>
            </div>
            <nav className="p-3 space-y-1">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        isActive ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-blue-800/50 text-blue-100'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            
            {/* Logout Button in Sidebar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-blue-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 transition-all duration-200 font-medium"
              >
                <FiLogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
          <div className="p-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


