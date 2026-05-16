import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiActivity, FiUsers, FiFileText, FiTrendingUp, FiPlus, FiEye } from 'react-icons/fi';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsResponse = await axios.get('/api/v1/reports/stats');
      setStats(statsResponse.data);

      // Load recent activities
      const activitiesResponse = await axios.get('/api/v1/activities?page=1&size=5');
      setRecentActivities(activitiesResponse.data.activities || []);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      social: '#3B82F6',
      sports: '#10B981',
      academic: '#8B5CF6',
      cultural: '#EC4899',
      technical: '#6366F1'
    };
    return colors[type] || '#6B7280';
  };

  // const getStatusColor = (status) => {
  //   const colors = {
  //     pending: '#F59E0B',
  //     accepted: '#10B981',
  //     rejected: '#EF4444'
  //   };
  //   return colors[status] || '#6B7280';
  // };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your activities and reports.
        </p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiActivity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Activities</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_activities}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiTrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Accepted</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.accepted_activities}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiUsers className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_users}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiFileText className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Departments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.departments?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Types Chart */}
        {stats?.activity_types && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Types</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.activity_types}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.activity_types.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getActivityTypeColor(entry.type)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Department Stats Chart */}
        {stats?.departments && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Department Activities</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.departments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activities */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
          <Link
            to="/activities"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View all
          </Link>
        </div>

        <div className="card">
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`type-badge type-${activity.type}`}>
                        {activity.type}
                      </span>
                      <span className={`status-badge status-${activity.status}`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/activities/${activity.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <FiEye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiActivity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first activity.
              </p>
              <div className="mt-6">
                <Link
                  to="/activities/create"
                  className="btn-primary inline-flex items-center"
                >
                  <FiPlus className="h-4 w-4 mr-2" />
                  Create Activity
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/activities/create"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <FiPlus className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Create Activity</h4>
                <p className="text-sm text-gray-500">Submit a new activity</p>
              </div>
            </div>
          </Link>

          <Link
            to="/activities"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <FiActivity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">View Activities</h4>
                <p className="text-sm text-gray-500">Manage your activities</p>
              </div>
            </div>
          </Link>

          <Link
            to="/reports"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <FiFileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Generate Reports</h4>
                <p className="text-sm text-gray-500">Create and download reports</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
