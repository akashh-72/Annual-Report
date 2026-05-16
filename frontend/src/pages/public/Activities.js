import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRocket, FaAward, FaTrophy, FaBook, FaUsers, FaGraduationCap, FaFilter } from 'react-icons/fa';
import PublicLayout from '../../layouts/PublicLayout';
import { getImageUrl } from '../../utils/imageUtils';

const Activities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [departments, setDepartments] = useState([]);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    const activityTypes = [
        { id: 'all', name: 'All Types', icon: FaGraduationCap },
        { id: 'academic', name: 'Academic', icon: FaBook },
        { id: 'technical', name: 'Technical', icon: FaRocket },
        { id: 'cultural', name: 'Cultural', icon: FaAward },
        { id: 'sports', name: 'Sports', icon: FaTrophy },
        { id: 'social', name: 'Social', icon: FaUsers }
    ];

    useEffect(() => {
        loadActivities();
    }, [selectedDept, selectedType]);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const params = { page: 1, size: 100 };
            if (selectedDept !== 'all') {
                params.department = selectedDept;
            }

            const response = await axios.get(`${API_BASE_URL}/api/v1/activities/public`, { params });

            let filteredActivities = (response.data?.activities || [])
                .filter(activity => activity.status === 'accepted');

            // Filter by type if not 'all'
            if (selectedType !== 'all') {
                filteredActivities = filteredActivities.filter(
                    activity => activity.type?.toLowerCase() === selectedType.toLowerCase()
                );
            }

            setActivities(filteredActivities);

            // Extract departments if not already set
            if (departments.length === 0) {
                const deptSet = new Set();
                filteredActivities.forEach(a => {
                    if (a.department) deptSet.add(a.department);
                });
                if (deptSet.size === 0) {
                    ['Computer Science', 'Mechanical Engineering', 'Electronics & Communication', 'Civil Engineering', 'Chemical Engineering'].forEach(d => deptSet.add(d));
                }
                setDepartments(Array.from(deptSet).sort());
            }
        } catch (error) {
            console.error('Error loading activities:', error);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    const getActivityTypeColor = (type) => {
        const colors = {
            academic: 'from-blue-500 to-indigo-600',
            technical: 'from-purple-500 to-pink-600',
            cultural: 'from-pink-500 to-rose-600',
            sports: 'from-green-500 to-emerald-600',
            social: 'from-orange-500 to-amber-600'
        };
        return colors[type?.toLowerCase()] || 'from-gray-500 to-gray-600';
    };

    const getActivityTypeIcon = (type) => {
        const icons = {
            academic: FaBook,
            technical: FaRocket,
            cultural: FaAward,
            sports: FaTrophy,
            social: FaUsers
        };
        return icons[type?.toLowerCase()] || FaGraduationCap;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    return (
        <PublicLayout>
            <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12 lg:mb-16">
                        <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 rounded-full">
                            <span className="text-sm font-semibold text-indigo-700">Student Activities</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Campus Activities
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Discover the diverse range of activities and initiatives that make campus life at TKIET vibrant and engaging.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="mb-12 space-y-6">
                        {/* Activity Type Filter */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <FaFilter className="text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Filter by Type</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {activityTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                                                selectedType === type.id
                                                    ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                                                    : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {type.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Department Filter */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <FaFilter className="text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Filter by Department</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setSelectedDept('all')}
                                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                                        selectedDept === 'all'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                                    }`}
                                >
                                    All Departments
                                </button>
                                {departments.map((dept) => (
                                    <button
                                        key={dept}
                                        onClick={() => setSelectedDept(dept)}
                                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                                            selectedDept === dept
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                                        }`}
                                    >
                                        {dept}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Activities Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                                    <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-3 w-24"></div>
                                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : activities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activities.map((activity, index) => {
                                const Icon = getActivityTypeIcon(activity.type);
                                return (
                                    <div
                                        key={activity.id || index}
                                        className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-indigo-200"
                                    >
                                        {activity.images && activity.images.length > 0 && (
                                            <div className="h-56 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                                                <img
                                                    src={getImageUrl(activity.images[0])}
                                                    alt={activity.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                                                    <span className="text-xs font-bold text-white capitalize">{activity.type || 'Activity'}</span>
                                                </div>
                                            </div>
                                        )}
                                        {(!activity.images || activity.images.length === 0) && (
                                            <div className={`h-56 bg-gradient-to-br ${getActivityTypeColor(activity.type)} flex items-center justify-center`}>
                                                <Icon className="h-20 w-20 text-white opacity-80" />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`bg-gradient-to-br ${getActivityTypeColor(activity.type)} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}>
                                                    <Icon className="h-6 w-6 text-white" />
                                                </div>
                                                {activity.department && (
                                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                                                        {activity.department}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                {activity.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                                                {activity.description}
                                            </p>
                                            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                                                <span>{formatDate(activity.activity_date || activity.created_at)}</span>
                                                {activity.user_name && (
                                                    <span className="text-xs">By {activity.user_name}</span>
                                                )}
                                            </div>
                                            {activity.venue && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    📍 {activity.venue}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FaGraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Activities Available</h3>
                            <p className="text-gray-600">
                                {selectedDept !== 'all' || selectedType !== 'all'
                                    ? 'No activities found for the selected filters. Try adjusting your filters.'
                                    : 'Check back soon for campus activities!'}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
};

export default Activities;

