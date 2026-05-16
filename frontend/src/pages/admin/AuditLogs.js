import React, { useEffect, useState, useMemo } from 'react';
import { FiClock, FiUser, FiActivity, FiFilter, FiRefreshCw, FiCheckCircle, FiXCircle, FiAlertCircle, FiShield } from 'react-icons/fi';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import Badge from '../../components/admin/Badge';
import Pagination from '../../components/admin/Pagination';
import LoadingScreen from '../../components/admin/LoadingScreen';
import ExportButton from '../../components/admin/ExportButton';

const AuditLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ action: '', user: '', dateFrom: '', dateTo: '' });
  const [isVisible, setIsVisible] = useState({});
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, today: 0 });

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

  const params = useMemo(() => ({ skip: (page - 1) * 20, limit: 20 }), [page]);

  const load = async () => {
    try {
      setLoading(true);
      // Try to call the audit logs API endpoint if it exists
      // For now, using mock data since the endpoint might not be fully implemented
      try {
        // Uncomment when backend endpoint is ready:
        // const response = await adminService.getAuditLogs(params);
        // setLogs(response.logs || []);
        // setTotal(response.total || 0);
        
        // Mock data for demonstration
        const mockLogs = [
          {
            id: '1',
            action: 'APPROVE_ACTIVITY',
            description: 'Approved activity "Annual Sports Day 2024"',
            user: 'Admin User',
            timestamp: new Date().toISOString(),
            ip_address: '192.168.1.1',
            status: 'success'
          },
          {
            id: '2',
            action: 'USER_STATUS_CHANGE',
            description: 'Deactivated user account john.doe@example.com',
            user: 'Admin User',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            ip_address: '192.168.1.1',
            status: 'success'
          },
          {
            id: '3',
            action: 'REJECT_ACTIVITY',
            description: 'Rejected activity "Tech Workshop" due to insufficient documentation',
            user: 'Faculty Admin',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            ip_address: '192.168.1.2',
            status: 'success'
          },
          {
            id: '4',
            action: 'CREATE_ACTIVITY',
            description: 'Created new activity "Computer Science Seminar 2024"',
            user: 'Admin User',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            ip_address: '192.168.1.1',
            status: 'success'
          },
          {
            id: '5',
            action: 'BULK_APPROVE',
            description: 'Bulk approved 15 activities',
            user: 'Super Admin',
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            ip_address: '192.168.1.3',
            status: 'success'
          }
        ];
        setLogs(mockLogs);
        setTotal(mockLogs.length);
        
        // Calculate stats
        const successCount = mockLogs.filter(l => l.status === 'success').length;
        const failedCount = mockLogs.filter(l => l.status === 'failed').length;
        const today = mockLogs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length;
        setStats({ total: mockLogs.length, success: successCount, failed: failedCount, today });
      } catch (apiError) {
        console.error('API error, using mock data:', apiError);
        // Fallback to empty state if API fails
        setLogs([]);
        setTotal(0);
        setStats({ total: 0, success: 0, failed: 0, today: 0 });
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
      toast.error('Failed to load audit logs');
      setLogs([]);
      setTotal(0);
      setStats({ total: 0, success: 0, failed: 0, today: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const getActionBadgeVariant = (action) => {
    if (action.includes('APPROVE')) return 'success';
    if (action.includes('REJECT') || action.includes('DELETE')) return 'danger';
    if (action.includes('CREATE')) return 'info';
    return 'gray';
  };

  const getActionIcon = (action) => {
    if (action.includes('APPROVE')) return <FiCheckCircle className="h-5 w-5 text-green-500" />;
    if (action.includes('REJECT') || action.includes('DELETE')) return <FiXCircle className="h-5 w-5 text-red-500" />;
    if (action.includes('CREATE')) return <FiAlertCircle className="h-5 w-5 text-blue-500" />;
    return <FiActivity className="h-5 w-5 text-gray-500" />;
  };

  const exportHeaders = ['Action', 'Description', 'User', 'Timestamp', 'IP Address', 'Status'];
  const exportData = logs.map(log => ({
    action: log.action,
    description: log.description,
    user: log.user,
    timestamp: new Date(log.timestamp).toLocaleString(),
    ip_address: log.ip_address,
    status: log.status
  }));

  if (loading && logs.length === 0) {
    return <LoadingScreen message="Loading audit logs..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div 
        data-animate
        id="audit-hero"
        className={`relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-3xl shadow-2xl p-8 transition-all duration-1000 ${isVisible['audit-hero'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                  Admin • Audit Logs
                </span>
                <span className="px-3 py-1 bg-rose-500/20 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center">
                  <FiShield className="mr-1.5 h-3 w-3" />
                  Security Trail
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Audit Logs</h1>
              <p className="text-pink-100 text-lg">Complete history of admin actions and system events</p>
            </div>
            <div className="flex items-center gap-3">
              <ExportButton data={exportData} filename="audit-logs" headers={exportHeaders} />
              <button 
                onClick={load} 
                className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                aria-label="Refresh logs"
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
        id="audit-stats"
        className={`grid grid-cols-1 md:grid-cols-4 gap-6 transition-all duration-1000 delay-100 ${isVisible['audit-stats'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiActivity className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.total}</span>
            </div>
            <h3 className="text-white font-semibold">Total Logs</h3>
            <p className="text-purple-100 text-sm mt-1">All recorded actions</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiCheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.success}</span>
            </div>
            <h3 className="text-white font-semibold">Successful</h3>
            <p className="text-green-100 text-sm mt-1">Completed actions</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiXCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.failed}</span>
            </div>
            <h3 className="text-white font-semibold">Failed</h3>
            <p className="text-red-100 text-sm mt-1">Error actions</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiClock className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.today}</span>
            </div>
            <h3 className="text-white font-semibold">Today</h3>
            <p className="text-blue-100 text-sm mt-1">Recent activity</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div 
        data-animate
        id="audit-filters"
        className={`relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-1000 delay-200 ${isVisible['audit-filters'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiFilter className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Filter Logs</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="">All Actions</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="create">Create</option>
                <option value="delete">Delete</option>
                <option value="update">Update</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
              <input
                type="text"
                value={filters.user}
                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                placeholder="Filter by user..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div 
        data-animate
        id="audit-timeline"
        className={`transition-all duration-1000 delay-300 ${isVisible['audit-timeline'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
              <FiClock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Activity Timeline</h3>
              <p className="text-sm text-gray-500">Chronological view of all actions</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-sm text-gray-500 font-medium">Loading audit logs...</p>
              </div>
            </div>
          ) : logs.length > 0 ? (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200"></div>
              
              {/* Timeline Items */}
              <div className="space-y-6">
                {logs.map((log, index) => (
                  <div key={log.id} className="relative pl-20">
                    {/* Timeline Dot */}
                    <div className="absolute left-5 top-2 w-6 h-6 rounded-full bg-white border-4 border-purple-500 shadow-lg flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
                    </div>
                    
                    {/* Log Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg group-hover:scale-110 transition-transform">
                            {getActionIcon(log.action)}
                          </div>
                          <div>
                            <Badge variant={getActionBadgeVariant(log.action)} className="mb-2">
                              {log.action.replace(/_/g, ' ')}
                            </Badge>
                            <p className="text-sm font-medium text-gray-900">{log.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FiUser className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">{log.user}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FiClock className="h-4 w-4 text-purple-500" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FiShield className="h-4 w-4 text-purple-500" />
                          <span className="font-mono">{log.ip_address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-6">
                <FiActivity className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No audit logs found</h3>
              <p className="text-sm text-gray-500 mb-8">Audit logs will appear here once actions are performed</p>
            </div>
          )}

          {total > 20 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <Pagination page={page} total={total} pageSize={20} onChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
