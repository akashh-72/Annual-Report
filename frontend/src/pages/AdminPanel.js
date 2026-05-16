import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiUsers, FiActivity, FiBarChart2, FiFileText, FiSettings, 
  FiMenu, FiX, FiCheck, FiClock, FiTrendingUp, FiSearch, FiEye 
} from 'react-icons/fi';
import authService, { api } from '../services/authService';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activityFilters, setActivityFilters] = useState({ 
    status: '', department: '', type: '', year: '' 
  });
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);
  const [users, setUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({ 
    role: '', department: '', search: '' 
  });
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    loadDashboardData();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (activeSection === 'activities') loadActivities();
    if (activeSection === 'users') loadUsers();
  }, [activeSection, activityFilters, userFilters, activityPage, userPage]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/api/v1/admin/stats'),
        api.get('/api/v1/admin/analytics')
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load dashboard');
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await api.get('/api/v1/admin/departments');
      setDepartments(res.data.departments || []);
    } catch (error) {
      console.error('Failed to load departments');
    }
  };

  const loadActivities = async () => {
    try {
      setLoading(true);
      const skip = (activityPage - 1) * 20;
      const res = await api.get('/api/v1/admin/all-activities', {
        params: { skip, limit: 20, ...activityFilters }
      });
      setActivities(res.data.activities || []);
      setActivityTotal(res.data.total || 0);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load activities');
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const skip = (userPage - 1) * 20;
      const res = await api.get('/api/v1/admin/users/all', {
        params: { skip, limit: 20, ...userFilters }
      });
      setUsers(res.data.users || []);
      setUserTotal(res.data.total || 0);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/api/v1/admin/approve/${id}`);
      toast.success('Activity approved');
      loadActivities();
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this activity?')) return;
    try {
      await api.post(`/api/v1/admin/activities/${id}/reject`);
      toast.success('Activity rejected');
      loadActivities();
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reject');
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await api.post(`/api/v1/admin/users/${userId}/toggle-status`);
      toast.success('User status updated');
      loadUsers();
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiBarChart2 },
    { id: 'activities', label: 'Activities', icon: FiActivity },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'analytics', label: 'Analytics', icon: FiTrendingUp },
    { id: 'reports', label: 'Reports', icon: FiFileText },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center px-6 h-16">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-gray-100">
            <FiMenu className="h-5 w-5" />
          </button>
          <div className="flex-1 flex justify-between items-center px-6">
            <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user?.name?.[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <aside className={`bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 z-30 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}>
          <nav className="p-4 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-6">
            {activeSection === 'dashboard' && (
              <DashboardView 
                stats={stats} 
                analytics={analytics} 
                onRefresh={loadDashboardData} 
              />
            )}
            
            {activeSection === 'activities' && (
              <ActivitiesView 
                activities={activities}
                filters={activityFilters}
                setFilters={setActivityFilters}
                onApprove={handleApprove}
                onReject={handleReject}
                onView={setSelectedActivity}
                departments={departments}
                page={activityPage}
                setPage={setActivityPage}
                total={activityTotal}
                loading={loading}
              />
            )}
            
            {activeSection === 'users' && (
              <UsersView 
                users={users}
                filters={userFilters}
                setFilters={setUserFilters}
                onToggleStatus={toggleUserStatus}
                departments={departments}
                page={userPage}
                setPage={setUserPage}
                total={userTotal}
                loading={loading}
              />
            )}
            
            {activeSection === 'analytics' && <AnalyticsSection analytics={analytics} />}
            {activeSection === 'reports' && <ReportsSection />}
            {activeSection === 'settings' && <SettingsSection />}
          </div>
        </main>
      </div>

      {selectedActivity && (
        <ActivityModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
      )}
    </div>
  );
};

const DashboardView = ({ stats, analytics, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">System statistics and insights</p>
        </div>
        <button 
          onClick={onRefresh} 
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
        >
          <FiBarChart2 className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Activities" value={stats?.total_activities || 0} icon={FiActivity} color="blue" />
        <StatCard title="Accepted" value={stats?.accepted_activities || 0} icon={FiCheck} color="green" />
        <StatCard title="Pending" value={stats?.pending_activities || 0} icon={FiClock} color="yellow" />
        <StatCard title="Rejected" value={stats?.rejected_activities || 0} icon={FiX} color="red" />
      </div>

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold text-gray-900">{analytics.total_users}</span>
              </div>
              {analytics.users_by_role && Object.entries(analytics.users_by_role).map(([role, count]) => (
                <div key={role} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{role}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Types</h3>
            <div className="space-y-3">
              {analytics.type_distribution && analytics.type_distribution.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                    <span className="text-sm font-semibold">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(item.count / (stats?.total_activities || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = { 
    blue: 'bg-blue-500', 
    green: 'bg-green-500', 
    yellow: 'bg-yellow-500', 
    red: 'bg-red-500' 
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colors[color]} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const ActivitiesView = ({ 
  activities, filters, setFilters, onApprove, onReject, onView, 
  departments, page, setPage, total, loading 
}) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Activity Management</h2>
        <p className="text-gray-600 mt-1">Review and manage all activities</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select 
              value={filters.department} 
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select 
              value={filters.type} 
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="social">Social</option>
              <option value="sports">Sports</option>
              <option value="academic">Academic</option>
              <option value="cultural">Cultural</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <input 
              type="number" 
              value={filters.year} 
              onChange={(e) => handleFilterChange('year', e.target.value)}
              placeholder="2023..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activities.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity.id || activity._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{activity.user_name || activity.user_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          activity.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {activity.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => onView(activity)} 
                          className="text-blue-600 hover:text-blue-900"
                          title="View details"
                        >
                          <FiEye className="h-5 w-5" />
                        </button>
                        {activity.status !== 'accepted' && (
                          <button 
                            onClick={() => onApprove(activity.id || activity._id)} 
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <FiCheck className="h-5 w-5" />
                          </button>
                        )}
                        {activity.status !== 'rejected' && (
                          <button 
                            onClick={() => onReject(activity.id || activity._id)} 
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {total > 20 && (
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">Page {page} of {Math.ceil(total / 20)}</span>
                <div className="space-x-2">
                  <button 
                    onClick={() => setPage(page - 1)} 
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setPage(page + 1)} 
                    disabled={page >= Math.ceil(total / 20)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FiActivity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

const UsersView = ({ users, filters, setFilters, onToggleStatus, departments, page, setPage, total, loading }) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input 
                type="text" 
                value={filters.search} 
                onChange={(e) => handleFilterChange('search', e.target.value)} 
                placeholder="Search users..."
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select 
              value={filters.role} 
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select 
              value={filters.department} 
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {users.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activities</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.activity_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => onToggleStatus(user.id)}
                          className={`px-3 py-1 rounded-md text-sm ${
                            user.is_active 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {total > 20 && (
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">Page {page} of {Math.ceil(total / 20)}</span>
                <div className="space-x-2">
                  <button 
                    onClick={() => setPage(page - 1)} 
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setPage(page + 1)} 
                    disabled={page >= Math.ceil(total / 20)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsSection = ({ analytics }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
      <p className="text-gray-600 mt-1">Detailed system analytics</p>
    </div>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-500">Analytics charts and visualizations will be displayed here</p>
    </div>
  </div>
);

const ReportsSection = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
      <p className="text-gray-600 mt-1">Generate and manage reports</p>
    </div>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-500">Report generation tools will be displayed here</p>
    </div>
  </div>
);

const SettingsSection = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      <p className="text-gray-600 mt-1">System configuration</p>
    </div>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-500">System settings will be displayed here</p>
    </div>
  </div>
);

const ActivityModal = ({ activity, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
    <div 
      className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" 
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{activity.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <strong className="text-gray-700">Description:</strong>
            <p className="text-gray-600 mt-1">{activity.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><strong>Type:</strong> <span className="text-gray-600">{activity.type}</span></div>
            <div><strong>Department:</strong> <span className="text-gray-600">{activity.department}</span></div>
            <div><strong>Year:</strong> <span className="text-gray-600">{activity.year}</span></div>
            <div><strong>Status:</strong> <span className="text-gray-600 capitalize">{activity.status}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AdminPanel;
