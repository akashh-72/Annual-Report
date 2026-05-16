import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiPlus, FiEye, FiEdit, FiTrash2, FiSearch, FiFilter, 
  FiCalendar, FiTag, FiImage, FiCheckCircle, FiClock, 
  FiXCircle, FiArrowRight, FiUsers, FiUser, FiMoreVertical, FiStar, FiAward 
} from 'react-icons/fi';
import { api } from '../services/authService';
import toast from 'react-hot-toast';

const Activities = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    year: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const loadActivities = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value && value.trim() !== '') acc[key] = value;
        return acc;
      }, {});
      
      const params = new URLSearchParams({
        page: currentPage,
        size: 10,
        ...cleanedFilters
      });
      
      const response = await api.get(`/api/v1/activities?${params}`);
      
      const studentActivities = (response.data.activities || []).filter(
        activity => !activity.is_admin_created
      );
      setActivities(studentActivities);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Failed to load portfolio.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, user?.id]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted': return { icon: FiCheckCircle, text: 'Verified', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      case 'rejected': return { icon: FiXCircle, text: 'Rejected', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' };
      default: return { icon: FiClock, text: 'Pending', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
    }
  };

  const getCategoryConfig = (type) => {
    const configs = {
      academic: { label: 'Academic', color: 'text-purple-600', bg: 'bg-purple-100' },
      technical: { label: 'Technical', color: 'text-blue-600', bg: 'bg-blue-100' },
      cultural: { label: 'Cultural', color: 'text-pink-600', bg: 'bg-pink-100' },
      sports: { label: 'Sports', color: 'text-green-600', bg: 'bg-green-100' },
      social: { label: 'Social', color: 'text-orange-600', bg: 'bg-orange-100' }
    };
    return configs[type] || { label: type, color: 'text-slate-600', bg: 'bg-slate-100' };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
                    <FiStar className="text-indigo-600 text-xs" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Personal Portfolio</span>
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">My Achievements</h1>
                <p className="text-slate-500 max-w-xl text-lg font-medium tracking-tight">
                    Manage and showcase your professional milestones, technical innovations, and academic honors.
                </p>
            </div>
            <Link 
                to="/activities/create" 
                className="btn-premium px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95"
            >
                <FiPlus className="text-xl" /> Share Achievement
            </Link>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-10">
            <div className="relative flex-1 min-w-[300px]">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by title or description..."
                    value={filters.search}
                    onChange={(e) => setFilters(p => ({...p, search: e.target.value}))}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium"
                />
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-2 border transition-all ${showFilters ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-600'}`}
            >
                <FiFilter /> {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
        </div>

        {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                        value={filters.type} 
                        onChange={(e) => setFilters(p => ({...p, type: e.target.value}))}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-600 font-bold text-slate-700"
                    >
                        <option value="">All Categories</option>
                        <option value="academic">Academic</option>
                        <option value="technical">Technical</option>
                        <option value="cultural">Cultural</option>
                        <option value="sports">Sports</option>
                        <option value="social">Social</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select 
                        value={filters.status} 
                        onChange={(e) => setFilters(p => ({...p, status: e.target.value}))}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-600 font-bold text-slate-700"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending Review</option>
                        <option value="accepted">Accepted / Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                    <select 
                        value={filters.year} 
                        onChange={(e) => setFilters(p => ({...p, year: e.target.value}))}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-600 font-bold text-slate-700"
                    >
                        <option value="">All Years</option>
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                    </select>
                </div>
            </div>
        )}

        {/* Activities List */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
                ))}
            </div>
        ) : activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {activities.map((act) => {
                    const status = getStatusConfig(act.status);
                    const cat = getCategoryConfig(act.type);
                    return (
                        <div 
                            key={act.id} 
                            onClick={() => navigate(`/activities/${act.id}`)}
                            className="card-premium group overflow-hidden flex flex-col cursor-pointer"
                        >
                            <div className="p-8 flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`px-3 py-1 rounded-full ${cat.bg} ${cat.color} text-[10px] font-black uppercase tracking-widest`}>
                                        {cat.label}
                                    </div>
                                    <div className={`flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest ${status.color}`}>
                                        <status.icon className="text-xs" /> {status.text}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-3 line-clamp-2">
                                    {act.title}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed mb-6">
                                    {act.description}
                                </p>

                                <div className="flex flex-wrap gap-4 mt-auto">
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                                        <FiCalendar /> {act.year}
                                    </div>
                                    {act.achievement_type === 'group' && (
                                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                                            <FiUsers /> Team
                                        </div>
                                    )}
                                    {act.images?.length > 0 && (
                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                                            <FiImage /> {act.images.length} Proof
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-indigo-50 transition-colors">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">View Report</span>
                                <FiArrowRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <FiAward className="text-4xl text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">No achievements found</h2>
                <p className="text-slate-500 max-w-xs mx-auto font-medium">
                    You haven't shared any achievements yet. Time to celebrate your success!
                </p>
                <Link to="/activities/create" className="mt-8 text-indigo-600 font-bold hover:underline">
                    Share your first win &rarr;
                </Link>
            </div>
        )}

        {/* Pagination Logic */}
        {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-4 rounded-2xl border border-slate-200 text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-all font-bold"
                >
                    Previous
                </button>
                <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Page {currentPage} of {totalPages}</span>
                <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-4 rounded-2xl border border-slate-200 text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-all font-bold"
                >
                    Next
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
