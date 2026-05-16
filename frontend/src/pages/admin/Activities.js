import React, { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiCheck, FiClock, FiEye, FiSearch, FiX, FiPlus, FiImage, FiFilter, FiDownload, FiRefreshCw, FiAward, FiFileText, FiCheckCircle, FiAlertCircle, FiEdit2, FiUsers, FiUser } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';
import Badge from '../../components/admin/Badge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import ExportButton from '../../components/admin/ExportButton';
import ImageViewer from '../../components/admin/ImageViewer';
import LoadingScreen from '../../components/admin/LoadingScreen';
import { getImageUrls, getImageUrl } from '../../utils/imageUtils';

const Activities = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', department: '', type: '', year: '', search: '' });
  const [selected, setSelected] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null, showComments: false, comments: '' });
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewingImages, setViewingImages] = useState([]);
  const [isVisible, setIsVisible] = useState({});
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [actionActivityId, setActionActivityId] = useState(null);

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

  const params = useMemo(() => ({ skip: (page - 1) * 20, limit: 20, ...filters }), [page, filters]);

  const load = async () => {
    try {
      setLoading(true);
      const [depts, list] = await Promise.all([
        departments.length ? Promise.resolve(departments) : adminService.getDepartments().catch(() => []),
        adminService.listActivities(params).catch(() => ({ activities: [], total: 0 }))
      ]);
      if (depts && depts.length > 0) {
        setDepartments(depts);
      }
      // Filter out admin-created activities (show only student achievements)
      const studentAchievements = (list.activities || []).filter(a => a.is_admin_created !== true);
      setActivities(studentAchievements);
      setTotal(studentAchievements.length);
      
      // Calculate stats
      const pending = studentAchievements.filter(a => a.status === 'pending').length;
      const accepted = studentAchievements.filter(a => a.status === 'accepted').length;
      const rejected = studentAchievements.filter(a => a.status === 'rejected').length;
      setStats({ total: studentAchievements.length, pending, accepted, rejected });
    } catch (e) {
      console.error('Failed to load:', e);
      toast.error('Failed to load achievements');
      setActivities([]);
      setTotal(0);
      setStats({ total: 0, pending: 0, accepted: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, [params]);


  const onFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const approve = async (id, comments = '') => {
    try {
      await adminService.approveActivity(id, comments);
      toast.success('Achievement approved successfully');
      load();
      setSelected(null);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to approve achievement');
    }
  };

  const reject = async (id, comments = '') => {
    try {
      await adminService.rejectActivity(id, comments);
      toast.success('Achievement rejected');
      load();
      setSelected(null);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to reject achievement');
    }
  };

  const handleApproveClick = (id) => {
    setActionType('approve');
    setActionActivityId(id);
    setConfirmDialog({
      isOpen: true,
      type: 'info',
      title: 'Approve Activity',
      message: 'Are you sure you want to approve this activity?',
      confirmText: 'Approve',
      showComments: true,
      comments: ''
    });
  };

  const handleRejectClick = (id) => {
    setActionType('reject');
    setActionActivityId(id);
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Reject Activity',
      message: 'Please provide a reason for rejection (optional but recommended):',
      confirmText: 'Reject',
      showComments: true,
      comments: ''
    });
  };

  const handleBulkApprove = async () => {
    if (selectedActivities.length === 0) {
      toast.error('Please select activities first');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      type: 'info',
      title: 'Bulk Approve',
      message: `Are you sure you want to approve ${selectedActivities.length} achievement(s)?`,
      confirmText: 'Approve All',
      showComments: false,
      onConfirm: async () => {
        try {
          await Promise.all(selectedActivities.map(id => adminService.approveActivity(id)));
          toast.success('Achievements approved successfully');
          setSelectedActivities([]);
          load();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (e) {
          toast.error('Failed to approve some activities');
        }
      }
    });
  };

  const handleBulkReject = async () => {
    if (selectedActivities.length === 0) {
      toast.error('Please select activities first');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Bulk Reject',
      message: `Are you sure you want to reject ${selectedActivities.length} achievement(s)?`,
      confirmText: 'Reject All',
      showComments: false,
      onConfirm: async () => {
        try {
          await Promise.all(selectedActivities.map(id => adminService.rejectActivity(id)));
          toast.success('Achievements rejected successfully');
          setSelectedActivities([]);
          load();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (e) {
          toast.error('Failed to reject some achievements');
        }
      }
    });
  };

  const handleViewImages = (activity) => {
    if (activity.images && activity.images.length > 0) {
      const imageUrls = getImageUrls(activity.images);
      setViewingImages(imageUrls);
      setImageViewerOpen(true);
    } else {
      toast.error('No images available for this activity');
    }
  };

  const handleVerifyImage = async (activityId, imageIndex, verdict) => {
    try {
      await adminService.verifyImage(activityId, imageIndex, verdict);
      toast.success(`Image marked as ${verdict === 'normal' ? 'verified' : 'unverified'}`);
      load();
      // Reload selected activity if it's the same
      if (selected && (selected.id || selected._id) === activityId) {
        const updatedActivity = activities.find(a => (a.id || a._id) === activityId);
        if (updatedActivity) {
          setSelected(updatedActivity);
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to verify image');
    }
  };

  const exportHeaders = ['Title', 'User', 'Status', 'Type', 'Department', 'Year', 'Date'];
  const exportData = activities.map(a => ({
    title: a.title,
    user: a.user_name || 'N/A',
    status: a.status,
    type: a.type,
    department: a.department,
    year: a.year,
    date: new Date(a.created_at).toLocaleDateString()
  }));


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div 
        data-animate
        id="activities-hero"
        className={`relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-3xl shadow-2xl p-8 transition-all duration-1000 ${isVisible['activities-hero'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                  Admin • Achievements
                </span>
                <span className="px-3 py-1 bg-blue-600/30 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center border border-blue-400/30">
                  <FiAward className="mr-1.5 h-3 w-3" />
                  {total} Total
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Achievement Management</h1>
              <p className="text-blue-100 text-lg">Review, approve, and manage all student achievements</p>
            </div>
            <div className="flex items-center gap-3">
              <ExportButton data={exportData} filename="activities" headers={exportHeaders} />
              <button 
                onClick={load} 
                className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                aria-label="Refresh activities"
              >
                <FiRefreshCw className="h-5 w-5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div 
        data-animate
        id="activities-stats"
        className={`grid grid-cols-1 md:grid-cols-4 gap-6 transition-all duration-1000 delay-100 ${isVisible['activities-stats'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiActivity className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.total}</span>
            </div>
            <h3 className="text-white font-semibold">Total Achievements</h3>
            <p className="text-blue-100 text-sm mt-1">All submissions</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiClock className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.pending}</span>
            </div>
            <h3 className="text-white font-semibold">Pending Review</h3>
            <p className="text-orange-100 text-sm mt-1">Needs attention</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.accepted}</span>
            </div>
            <h3 className="text-white font-semibold">Approved</h3>
            <p className="text-green-100 text-sm mt-1">Verified</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiX className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.rejected}</span>
            </div>
            <h3 className="text-white font-semibold">Rejected</h3>
            <p className="text-red-100 text-sm mt-1">Declined</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div 
        data-animate
        id="activities-filters"
        className={`relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-1000 delay-200 ${isVisible['activities-filters'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiFilter className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => onFilter('search', e.target.value)}
                  placeholder="Search by title or user..."
                  className="w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select value={filters.status} onChange={(e) => onFilter('status', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select value={filters.type} onChange={(e) => onFilter('type', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option value="">All Types</option>
                <option value="social">Social</option>
                <option value="sports">Sports</option>
                <option value="academic">Academic</option>
                <option value="cultural">Cultural</option>
                <option value="technical">Technical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select value={filters.department} onChange={(e) => onFilter('department', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input type="number" value={filters.year} onChange={(e) => onFilter('year', e.target.value)} placeholder="e.g., 2024" className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedActivities.length > 0 && (
        <div 
          data-animate
          className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-5 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FiCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-semibold text-blue-900">
                {selectedActivities.length} achievement(s) selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkApprove}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Approve All
              </button>
              <button
                onClick={handleBulkReject}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Reject All
              </button>
              <button
                onClick={() => setSelectedActivities([])}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activities Table */}
      <div 
        data-animate
        id="activities-table"
        className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-1000 delay-300 hover:shadow-xl ${isVisible['activities-table'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        {loading && activities.length === 0 ? (
          <LoadingScreen message="Loading achievements..." />
        ) : activities.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedActivities.length === activities.length && activities.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedActivities(activities.map(a => a.id || a._id));
                          } else {
                            setSelectedActivities([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Achievement Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {activities.map((a) => {
                    const activityId = a.id || a._id;
                    return (
                    <tr key={activityId} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedActivities.includes(activityId)}
                          onChange={() => {
                            if (selectedActivities.includes(activityId)) {
                              setSelectedActivities(selectedActivities.filter(id => id !== activityId));
                            } else {
                              setSelectedActivities([...selectedActivities, activityId]);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{a.title}</div>
                        {a.images && a.images.length > 0 && (
                          <button
                            onClick={() => handleViewImages(a)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1 font-medium"
                          >
                            <FiImage className="h-3 w-3 mr-1" />
                            {a.images.length} image(s)
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{a.user_name || a.user_id}</div>
                        <div className="text-xs text-gray-500">{a.user_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {a.achievement_type === 'group' ? (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600">
                              <FiUsers className="h-3 w-3 mr-1" />
                              Group
                            </span>
                            {a.group_members && a.group_members.length > 0 && (
                              <span className="ml-2 text-xs text-gray-600">
                                ({a.group_members.length + 1} members)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600">
                            <FiUser className="h-3 w-3 mr-1" />
                            Individual
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={a.status === 'accepted' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}>
                          {a.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                          {a.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{a.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(a.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelected(a)} 
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all" 
                            title="View & Manage"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          {a.status !== 'accepted' && !a.is_admin_created && (
                            <button 
                              onClick={() => handleApproveClick(activityId)} 
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all" 
                              title="Approve"
                            >
                              <FiCheck className="h-4 w-4" />
                            </button>
                          )}
                          {a.status !== 'rejected' && !a.is_admin_created && (
                            <button 
                              onClick={() => handleRejectClick(activityId)} 
                              className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all" 
                              title="Reject"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
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
              <FiActivity className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No achievements found</h3>
            <p className="text-sm text-gray-500 mb-8">No student achievements match your filters. Adjust your filters to see more.</p>
          </div>
        )}
      </div>

      {/* Enhanced Activity Details Modal with Image Verification */}
      {selected && (
        <Modal 
          title={
            <div className="flex items-center justify-between w-full">
              <span>{selected.title}</span>
              <Badge variant={selected.status === 'accepted' ? 'success' : selected.status === 'pending' ? 'warning' : 'danger'}>
                {selected.status}
              </Badge>
            </div>
          } 
          onClose={() => setSelected(null)}
          size="xl"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Description */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</h4>
              <p className="text-gray-700 leading-relaxed">{selected.description}</p>
            </div>

            {/* Achievement Type */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
              <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center">
                {selected.achievement_type === 'group' ? (
                  <>
                    <FiUsers className="h-4 w-4 mr-2 text-blue-600" />
                    Group Achievement
                  </>
                ) : (
                  <>
                    <FiUser className="h-4 w-4 mr-2 text-blue-600" />
                    Individual Achievement
                  </>
                )}
              </h4>
              {selected.achievement_type === 'group' && selected.group_members && selected.group_members.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-bold text-gray-600 mb-2">Team Members ({selected.group_members.length + 1} total):</p>
                  <div className="space-y-2">
                      <div className="flex items-center p-2 bg-white rounded-lg border border-blue-100">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 flex-shrink-0">
                        {selected.user_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{selected.user_name || 'Creator'}</p>
                        <p className="text-xs text-gray-600 truncate">{selected.department || 'N/A'} • Creator</p>
                      </div>
                    </div>
                    {selected.group_members.map((memberId, idx) => (
                      <div key={idx} className="flex items-center p-2 bg-white rounded-lg border border-blue-100">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 flex-shrink-0">
                          {memberId.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">Member {idx + 1}</p>
                          <p className="text-xs text-gray-600 truncate">ID: {memberId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</span>
                <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">{selected.type}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Department</span>
                <p className="text-sm font-semibold text-gray-900 mt-1">{selected.department}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Year</span>
                <p className="text-sm font-semibold text-gray-900 mt-1">{selected.year}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Created</span>
                <p className="text-sm font-semibold text-gray-900 mt-1">{new Date(selected.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Images with Verification Controls */}
            {selected.images && selected.images.length > 0 && (
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide flex items-center">
                  <FiImage className="h-4 w-4 mr-2" />
                  Images ({selected.images.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selected.images.map((image, index) => {
                    const imageUrl = getImageUrl(image);
                    const isVerified = image.verdict === 'normal';
                    return (
                      <div key={index} className="relative group border-2 border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Image ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            isVerified 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {isVerified ? '✓ Verified' : '⚠ Unverified'}
                          </span>
                        </div>
                        <div className="p-2 bg-white border-t border-gray-200">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-600 truncate">{image.filename}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleVerifyImage(selected.id || selected._id, index, 'normal')}
                                className={`p-1 rounded ${isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'} transition-all`}
                                title="Mark as Verified"
                              >
                                <FiCheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleVerifyImage(selected.id || selected._id, index, 'abnormal')}
                                className={`p-1 rounded ${!isVerified ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'} transition-all`}
                                title="Mark as Unverified"
                              >
                                <FiAlertCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          {image.score && (
                            <div className="text-xs text-gray-500 mt-1">
                              ML Score: {(image.score * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Certificate */}
            {selected.has_certificate && selected.certificate_path && (
              <div className="border-2 border-yellow-200 rounded-xl p-4 bg-gradient-to-br from-yellow-50 to-amber-50">
                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center">
                  <FiAward className="h-4 w-4 mr-2 text-yellow-600" />
                  Certificate
                  {selected.certificate_validated && (
                    <span className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">
                      ✓ Verified
                    </span>
                  )}
                </h4>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <FiFileText className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Official Certificate</p>
                      <p className="text-xs text-gray-600">Click to view</p>
                    </div>
                  </div>
                  <a
                    href={getImageUrl(selected.certificate_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-yellow-600 text-white text-sm font-bold rounded-lg hover:bg-yellow-700 transition-all"
                  >
                    <FiDownload className="h-4 w-4 inline mr-1" />
                    View
                  </a>
                </div>
                <img
                  src={getImageUrl(selected.certificate_path)}
                  alt="Certificate"
                  className="w-full h-auto rounded-lg border-2 border-yellow-200 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(getImageUrl(selected.certificate_path), '_blank')}
                />
              </div>
            )}

            {/* Admin Comments */}
            {selected.admin_comments && (
              <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Admin Comments</h4>
                <p className="text-gray-700">{selected.admin_comments}</p>
              </div>
            )}

            {/* Action Buttons */}
            {selected.status !== 'accepted' && !selected.is_admin_created && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleApproveClick(selected.id || selected._id);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  <FiCheck className="h-5 w-5 inline mr-2" />
                  Approve Activity
                </button>
                <button
                  onClick={() => {
                    handleRejectClick(selected.id || selected._id);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  <FiX className="h-5 w-5 inline mr-2" />
                  Reject Achievement
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Image Viewer */}
      {imageViewerOpen && (
        <ImageViewer
          images={viewingImages}
          initialIndex={0}
          onClose={() => setImageViewerOpen(false)}
        />
      )}

      {/* Enhanced Confirm Dialog with Comments */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => {
          setConfirmDialog({ ...confirmDialog, isOpen: false, comments: '' });
          setActionType(null);
          setActionActivityId(null);
        }}
        onConfirm={async () => {
          const currentComments = confirmDialog.comments || '';
          
          // Handle individual approve/reject actions
          if (actionType === 'approve' && actionActivityId) {
            await approve(actionActivityId, currentComments);
            setConfirmDialog({ ...confirmDialog, isOpen: false, comments: '' });
            setActionType(null);
            setActionActivityId(null);
          } else if (actionType === 'reject' && actionActivityId) {
            await reject(actionActivityId, currentComments);
            setConfirmDialog({ ...confirmDialog, isOpen: false, comments: '' });
            setActionType(null);
            setActionActivityId(null);
          } else if (confirmDialog.onConfirm) {
            // Handle bulk actions or other custom confirm handlers
            await confirmDialog.onConfirm();
            setConfirmDialog({ ...confirmDialog, isOpen: false, comments: '' });
          }
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.confirmText}
        showComments={confirmDialog.showComments}
        comments={confirmDialog.comments}
        onCommentsChange={(comments) => setConfirmDialog(prev => ({ ...prev, comments }))}
      />
    </div>
  );
};

export default Activities;
