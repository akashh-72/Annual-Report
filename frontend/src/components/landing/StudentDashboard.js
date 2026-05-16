import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiActivity, 
  FiTrendingUp, 
  FiPlus, 
  FiEye,
  FiAward,
  FiCalendar,
  FiFileText,
  FiArrowRight,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiMapPin,
  FiUsers,
  FiTag
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/authService';
import toast from 'react-hot-toast';

const StudentDashboard = ({ isVisible }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_activities: 0,
    accepted_activities: 0,
    pending_activities: 0,
    rejected_activities: 0,
    activity_types: []
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadUpcomingEvents();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's activities
      const response = await api.get('/api/v1/activities', {
        params: {
          page: 1,
          size: 100 // Get all activities for stats calculation
        }
      });

      // Filter out admin-created activities (events) - students should only see their own achievements
      const studentActivities = (response.data.activities || []).filter(
        activity => !activity.is_admin_created && activity.user_id === user?.id
      );
      
      // Calculate statistics
      const total = studentActivities.length;
      const accepted = studentActivities.filter(a => a.status === 'accepted').length;
      const pending = studentActivities.filter(a => a.status === 'pending').length;
      const rejected = studentActivities.filter(a => a.status === 'rejected').length;

      // Calculate activity type distribution
      const typeCounts = {};
      studentActivities.forEach(activity => {
        const type = activity.type?.charAt(0).toUpperCase() + activity.type?.slice(1) || 'Other';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      const activityTypes = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count
      })).sort((a, b) => b.count - a.count);

      // Get recent activities (last 4, sorted by date)
      const recent = studentActivities
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 4)
        .map(activity => ({
          id: activity.id || activity._id,
          title: activity.title,
          description: activity.description,
          type: activity.type?.charAt(0).toUpperCase() + activity.type?.slice(1) || 'Other',
          status: activity.status,
          created_at: activity.created_at,
          year: activity.year
        }));

      setStats({
        total_activities: total,
        accepted_activities: accepted,
        pending_activities: pending,
        rejected_activities: rejected,
        activity_types: activityTypes
      });
      
      setRecentActivities(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await api.get('/api/v1/events/upcoming', {
        params: {
          page: 1,
          size: 3 // Show only 3 upcoming events on dashboard
        }
      });
      
      setUpcomingEvents(response.data.events || []);
    } catch (error) {
      console.error('Error loading upcoming events:', error);
      setUpcomingEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Date TBA';
    }
  };

  const getEventTypeColor = (type) => {
    const typeLower = type?.toLowerCase() || '';
    const colors = {
      technical: '#3B82F6',
      cultural: '#EC4899',
      sports: '#10B981',
      academic: '#8B5CF6',
      social: '#F59E0B'
    };
    return colors[typeLower] || '#6B7280';
  };

  const getActivityTypeColor = (type) => {
    const typeLower = type?.toLowerCase() || '';
    const colors = {
      technical: '#6366F1',
      sports: '#10B981',
      academic: '#8B5CF6',
      cultural: '#EC4899',
      social: '#F59E0B'
    };
    return colors[typeLower] || '#6B7280';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'accepted': return <FiCheckCircle className="w-5 h-5" />;
      case 'pending': return <FiClock className="w-5 h-5" />;
      case 'rejected': return <FiAlertCircle className="w-5 h-5" />;
      default: return <FiClock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Calculate year progress
  const currentMonth = new Date().getMonth() + 1;
  const yearProgress = Math.round((currentMonth / 12) * 100);
  const monthsCompleted = currentMonth;
  const monthsRemaining = 12 - currentMonth;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <section id="dashboard" className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div 
          data-animate
          className={`mb-8 lg:mb-12 transition-all duration-1000 ${isVisible['dashboard-header'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          id="dashboard-header"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-block mb-3 px-4 py-2 bg-blue-100 rounded-full">
                  <span className="text-sm font-semibold text-blue-700">Your Dashboard</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.name || 'Student'}</span>! 👋
                </h2>
                <p className="text-gray-600 text-lg">
                  Track your achievements and progress at TKIET Warananagar
                </p>
              </div>
              <button 
                onClick={() => navigate('/activities/create')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FiPlus className="w-5 h-5" />
                Share Achievement
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div 
          data-animate
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-100 ${isVisible['dashboard-stats'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          id="dashboard-stats"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <FiAward className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Total Achievements</p>
            <p className="text-4xl font-bold text-gray-900">{stats.total_activities}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <FiCheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Approved</p>
            <p className="text-4xl font-bold text-gray-900">{stats.accepted_activities}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                <FiClock className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Pending Review</p>
            <p className="text-4xl font-bold text-gray-900">{stats.pending_activities}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <FiTrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Rejected</p>
            <p className="text-4xl font-bold text-gray-900">{stats.rejected_activities}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Activity Distribution Chart */}
          <div 
            data-animate
            className={`lg:col-span-2 bg-white rounded-2xl p-6 lg:p-8 shadow-lg border-2 border-gray-100 transition-all duration-1000 delay-200 ${isVisible['dashboard-chart'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            id="dashboard-chart"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Achievement Distribution</h3>
                <p className="text-sm text-gray-600">By category</p>
              </div>
            </div>
            {stats.activity_types.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.activity_types}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="type" 
                      stroke="#6b7280" 
                      style={{ fontSize: '12px', fontWeight: '600' }}
                      tick={{ fill: '#6b7280' }}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      style={{ fontSize: '12px', fontWeight: '600' }}
                      tick={{ fill: '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        padding: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#6366F1" 
                      radius={[12, 12, 0, 0]}
                      stroke="#4F46E5"
                      strokeWidth={2}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <FiActivity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No activities yet</p>
                  <p className="text-sm text-gray-400 mt-2">Start sharing your achievements!</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions & Progress */}
          <div 
            data-animate
            className={`space-y-6 transition-all duration-1000 delay-300 ${isVisible['dashboard-actions'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            id="dashboard-actions"
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/activities/create')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all group border-2 border-blue-100 hover:border-blue-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <FiPlus className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900 text-sm">New Achievement</p>
                    <p className="text-xs text-gray-600">Share your accomplishment</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button 
                  onClick={() => navigate('/reports')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all group border-2 border-purple-100 hover:border-purple-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                    <FiFileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900 text-sm">Generate Report</p>
                    <p className="text-xs text-gray-600">Download your summary</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button 
                  onClick={() => navigate('/activities')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all group border-2 border-green-100 hover:border-green-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <FiActivity className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900 text-sm">View All Activities</p>
                    <p className="text-xs text-gray-600">Manage submissions</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {/* Year Progress */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-5 h-5" />
                  <p className="text-sm font-semibold opacity-90">Year Progress</p>
                </div>
                <p className="text-2xl font-bold">{yearProgress}%</p>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 mb-3 overflow-hidden">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-500 shadow-lg" 
                  style={{ width: `${yearProgress}%` }}
                ></div>
              </div>
              <p className="text-xs opacity-90">
                {monthsCompleted} month{monthsCompleted !== 1 ? 's' : ''} completed • {monthsRemaining} month{monthsRemaining !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div 
          data-animate
          className={`bg-white rounded-2xl p-6 lg:p-8 shadow-lg border-2 border-gray-100 transition-all duration-1000 delay-400 ${isVisible['dashboard-recent'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          id="dashboard-recent"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <FiAward className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-0.5">Recent Achievements</h3>
                <p className="text-sm text-gray-500">Your latest submissions and accomplishments</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/activities')}
              className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2 border border-blue-200 hover:border-blue-300"
            >
              View All
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  onClick={() => navigate(`/activities/${activity.id}`)}
                  className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Gradient Accent Bar */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ 
                      background: `linear-gradient(90deg, ${getActivityTypeColor(activity.type)}, ${getActivityTypeColor(activity.type)}80)`
                    }}
                  />
                  
                  {/* Card Content */}
                  <div className="flex items-start gap-4">
                    {/* Icon Container */}
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300" 
                      style={{ 
                        background: `linear-gradient(135deg, ${getActivityTypeColor(activity.type)}20, ${getActivityTypeColor(activity.type)}10)`,
                        border: `2px solid ${getActivityTypeColor(activity.type)}30`
                      }}
                    >
                      <FiAward 
                        className="w-8 h-8" 
                        style={{ color: getActivityTypeColor(activity.type) }} 
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base leading-tight line-clamp-2">
                          {activity.title}
                        </h4>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/activities/${activity.id}`);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex-shrink-0"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {activity.description}
                      </p>
                      
                      {/* Badges Row */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm" 
                          style={{ 
                            backgroundColor: `${getActivityTypeColor(activity.type)}15`,
                            color: getActivityTypeColor(activity.type),
                            border: `1px solid ${getActivityTypeColor(activity.type)}30`
                          }}
                        >
                          {activity.type?.charAt(0).toUpperCase() + activity.type?.slice(1)}
                        </span>
                        
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${getStatusColor(activity.status)}`}>
                          {getStatusIcon(activity.status)}
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </span>
                      </div>
                      
                      {/* Date */}
                      <div className="flex items-center text-xs text-gray-500 font-medium">
                        <FiCalendar className="w-3.5 h-3.5 mr-1.5" />
                        <span>
                          {new Date(activity.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/30 rounded-2xl transition-all duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAward className="w-10 h-10 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">No achievements yet</h4>
              <p className="text-gray-600 mb-6">Start showcasing your accomplishments!</p>
              <button
                onClick={() => navigate('/activities/create')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <FiPlus className="w-5 h-5" />
                Share Your First Achievement
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div 
          data-animate
          className={`bg-white rounded-2xl p-6 lg:p-8 shadow-lg border-2 border-gray-100 transition-all duration-1000 delay-500 ${isVisible['dashboard-events'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          id="dashboard-events"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <FiCalendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-0.5">Upcoming Events</h3>
                <p className="text-sm text-gray-500">Discover and enroll in exciting events</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/events')}
              className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all flex items-center gap-2 border border-indigo-200 hover:border-indigo-300"
            >
              View All
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>

          {eventsLoading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => navigate('/events')}
                  className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Gradient Accent Bar */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ 
                      background: `linear-gradient(90deg, ${getEventTypeColor(event.type)}, ${getEventTypeColor(event.type)}80)`
                    }}
                  />
                  
                  {/* Card Content */}
                  <div className="flex items-start gap-4">
                    {/* Icon Container */}
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300" 
                      style={{ 
                        background: `linear-gradient(135deg, ${getEventTypeColor(event.type)}20, ${getEventTypeColor(event.type)}10)`,
                        border: `2px solid ${getEventTypeColor(event.type)}30`
                      }}
                    >
                      <FiCalendar 
                        className="w-8 h-8" 
                        style={{ color: getEventTypeColor(event.type) }} 
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-base leading-tight line-clamp-2">
                          {event.title}
                        </h4>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/events');
                          }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex-shrink-0"
                        >
                          <FiArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                      
                      {/* Event Details */}
                      <div className="space-y-2 mb-3">
                        {event.activity_date && (
                          <div className="flex items-center text-xs text-gray-600">
                            <FiClock className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                            <span className="font-medium">{formatEventDate(event.activity_date)}</span>
                          </div>
                        )}
                        
                        {event.venue && (
                          <div className="flex items-center text-xs text-gray-600">
                            <FiMapPin className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                            <span className="font-medium">{event.venue}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Badges Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm" 
                          style={{ 
                            backgroundColor: `${getEventTypeColor(event.type)}15`,
                            color: getEventTypeColor(event.type),
                            border: `1px solid ${getEventTypeColor(event.type)}30`
                          }}
                        >
                          {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
                        </span>
                        
                        {event.department && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            <FiTag className="w-3 h-3" />
                            {event.department}
                          </span>
                        )}
                        
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <FiUsers className="w-3 h-3" />
                          {event.attendees_count || 0} enrolled
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/30 rounded-2xl transition-all duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="w-10 h-10 text-indigo-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">No upcoming events</h4>
              <p className="text-gray-600 mb-6">Check back later for exciting events!</p>
              <button
                onClick={() => navigate('/events')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <FiCalendar className="w-5 h-5" />
                Browse All Events
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StudentDashboard;
