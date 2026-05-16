import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiFileText, FiDownload, FiEye, FiRefreshCw, FiBarChart2, FiTrendingUp, FiUsers, FiAward, FiLoader, FiCheckCircle, FiAlertCircle, FiCalendar, FiTag } from 'react-icons/fi';
import { api } from '../services/authService';
import toast from 'react-hot-toast';

const Reports = () => {
  const { user, isAdmin, isStudent } = useAuth();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    total_activities: 0,
    accepted_activities: 0,
    rejected_activities: 0,
    pending_activities: 0,
    total_users: 0,
    departments: [],
    activity_types: [],
    monthly_stats: []
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    type: ''
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadActivities(),
      loadStats()
    ]);
  };

  const loadActivities = async () => {
    if (!user?.id) return;
    
    try {
      const response = await api.get('/api/v1/activities', {
        params: {
          page: 1,
          size: 100,
          status: 'accepted' // Only show accepted activities for reports
        }
      });
      
      // Filter out admin-created activities and show user's activities
      // Include activities where user is creator OR user is a group member
      const userActivities = (response.data.activities || []).filter(
        activity => {
          if (activity.is_admin_created) return false;
          // User is the creator
          if (activity.user_id === user?.id) return true;
          // User is a group member
          if (activity.achievement_type === 'group' && 
              Array.isArray(activity.group_members) && 
              activity.group_members.includes(user?.id)) {
            return true;
          }
          return false;
        }
      );
      setActivities(userActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load activities');
      }
      setActivities([]);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/api/v1/reports/stats');
      setStats(response.data);
      
      // Extract departments from stats - now includes all departments for dropdown
      if (response.data.departments && Array.isArray(response.data.departments)) {
        const deptList = response.data.departments
          .map(d => typeof d === 'string' ? d : d.department)
          .filter(d => d); // Filter out null/undefined
        setDepartments([...new Set(deptList)].sort());
      } else {
        // Fallback to default departments if none found
        setDepartments([
          'Computer Science',
          'Mechanical Engineering',
          'Electronics & Communication',
          'Civil Engineering',
          'Electrical Engineering',
          'Information Technology'
        ]);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load statistics');
      }
      // Set default stats
      setStats({
        total_activities: 0,
        accepted_activities: 0,
        rejected_activities: 0,
        pending_activities: 0,
        total_users: 0,
        departments: []
      });
      // Set default departments
      setDepartments([
        'Computer Science',
        'Mechanical Engineering',
        'Electronics & Communication',
        'Civil Engineering',
        'Electrical Engineering',
        'Information Technology'
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateIndividualReport = async (activityId) => {
    if (!activityId) {
      toast.error('Please select an activity');
      return;
    }

    try {
      setGenerating(true);
      const response = await api.get(`/api/v1/reports/individual/${activityId}`);
      return response.data.html;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to generate report';
      toast.error(message);
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  const downloadIndividualPDF = async (activityId) => {
    if (!activityId) {
      toast.error('Please select an activity');
      return;
    }

    try {
      setGenerating(true);
      const response = await api.get(`/api/v1/reports/individual/${activityId}/pdf`, {
        responseType: 'blob'
      });
      
      // Determine file type from content type
      const contentType = response.headers['content-type'] || '';
      const isHTML = contentType.includes('text/html');
      const extension = isHTML ? 'html' : 'pdf';
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      const link = document.createElement('a');
      link.href = url;
      
      const activity = activities.find(a => a.id === activityId);
      const filename = activity 
        ? `report_${activity.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`
        : `activity_${activityId}_report.${extension}`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Report downloaded successfully${isHTML ? ' (HTML - you can print to PDF from your browser)' : ''}`);
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to download report';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const generateGroupReport = async () => {
    try {
      setGenerating(true);
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.year) params.append('year', filters.year);
      if (filters.type) params.append('type', filters.type);
      
      const response = await api.get(`/api/v1/reports/group?${params}`);
      return response.data.html;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to generate report';
      toast.error(message);
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  const downloadGroupPDF = async () => {
    try {
      setGenerating(true);
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.year) params.append('year', filters.year);
      if (filters.type) params.append('type', filters.type);
      
      const response = await api.get(`/api/v1/reports/group/pdf?${params}`, {
        responseType: 'blob'
      });
      
      // Determine file type from content type
      const contentType = response.headers['content-type'] || '';
      const isHTML = contentType.includes('text/html');
      const extension = isHTML ? 'html' : 'pdf';
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `group_report_${filters.department || 'all'}_${filters.year || 'all'}.${extension}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Report downloaded successfully${isHTML ? ' (HTML - you can print to PDF from your browser)' : ''}`);
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to download report';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const previewReport = (htmlContent) => {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  };

  const handlePreviewIndividual = async () => {
    if (!selectedActivityId) {
      toast.error('Please select an activity');
      return;
    }
    try {
      const html = await generateIndividualReport(selectedActivityId);
      previewReport(html);
    } catch (error) {
      // Error already handled
    }
  };

  const handlePreviewGroup = async () => {
    try {
      const html = await generateGroupReport();
      previewReport(html);
    } catch (error) {
      // Error already handled
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
                <span className="text-sm font-semibold text-blue-700">Reports & Analytics</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                {isStudent() ? (
                  <>My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Achievement Reports</span></>
                ) : (
                  <>Generate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Reports</span></>
                )}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                {isStudent() 
                  ? 'Download professional reports of your achievements for portfolios, resumes, and applications'
                  : 'Create and download comprehensive reports of achievements in various formats'}
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={generating}
              className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-blue-500 transition-all font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <FiRefreshCw className={`h-5 w-5 mr-2 ${generating ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <FiBarChart2 className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_activities || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <FiCheckCircle className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.accepted_activities || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <FiUsers className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{departments.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <FiAward className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 mb-1">My Activities</p>
                <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Generation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Individual Report */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FiFileText className="w-6 h-6 mr-3" />
                Individual Activity Report
              </h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                Generate a detailed report for a specific achievement with all information and images.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Select Activity <span className="text-red-500">*</span>
                  </label>
                  {activities.length > 0 ? (
                    <select
                      value={selectedActivityId}
                      onChange={(e) => setSelectedActivityId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base bg-white font-medium"
                    >
                      <option value="">Choose an activity...</option>
                      {activities.map((activity) => (
                        <option key={activity.id} value={activity.id}>
                          {activity.title} - {new Date(activity.created_at).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-center">
                      No accepted activities available for reports
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handlePreviewIndividual}
                    disabled={!selectedActivityId || generating}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <FiEye className="h-5 w-5 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={() => downloadIndividualPDF(selectedActivityId)}
                    disabled={!selectedActivityId || generating}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
                  >
                    {generating ? (
                      <>
                        <FiLoader className="h-5 w-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FiDownload className="h-5 w-5 mr-2" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Group Report / Complete Report */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FiTrendingUp className="w-6 h-6 mr-3" />
                {isAdmin() ? 'Group Report' : 'My Complete Report'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                {isAdmin() 
                  ? 'Generate a comprehensive report for multiple activities with filters.'
                  : 'Generate a comprehensive report of all your accepted achievements in one document.'}
              </p>
              <div className="space-y-4">
                {isAdmin() ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Department
                        </label>
                        <select
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base bg-white font-medium"
                          value={filters.department}
                          onChange={(e) => setFilters({...filters, department: e.target.value})}
                        >
                          <option value="">All Departments</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Year
                        </label>
                        <select
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base bg-white font-medium"
                          value={filters.year}
                          onChange={(e) => setFilters({...filters, year: e.target.value})}
                        >
                          <option value="">All Years</option>
                          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base bg-white font-medium"
                        value={filters.type}
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                      >
                        <option value="">All Categories</option>
                        <option value="academic">Academic Excellence</option>
                        <option value="technical">Technical Innovation</option>
                        <option value="cultural">Cultural & Arts</option>
                        <option value="sports">Sports & Fitness</option>
                        <option value="social">Social Service</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                    <p className="text-sm text-purple-800 font-medium flex items-start">
                      <FiAlertCircle className="h-4 w-4 inline mr-2 mt-0.5 flex-shrink-0" />
                      <span>This report will include all your accepted achievements (individual and group activities).</span>
                    </p>
                  </div>
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={handlePreviewGroup}
                    disabled={generating || (!isAdmin() && activities.length === 0)}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <FiEye className="h-5 w-5 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={downloadGroupPDF}
                    disabled={generating || (!isAdmin() && activities.length === 0)}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
                  >
                    {generating ? (
                      <>
                        <FiLoader className="h-5 w-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FiDownload className="h-5 w-5 mr-2" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <FiAlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">About Reports</h3>
              {isStudent() ? (
                <>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    Generate professional reports of your achievements. Individual reports provide detailed information about a specific achievement, while the complete report includes all your accepted achievements in one comprehensive document.
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Note:</strong> Only accepted achievements are included in reports. If you don't see an activity, make sure it has been approved by an administrator.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    Reports are generated based on accepted achievements. Individual reports include detailed information about a specific achievement, while group reports provide comprehensive statistics and summaries based on your selected filters.
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Note:</strong> Only accepted achievements are included in reports. Use filters to generate department-wide or institution-wide reports.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
