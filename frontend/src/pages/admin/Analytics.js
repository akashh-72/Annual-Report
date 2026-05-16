import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { FiTrendingUp, FiPieChart, FiBarChart2, FiActivity, FiUsers, FiRefreshCw } from 'react-icons/fi';
import LoadingScreen from '../../components/admin/LoadingScreen';

const COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#14b8a6'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
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

  const load = async () => {
    try {
      setLoading(true);
      const a = await adminService.getAnalytics().catch(() => null);
      setAnalytics(a);
    } catch (e) {
      console.error('Failed to load analytics:', e);
      toast.error('Failed to load analytics');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading && !analytics) {
    return <LoadingScreen message="Loading analytics..." />;
  }

  // Calculate summary stats
  const totalActivities = (analytics?.monthly_activities || []).reduce((sum, m) => sum + m.count, 0);
  const totalUsers = analytics?.total_users || 0;
  const totalDepartments = (analytics?.department_distribution || []).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div 
        data-animate
        id="analytics-hero"
        className={`relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-3xl shadow-2xl p-8 transition-all duration-1000 ${isVisible['analytics-hero'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                  Admin • Analytics
                </span>
                <span className="px-3 py-1 bg-blue-600/30 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center border border-blue-400/30">
                  <FiTrendingUp className="mr-1.5 h-3 w-3" />
                  Real-time Insights
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Analytics & Insights</h1>
              <p className="text-blue-100 text-lg">Comprehensive data visualizations and system metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={load} 
                className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                aria-label="Refresh analytics"
              >
                <FiRefreshCw className="h-5 w-5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div 
        data-animate
        id="analytics-stats"
        className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 delay-100 ${isVisible['analytics-stats'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiActivity className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{totalActivities}</span>
            </div>
            <h3 className="text-white font-semibold">Total Activities</h3>
            <p className="text-blue-100 text-sm mt-1">All time submissions</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiUsers className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{totalUsers}</span>
            </div>
            <h3 className="text-white font-semibold">Total Users</h3>
            <p className="text-cyan-100 text-sm mt-1">Registered accounts</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiBarChart2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{totalDepartments}</span>
            </div>
            <h3 className="text-white font-semibold">Departments</h3>
            <p className="text-emerald-100 text-sm mt-1">Active departments</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div 
        data-animate
        id="analytics-charts"
        className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-1000 delay-200 ${isVisible['analytics-charts'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        {/* Monthly Activities Line Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:col-span-2 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <FiTrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Monthly Activities Trend</h3>
                <p className="text-sm text-gray-500">Activity submissions over time</p>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-sm text-gray-500 font-medium">Loading chart...</p>
              </div>
            </div>
          ) : (
            <div className="h-72 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(analytics?.monthly_activities || []).map(d => ({ name: `${d.month}/${d.year}`, count: d.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="name" stroke="#6366f1" style={{ fontSize: '12px', fontWeight: 500 }} />
                  <YAxis allowDecimals={false} stroke="#6366f1" style={{ fontSize: '12px', fontWeight: 500 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Activity Types Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <FiPieChart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Activity Types</h3>
                <p className="text-sm text-gray-500">Distribution</p>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-sm text-gray-500 font-medium">Loading chart...</p>
              </div>
            </div>
          ) : (
            <div className="h-72 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={analytics?.type_distribution || []} 
                    dataKey="count" 
                    nameKey="type" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label={(entry) => entry.type}
                    labelLine={{ stroke: '#9333ea', strokeWidth: 2 }}
                  >
                    {(analytics?.type_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Legend */}
          <div className="mt-4 space-y-2">
            {(analytics?.type_distribution || []).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{item.type}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Departments Bar Chart */}
      <div 
        data-animate
        id="departments-chart"
        className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 delay-300 ${isVisible['departments-chart'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <FiBarChart2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Departments Overview</h3>
              <p className="text-sm text-gray-500">Activity count by department</p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-sm text-gray-500 font-medium">Loading chart...</p>
            </div>
          </div>
        ) : (
          <div className="h-80 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(analytics?.department_distribution || []).map(d => ({ name: d.department || 'N/A', total: d.total }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100} 
                  stroke="#10b981" 
                  style={{ fontSize: '11px', fontWeight: 500 }}
                />
                <YAxis allowDecimals={false} stroke="#10b981" style={{ fontSize: '12px', fontWeight: 500 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                />
                <Bar 
                  dataKey="total" 
                  fill="url(#colorGradient)" 
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* User Statistics */}
      {analytics?.users_by_role && (
        <div 
          data-animate
          id="user-stats"
          className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 delay-400 ${isVisible['user-stats'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
              <FiUsers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">User Distribution by Role</h3>
              <p className="text-sm text-gray-500">Breakdown of user types</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(analytics.users_by_role).map(([role, count], index) => (
              <div key={role} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                    <FiUsers className="h-6 w-6" style={{ color: COLORS[index % COLORS.length] }} />
                  </div>
                  <span className="text-3xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>{count}</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 capitalize">{role}s</h4>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      backgroundColor: COLORS[index % COLORS.length],
                      width: `${(count / totalUsers * 100)}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{((count / totalUsers) * 100).toFixed(1)}% of total users</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
