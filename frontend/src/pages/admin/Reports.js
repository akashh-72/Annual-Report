import React, { useState, useEffect } from 'react';
import {
  FiFileText,
  FiDownload,
  FiEye,
  FiRefreshCw,
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { api } from '../../services/authService';
import toast from 'react-hot-toast';

const reportModes = [
  {
    value: 'combined',
    label: 'Institution Report',
    description: 'All departments · All years',
  },
  {
    value: 'annual',
    label: 'Annual Report',
    description: 'Pick a specific academic year',
  },
  {
    value: 'department',
    label: 'Department Report',
    description: 'Focus on a single department',
  },
  {
    value: 'range',
    label: 'Date Range Report',
    description: 'Multi‑year stitched report (max 5 yrs)',
  },
];

const Reports = () => {
  const [stats, setStats] = useState({
    total_activities: 0,
    accepted_activities: 0,
    rejected_activities: 0,
    pending_activities: 0,
    total_users: 0,
    departments: [],
    activity_types: [],
    monthly_stats: [],
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportMode, setReportMode] = useState('combined');
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    startYear: '',
    endYear: '',
    type: '',
  });
  const [departments, setDepartments] = useState([]);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target.id) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/api/v1/reports/stats');
      setStats(response.data);
      if (response.data.departments && Array.isArray(response.data.departments)) {
        const deptList = response.data.departments
          .map(d => (typeof d === 'string' ? d : d.department))
          .filter(Boolean);
        setDepartments([...new Set(deptList)].sort());
      } else {
        setDepartments([
          'Computer Science',
          'Mechanical Engineering',
          'Electronics & Communication',
          'Civil Engineering',
          'Electrical Engineering',
          'Information Technology',
          'Chemical Engineering',
        ]);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load report statistics');
      setStats({
        total_activities: 0,
        accepted_activities: 0,
        rejected_activities: 0,
        pending_activities: 0,
        total_users: 0,
        departments: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const buildParamsForMode = () => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);

    if (reportMode === 'department') {
      if (!filters.department) {
        toast.error('Select a department for department report');
        return null;
      }
      params.append('department', filters.department);
      if (filters.year) params.append('year', filters.year);
    } else if (reportMode === 'annual') {
      if (!filters.year) {
        toast.error('Select a year for annual report');
        return null;
      }
      params.append('year', filters.year);
      if (filters.department) params.append('department', filters.department);
    } else if (reportMode === 'combined') {
      if (filters.department) params.append('department', filters.department);
      if (filters.year) params.append('year', filters.year);
    }

    return params;
  };

  const extractHeadAndBody = html => {
    const headMatch = html.match(/<head[^>]*>[\s\S]*?<\/head>/i);
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return {
      head: headMatch ? headMatch[0] : '<head></head>',
      body: bodyMatch ? bodyMatch[1] : html,
    };
  };

  const buildRangeHtml = async () => {
    const { startYear, endYear } = filters;
    if (!startYear || !endYear) {
      toast.error('Select both start and end year for range report');
      return null;
    }
    const start = parseInt(startYear, 10);
    const end = parseInt(endYear, 10);
    if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
      toast.error('Invalid year range');
      return null;
    }
    const years = [];
    for (let year = start; year <= end; year += 1) years.push(year);
    if (years.length > 5) {
      toast.error('Please keep the range within 5 years for performance reasons');
      return null;
    }

    const sections = [];
    let combinedHead = '';

    for (const year of years) {
      const params = new URLSearchParams();
      params.append('year', year.toString());
      if (filters.department) params.append('department', filters.department);
      if (filters.type) params.append('type', filters.type);

      const response = await api.get(`/api/v1/reports/group?${params.toString()}`);
      const { head, body } = extractHeadAndBody(response.data.html);
      if (!combinedHead && head) combinedHead = head;
      sections.push(`<section style="page-break-after:always">${body}</section>`);
    }

    if (sections.length === 0) {
      toast.error('No data available for selected range');
      return null;
    }

    return `<!DOCTYPE html><html>${combinedHead || '<head></head>'}<body>${sections.join('')}</body></html>`;
  };

  const previewReport = async () => {
    try {
      setGenerating(true);
      let htmlContent = '';
      if (reportMode === 'range') {
        htmlContent = await buildRangeHtml();
      } else {
        const params = buildParamsForMode();
        if (!params) return;
        const response = await api.get(`/api/v1/reports/group?${params.toString()}`);
        htmlContent = response.data.html;
      }

      if (!htmlContent) return;
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to generate preview';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async () => {
    try {
      setGenerating(true);
      if (reportMode === 'range') {
        const html = await buildRangeHtml();
        if (!html) return;
        const blob = new Blob([html], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `range_report_${filters.startYear}_${filters.endYear || filters.startYear}.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Range report downloaded (HTML). Use browser print to save as PDF.');
        return;
      }

      const params = buildParamsForMode();
      if (!params) return;
      const response = await api.get(`/api/v1/reports/group/pdf?${params.toString()}`, {
        responseType: 'blob',
      });

      const contentType = response.headers['content-type'] || '';
      const isHTML = contentType.includes('text/html');
      const extension = isHTML ? 'html' : 'pdf';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      const link = document.createElement('a');
      link.href = url;

      let filename = `${reportMode}_achievement_report`;
      if (filters.department) filename += `_${filters.department.replace(/[^a-z0-9]/gi, '_')}`;
      if (filters.year) filename += `_${filters.year}`;
      if (filters.type) filename += `_${filters.type}`;
      filename += `.${extension}`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        `Report downloaded successfully${isHTML ? ' (HTML - print to PDF from your browser)' : ''}`
      );
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to download report';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="spinner mb-4" />
          <p className="text-gray-600 font-semibold text-lg">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div
        data-animate
        id="reports-hero"
        className={`relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-3xl shadow-2xl p-8 transition ${
          isVisible['reports-hero'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 mb-3">
                <span className="px-3 py-1 bg-blue-800/50 border border-blue-600 text-blue-100 rounded-full text-xs font-semibold">
                  Admin • Reports
                </span>
                <span className="px-3 py-1 bg-blue-600/30 border border-blue-400/40 text-white rounded-full text-xs font-semibold flex items-center">
                  <FiFileText className="mr-1.5 h-3 w-3" />
                  Official Template
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Achievement Reports</h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Generate annual, date range, department-wise, or combined achievement reports using the same official
                template used on the student side.
              </p>
            </div>
            <button
              onClick={loadStats}
              className="inline-flex items-center px-6 py-3 bg-white/10 border border-white/30 text-white font-semibold rounded-xl backdrop-blur shadow-lg hover:bg-white/20 transition"
            >
              <FiRefreshCw className="mr-2" />
              Refresh Stats
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        data-animate
        id="reports-stats"
        className={`grid grid-cols-1 md:grid-cols-4 gap-6 transition ${
          isVisible['reports-stats'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-50 hover:shadow-xl transition">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-blue-600/90 rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiBarChart2 className="h-7 w-7" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_activities || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-50 hover:shadow-xl transition">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiCheckCircle className="h-7 w-7" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.accepted_activities || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-50 hover:shadow-xl transition">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiUsers className="h-7 w-7" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-50 hover:shadow-xl transition">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiAward className="h-7 w-7" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Report Templates</p>
              <p className="text-2xl font-bold text-gray-900">2 (Individual + Group)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Builder */}
      <div
        data-animate
        id="report-builder"
        className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition ${
          isVisible['report-builder'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <FiTrendingUp className="w-6 h-6 mr-3" />
              Achievement Report Builder
            </h2>
            <p className="text-sm text-blue-100">Choose a mode, set filters, preview, and download.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={previewReport}
              disabled={generating}
              className="inline-flex items-center px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              <FiEye className="mr-2" />
              Preview
            </button>
            <button
              onClick={downloadReport}
              disabled={generating}
              className="inline-flex items-center px-5 py-2.5 bg-blue-900 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              {generating ? <FiLoader className="mr-2 animate-spin" /> : <FiDownload className="mr-2" />}
              {generating ? 'Generating...' : 'Download'}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Report Mode</label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {reportModes.map(mode => (
                <button
                  key={mode.value}
                  onClick={() => setReportMode(mode.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    reportMode === mode.value
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <p className="font-semibold text-gray-900 text-sm">{mode.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{mode.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(reportMode === 'department' || reportMode === 'combined' || reportMode === 'annual') && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Department (optional)</label>
                <select
                  value={filters.department}
                  onChange={e => setFilters({ ...filters, department: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(reportMode === 'annual' || reportMode === 'department') && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Year</label>
                <select
                  value={filters.year}
                  onChange={e => setFilters({ ...filters, year: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reportMode === 'range' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Start Year</label>
                  <select
                    value={filters.startYear}
                    onChange={e => setFilters({ ...filters, startYear: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Start Year</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">End Year</label>
                  <select
                    value={filters.endYear}
                    onChange={e => setFilters({ ...filters, endYear: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">End Year</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category / Type (optional)</label>
              <select
                value={filters.type}
                onChange={e => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="academic">Academic Excellence</option>
                <option value="technical">Technical Innovation</option>
                <option value="cultural">Cultural & Arts</option>
                <option value="sports">Sports & Fitness</option>
                <option value="social">Social Service</option>
              </select>
            </div>
          </div>

 	    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 font-medium flex items-start">
              <FiAlertCircle className="h-4 w-4 inline mr-2 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Report Guidance:</strong>
                <br />• Leave filters empty for combined institute report.
                <br />• Annual report requires a year. Department report requires a department.
                <br />• Date range stitches multiple year-wise template outputs into a single HTML file. Use browser print
                to export as PDF.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div
        data-animate
        id="info-section"
        className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border border-blue-200 transition ${
          isVisible['info-section'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="flex items-start">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mr-4">
            <FiAlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">About Achievement Reports</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              Reports are generated using the same official templates used on the student portal. Annual and
              department-wise reports are downloaded directly as PDF/HTML from the backend template. Date range reports
              stitch multiple yearly templates into a single HTML (print-ready) document.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>Note:</strong> Only accepted achievements are included. Apply optional category filters for
              focused narratives. Print HTML downloads to PDF via your browser for official use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

