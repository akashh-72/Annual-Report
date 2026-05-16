import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { FiActivity, FiCheck, FiClock, FiX, FiPlus, FiUsers, FiFileText, FiTrendingUp, FiAlertCircle, FiAward, FiTarget, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Badge from '../../components/admin/Badge';
import LoadingScreen from '../../components/admin/LoadingScreen';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemHealth] = useState({ status: 'healthy', uptime: '99.9%' });
  const [isVisible, setIsVisible] = useState({});

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        load();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [s, a, activities] = await Promise.all([
        adminService.getStats(), 
        adminService.getAnalytics(),
        adminService.listActivities({ skip: 0, limit: 5 }).catch(() => ({ activities: [] }))
      ]);
      setStats(s);
      setAnalytics(a);
      setRecentActivities(activities.activities || []);
    } catch (e) {
      toast.error('Failed to load dashboard');
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      load();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return <LoadingScreen message="Loading admin dashboard..." />;
  }

  const COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#14b8a6'];

  const quickActions = [
    { icon: FiPlus, title: 'Create Activity', description: 'Add new achievement', gradient: 'from-emerald-500 to-green-600', path: '/admin/activities', action: 'create' },
    { icon: FiUsers, title: 'Manage Users', description: 'User access control', gradient: 'from-blue-500 to-blue-600', path: '/admin/users' },
    { icon: FiFileText, title: 'Generate Report', description: 'Download analytics', gradient: 'from-cyan-500 to-blue-600', path: '/admin/reports' },
    { icon: FiTarget, title: 'View Analytics', description: 'Insights & trends', gradient: 'from-blue-500 to-blue-600', path: '/admin/analytics' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div 
        data-animate
        id="admin-hero"
        className={`relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-3xl shadow-2xl p-8 transition-all duration-1000 ${isVisible['admin-hero'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-blue-800/50 backdrop-blur-sm rounded-full text-xs font-medium text-blue-100 border border-blue-600">
                  Admin Panel
                </span>
                <span className="px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center border border-green-400/30">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                  Live
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard Overview</h1>
              <p className="text-blue-100 text-lg">Monitor and manage your institution's achievement portal</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={load} 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                aria-label="Refresh dashboard"
              >
                <FiRefreshCw className="h-5 w-5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div 
        data-animate
        id="stats-cards"
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-1000 delay-100 ${isVisible['stats-cards'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-blue-500">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiActivity className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-blue-100 uppercase tracking-wider">Total</p>
                <p className="text-3xl font-bold text-white">{stats?.total_activities || 0}</p>
              </div>
            </div>
            <h3 className="text-white font-semibold text-lg">Activities</h3>
            <p className="text-blue-100 text-sm mt-1">All time submissions</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiCheck className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-green-100 uppercase tracking-wider">Approved</p>
                <p className="text-3xl font-bold text-white">{stats?.accepted_activities || 0}</p>
              </div>
            </div>
            <h3 className="text-white font-semibold text-lg">Accepted</h3>
            <p className="text-green-100 text-sm mt-1">Verified achievements</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiClock className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-orange-100 uppercase tracking-wider">Pending</p>
                <p className="text-3xl font-bold text-white">{stats?.pending_activities || 0}</p>
              </div>
            </div>
            <h3 className="text-white font-semibold text-lg">Awaiting Review</h3>
            <p className="text-orange-100 text-sm mt-1">Need attention</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiX className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-red-100 uppercase tracking-wider">Rejected</p>
                <p className="text-3xl font-bold text-white">{stats?.rejected_activities || 0}</p>
              </div>
            </div>
            <h3 className="text-white font-semibold text-lg">Not Approved</h3>
            <p className="text-red-100 text-sm mt-1">Declined submissions</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div 
        data-animate
        id="quick-actions"
        className={`transition-all duration-1000 delay-200 ${isVisible['quick-actions'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <FiTarget className="mr-2 text-blue-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (action.action === 'create') {
                  navigate(action.path, { state: { openCreateModal: true } });
                } else {
                  navigate(action.path);
                }
              }}
              className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2 border-blue-100 hover:border-blue-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl inline-block mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{action.title}</h4>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div 
          data-animate
          id="system-health"
          className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-100 p-6 transition-all duration-1000 delay-300 ${isVisible['system-health'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-500 rounded-xl shadow-lg">
              <FiAlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
              <p className="text-sm text-gray-600">All systems operational</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <Badge variant="success">Healthy</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-sm font-medium text-gray-700">Uptime</span>
              <span className="text-sm font-bold text-green-600">{systemHealth.uptime}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-sm font-medium text-gray-700">Last Check</span>
              <span className="text-sm text-gray-600">Just now</span>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div 
          data-animate
          id="recent-activities"
          className={`lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-1000 delay-400 ${isVisible['recent-activities'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiTrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            </div>
            <button
              onClick={() => navigate('/admin/activities')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              View All <FiAward className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id || activity._id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">{activity.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.user_name || 'Unknown User'} • {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={activity.status === 'accepted' ? 'success' : activity.status === 'pending' ? 'warning' : 'danger'}>
                    {activity.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FiActivity className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {analytics && (
        <div 
          data-animate
          id="analytics"
          className={`transition-all duration-1000 delay-500 ${isVisible['analytics'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FiTrendingUp className="mr-2 text-blue-600" />
            Analytics Overview
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Statistics */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiUsers className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">User Statistics</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <span className="text-sm text-gray-700 font-medium">Total Users</span>
                  <span className="text-2xl font-bold text-blue-600">{analytics.total_users}</span>
                </div>
                {analytics.users_by_role && Object.entries(analytics.users_by_role).map(([role, count]) => (
                  <div key={role} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="text-sm text-gray-600 capitalize flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      {role}
                    </span>
                    <span className="font-semibold text-gray-900 text-sm">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Types */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiActivity className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Activity Distribution</h3>
              </div>
              {analytics.type_distribution && analytics.type_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.type_distribution}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.type}: ${entry.count}`}
                    >
                      {analytics.type_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>No data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
