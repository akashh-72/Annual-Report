import React, { useEffect, useState, useMemo } from 'react';
import { FiBell, FiCheck, FiTrash2, FiMail, FiAlertCircle, FiRefreshCw, FiCheckCircle, FiInbox, FiPlus, FiEdit, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Badge from '../../components/admin/Badge';
import Pagination from '../../components/admin/Pagination';
import LoadingScreen from '../../components/admin/LoadingScreen';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Modal from '../../components/admin/Modal';
import adminService from '../../services/adminService';

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedNotifs, setSelectedNotifs] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [viewingNotif, setViewingNotif] = useState(null);
  const [filters, setFilters] = useState({ type: '', read: '' });
  const [isVisible, setIsVisible] = useState({});
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNotif, setEditingNotif] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    user_id: '',
    target_all_users: false
  });

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

  const params = useMemo(() => {
    const p = { skip: (page - 1) * 20, limit: 20 };
    if (filters.type) p.type = filters.type;
    if (filters.read === 'read') p.read = true;
    if (filters.read === 'unread') p.read = false;
    return p;
  }, [page, filters]);

  const load = async () => {
    try {
      setLoading(true);
      const [notifsData, statsData, usersData] = await Promise.all([
        adminService.getNotifications(params).catch((e) => {
          console.error('Error loading notifications:', e);
          return { notifications: [], total: 0 };
        }),
        adminService.getNotificationStats().catch((e) => {
          console.error('Error loading stats:', e);
          return { total: 0, unread: 0, read: 0 };
        }),
        adminService.listUsers({ skip: 0, limit: 100 }).catch(() => ({ users: [] }))
      ]);
      
      const notificationsList = notifsData.notifications || [];
      setNotifications(notificationsList);
      setTotal(notifsData.total || 0);
      
      // Use the list total as source of truth since that's what's actually displayed
      // This ensures stats match what users see
      const total = notifsData.total || 0;
      const listUnread = notificationsList.filter(n => !n.read).length;
      const listRead = notificationsList.filter(n => n.read).length;
      
      // Use list-based stats to ensure consistency with displayed data
      // The backend total count should match what's returned
      const unread = total > 0 ? listUnread : 0;
      const read = total > 0 ? listRead : 0;
      
      setStats({ total, unread, read });
      
      // Set users for dropdown
      setUsers(usersData.users || []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
      toast.error('Failed to load notifications');
      setNotifications([]);
      setTotal(0);
      setStats({ total: 0, unread: 0, read: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [params]);

  // Load users when create modal opens
  useEffect(() => {
    if (showCreateModal && users.length === 0) {
      adminService.listUsers({ skip: 0, limit: 100 })
        .then(data => setUsers(data.users || []))
        .catch(e => console.error('Failed to load users:', e));
    }
  }, [showCreateModal]);

  const handleMarkAsRead = async (ids) => {
    try {
      await adminService.markNotificationsRead(ids);
      toast.success('Marked as read');
      setNotifications(notifications.map(n => 
        ids.includes(n.id) ? { ...n, read: true } : n
      ));
      setSelectedNotifs([]);
      load(); // Reload to update stats
    } catch (e) {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (ids) => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Delete Notifications',
      message: `Are you sure you want to delete ${ids.length} notification(s)?`,
      onConfirm: async () => {
        try {
          await adminService.bulkDeleteNotifications(ids);
          toast.success('Notifications deleted');
          setNotifications(notifications.filter(n => !ids.includes(n.id)));
          setSelectedNotifs([]);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          load(); // Reload to update stats
        } catch (e) {
          toast.error('Failed to delete notifications');
        }
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) {
        toast.info('All notifications are already read');
        return;
      }
      await adminService.markNotificationsRead(unreadIds);
      toast.success('All notifications marked as read');
      load();
    } catch (e) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleCreateNotification = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await adminService.createNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        user_id: formData.target_all_users ? null : formData.user_id || null,
        target_all_users: formData.target_all_users
      });
      toast.success('Notification created successfully');
      setShowCreateModal(false);
      setFormData({
        title: '',
        message: '',
        type: 'info',
        user_id: '',
        target_all_users: false
      });
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create notification');
    }
  };

  const handleEditNotification = (notif) => {
    setEditingNotif(notif);
    setFormData({
      title: notif.title,
      message: notif.message,
      type: notif.type,
      user_id: notif.user_id || '',
      target_all_users: false
    });
    setShowEditModal(true);
  };

  const handleUpdateNotification = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await adminService.updateNotification(editingNotif.id, {
        title: formData.title,
        message: formData.message,
        type: formData.type
      });
      toast.success('Notification updated successfully');
      setShowEditModal(false);
      setEditingNotif(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to update notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'activity': return FiBell;
      case 'approval': return FiCheck;
      case 'user': return FiMail;
      case 'system': return FiAlertCircle;
      default: return FiBell;
    }
  };

  const getNotificationGradient = (type) => {
    switch (type) {
      case 'activity': return 'from-blue-500 to-indigo-600';
      case 'approval': return 'from-emerald-500 to-green-600';
      case 'user': return 'from-purple-500 to-pink-600';
      case 'system': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getUserName = (userId) => {
    if (!userId) return 'All Users';
    const user = users.find(u => u.id === userId);
    return user ? user.name : userId;
  };

  if (loading && notifications.length === 0) {
    return <LoadingScreen message="Loading notifications..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div 
        data-animate
        id="notifications-hero"
        className={`relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-3xl shadow-2xl p-8 transition-all duration-1000 ${isVisible['notifications-hero'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                  Admin • Notifications
                </span>
                <span className="px-3 py-1 bg-violet-500/20 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center">
                  <FiBell className="mr-1.5 h-3 w-3" />
                  {stats.unread} New
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-purple-100 text-lg">Manage system notifications and alerts</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <FiPlus className="h-5 w-5" />
                <span>Create</span>
              </button>
              <button 
                onClick={handleMarkAllAsRead}
                className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <FiCheckCircle className="h-5 w-5" />
                <span>Mark All Read</span>
              </button>
              <button 
                onClick={load} 
                className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                aria-label="Refresh notifications"
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
        id="notif-stats"
        className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 delay-100 ${isVisible['notif-stats'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiInbox className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.total}</span>
            </div>
            <h3 className="text-white font-semibold">Total Notifications</h3>
            <p className="text-purple-100 text-sm mt-1">All messages</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiBell className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.unread}</span>
            </div>
            <h3 className="text-white font-semibold">Unread</h3>
            <p className="text-orange-100 text-sm mt-1">Needs attention</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiCheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.read}</span>
            </div>
            <h3 className="text-white font-semibold">Read</h3>
            <p className="text-green-100 text-sm mt-1">Completed</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div 
        data-animate
        id="notif-filters"
        className={`relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-1000 delay-200 ${isVisible['notif-filters'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="">All Types</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="activity_approved">Activity Approved</option>
                <option value="activity_rejected">Activity Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.read}
                onChange={(e) => setFilters({ ...filters, read: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifs.length > 0 && (
        <div 
          data-animate
          className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-5 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <FiBell className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-semibold text-purple-900">
                {selectedNotifs.length} notification(s) selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleMarkAsRead(selectedNotifs)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <FiCheck className="h-4 w-4" />
                <span>Mark Read</span>
              </button>
              <button
                onClick={() => handleDelete(selectedNotifs)}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <FiTrash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedNotifs([])}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div 
        data-animate
        id="notif-list"
        className={`transition-all duration-1000 delay-300 ${isVisible['notif-list'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-sm text-gray-500 font-medium">Loading notifications...</p>
              </div>
            </div>
          ) : notifications.length > 0 ? (
            <>
              <div className="divide-y divide-gray-200">
                {notifications.map((notif) => {
                  const Icon = getNotificationIcon(notif.type);
                  return (
                    <div
                      key={notif.id}
                      className={`p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 cursor-pointer group ${!notif.read ? 'bg-blue-50/30 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                      onClick={() => setViewingNotif(notif)}
                    >
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedNotifs.includes(notif.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (selectedNotifs.includes(notif.id)) {
                              setSelectedNotifs(selectedNotifs.filter(id => id !== notif.id));
                            } else {
                              setSelectedNotifs([...selectedNotifs, notif.id]);
                            }
                          }}
                          className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-5 w-5"
                        />
                        <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${getNotificationGradient(notif.type)} shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className={`text-base font-bold ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                              {notif.title}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleString()}</span>
                              {!notif.read && (
                                <span className="inline-block w-3 h-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full animate-pulse shadow-lg"></span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{notif.message}</p>
                          <div className="flex items-center space-x-3">
                            <Badge variant="info" className="capitalize">{notif.type}</Badge>
                            <span className="text-xs text-gray-500 flex items-center">
                              <FiMail className="h-3 w-3 mr-1" />
                              To: {getUserName(notif.user_id)}
                            </span>
                            {notif.created_by_admin && (
                              <Badge variant="warning">Admin Created</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEditNotification(notif)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                            title="Edit notification"
                          >
                            <FiEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete([notif.id])}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                            title="Delete notification"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {total > 20 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <Pagination page={page} total={total} pageSize={20} onChange={setPage} />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-6">
                <FiBell className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3>
              <p className="text-sm text-gray-500 mb-8">Create your first notification to get started</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 space-x-2"
              >
                <FiPlus className="h-5 w-5" />
                <span>Create Notification</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <Modal title="Create New Notification" onClose={() => setShowCreateModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., System Maintenance Notice"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter notification message..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="activity_approved">Activity Approved</option>
                <option value="activity_rejected">Activity Rejected</option>
              </select>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl">
              <input
                type="checkbox"
                id="target_all"
                checked={formData.target_all_users}
                onChange={(e) => setFormData({ ...formData, target_all_users: e.target.checked, user_id: '' })}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="target_all" className="text-sm font-medium text-gray-700 cursor-pointer">
                Send to all users (broadcast)
              </label>
            </div>

            {!formData.target_all_users && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target User</label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                >
                  <option value="">Select a user (optional)</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ title: '', message: '', type: 'info', user_id: '', target_all_users: false });
                }}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNotification}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Create Notification
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Notification Modal */}
      {showEditModal && editingNotif && (
        <Modal title="Edit Notification" onClose={() => {
          setShowEditModal(false);
          setEditingNotif(null);
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="activity_approved">Activity Approved</option>
                <option value="activity_rejected">Activity Rejected</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingNotif(null);
                }}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateNotification}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Update Notification
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Notification Detail Modal */}
      {viewingNotif && (
        <Modal title={viewingNotif.title} onClose={() => setViewingNotif(null)}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge variant="info" className="capitalize">{viewingNotif.type}</Badge>
              <Badge variant={viewingNotif.read ? 'gray' : 'success'}>
                {viewingNotif.read ? 'Read' : 'Unread'}
              </Badge>
              {viewingNotif.created_by_admin && (
                <Badge variant="warning">Admin Created</Badge>
              )}
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Message</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{viewingNotif.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-500 mb-1">To</h4>
                <p className="text-sm font-semibold text-gray-900">{getUserName(viewingNotif.user_id)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-500 mb-1">Date</h4>
                <p className="text-sm font-semibold text-gray-900">{new Date(viewingNotif.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  handleEditNotification(viewingNotif);
                  setViewingNotif(null);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
              >
                Edit
              </button>
              {!viewingNotif.read && (
                <button
                  onClick={() => {
                    handleMarkAsRead([viewingNotif.id]);
                    setViewingNotif(null);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => {
                  handleDelete([viewingNotif.id]);
                  setViewingNotif(null);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  );
};

export default Notifications;
