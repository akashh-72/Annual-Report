import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrophy, FaAward, FaRocket, FaUsers, FaBook, FaGraduationCap, FaFilter, FaSearch, FaUser, FaCalendar, FaTag, FaImage, FaCheckCircle } from 'react-icons/fa';
import PublicLayout from '../../layouts/PublicLayout';
import { getImageUrl } from '../../utils/imageUtils';

const Achievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [allAchievements, setAllAchievements] = useState([]);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    const activityTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'academic', label: 'Academic' },
        { value: 'technical', label: 'Technical' },
        { value: 'cultural', label: 'Cultural' },
        { value: 'sports', label: 'Sports' },
        { value: 'social', label: 'Social' }
    ];

    useEffect(() => {
        loadAchievements();
    }, []); // Only load once on mount, not when filters change

    useEffect(() => {
        filterAchievements();
    }, [searchQuery, allAchievements, selectedDept, selectedType]);

    const loadAchievements = async () => {
        try {
            setLoading(true);
            console.log('[Achievements] Starting to load all achievements...');
            
            // Fetch all achievements by paginating through all pages
            let allActivities = [];
            let currentPage = 1;
            let hasMore = true;
            const pageSize = 100; // Fetch 100 at a time
            
            while (hasMore) {
                try {
                    const params = { 
                        page: currentPage, 
                        size: pageSize 
                    };
                    
                    console.log(`[Achievements] Fetching page ${currentPage}...`);
                    const response = await axios.get(`${API_BASE_URL}/api/v1/activities/public`, { 
                        params,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        withCredentials: false // Don't send credentials for public endpoint
                    });
                    
                    // Handle response structure - similar to Activities.js
                    let activitiesList = [];
                    if (response.data) {
                        if (Array.isArray(response.data)) {
                            activitiesList = response.data;
                        } else if (response.data.activities && Array.isArray(response.data.activities)) {
                            activitiesList = response.data.activities;
                        } else if (response.data.data && Array.isArray(response.data.data)) {
                            activitiesList = response.data.data;
                        }
                    }
                    
                    console.log(`[Achievements] Page ${currentPage}: Found ${activitiesList.length} activities`);
                    
                    if (activitiesList.length > 0) {
                        allActivities = [...allActivities, ...activitiesList];
                        currentPage++;
                        
                        // Check if there are more pages
                        const totalPages = response.data?.pages || response.data?.total_pages || 1;
                        hasMore = currentPage <= totalPages && activitiesList.length === pageSize;
                    } else {
                        hasMore = false;
                    }
                } catch (pageError) {
                    console.error(`[Achievements] Error fetching page ${currentPage}:`, pageError);
                    hasMore = false;
                }
            }
            
            console.log(`[Achievements] Total activities fetched: ${allActivities.length}`);

            // Filter for student achievements only (not admin-created) - same logic as Activities.js
            const studentAchievements = allActivities.filter(activity => {
                // Only show accepted student achievements (not admin-created events)
                return activity.status === 'accepted' && !activity.is_admin_created;
            });

            console.log(`[Achievements] Student achievements after filtering: ${studentAchievements.length}`);
            setAllAchievements(studentAchievements);

            // Extract unique departments from all achievements
            const deptSet = new Set();
            studentAchievements.forEach(a => {
                if (a.department && a.department.trim()) {
                    deptSet.add(a.department.trim());
                }
            });
            
            // Always include default departments for filtering
            const defaultDepts = [
                'Computer Science', 
                'Mechanical Engineering', 
                'Electronics & Communication', 
                'Civil Engineering', 
                'Electrical Engineering', 
                'Information Technology', 
                'Chemical Engineering'
            ];
            defaultDepts.forEach(d => deptSet.add(d));
            
            const sortedDepts = Array.from(deptSet).sort();
            console.log(`[Achievements] Departments found: ${sortedDepts.join(', ')}`);
            setDepartments(sortedDepts);

        } catch (error) {
            console.error('[Achievements] Error loading achievements:', error);
            console.error('[Achievements] Error response:', error.response?.data);
            console.error('[Achievements] Error status:', error.response?.status);
            console.error('[Achievements] Error message:', error.message);
            
            // If 403, try without credentials or check if it's a CORS issue
            if (error.response?.status === 403) {
                console.warn('[Achievements] Got 403 Forbidden. This might be a CORS or authentication issue.');
                console.warn('[Achievements] The /public endpoint should not require authentication.');
            }
            
            setAllAchievements([]);
        } finally {
            setLoading(false);
        }
    };

    const filterAchievements = () => {
        let filtered = [...allAchievements];

        // Filter by department
        if (selectedDept !== 'all') {
            filtered = filtered.filter(a => 
                a.department && a.department.trim().toLowerCase() === selectedDept.toLowerCase()
            );
        }

        // Filter by type
        if (selectedType !== 'all') {
            filtered = filtered.filter(a => 
                a.type && a.type.toLowerCase() === selectedType.toLowerCase()
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                (a.title && a.title.toLowerCase().includes(query)) ||
                (a.description && a.description.toLowerCase().includes(query)) ||
                (a.user_name && a.user_name.toLowerCase().includes(query)) ||
                (a.department && a.department.toLowerCase().includes(query))
            );
        }

        setAchievements(filtered);
    };

    const getActivityTypeColor = (type) => {
        const colors = {
            academic: 'from-blue-500 to-blue-600',
            technical: 'from-blue-600 to-blue-700',
            cultural: 'from-blue-500 to-indigo-600',
            sports: 'from-blue-600 to-blue-800',
            social: 'from-blue-500 to-blue-700'
        };
        return colors[type?.toLowerCase()] || 'from-blue-500 to-blue-600';
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

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-blue-900/90"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-block mb-4 px-4 py-2 bg-blue-800/50 backdrop-blur-sm rounded-full border border-blue-600">
                        <span className="text-sm font-semibold text-blue-100">Student Achievements</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Celebrating Excellence</h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                        Showcasing outstanding achievements by our students across various departments and disciplines.
                    </p>
                </div>
            </section>

            {/* Filters and Content */}
            <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Search Bar */}
                    <div className="mb-8">
                        <div className="relative max-w-2xl mx-auto">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                            <input
                                type="text"
                                placeholder="Search achievements by title, description, student name, or department..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <FaFilter className="text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {/* Department Filter */}
                            <div className="flex flex-wrap gap-3">
                                <span className="text-sm font-medium text-gray-700 self-center">Department:</span>
                                <button
                                    onClick={() => setSelectedDept('all')}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${selectedDept === 'all'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-white text-gray-700 hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-500'
                                        }`}
                                >
                                    All Departments
                                </button>
                                {departments.map((dept) => (
                                    <button
                                        key={dept}
                                        onClick={() => setSelectedDept(dept)}
                                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${selectedDept === dept
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white text-gray-700 hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-500'
                                            }`}
                                    >
                                        {dept}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Type Filter */}
                            <div className="flex flex-wrap gap-3 ml-auto">
                                <span className="text-sm font-medium text-gray-700 self-center">Type:</span>
                                {activityTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setSelectedType(type.value)}
                                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${selectedType === type.value
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white text-gray-700 hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-500'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Results Count */}
                        {!loading && (
                            <div className="mt-4 text-sm text-gray-600">
                                Showing <span className="font-semibold text-blue-600">{achievements.length}</span> achievement{achievements.length !== 1 ? 's' : ''}
                                {allAchievements.length > 0 && (
                                    <span> out of {allAchievements.length} total</span>
                                )}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse border-2 border-blue-100">
                                    <div className="h-48 bg-blue-100 rounded-xl mb-4"></div>
                                    <div className="h-4 bg-blue-100 rounded mb-3 w-24"></div>
                                    <div className="h-6 bg-blue-100 rounded mb-2"></div>
                                    <div className="h-4 bg-blue-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : achievements.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {achievements.map((achievement, index) => {
                                const Icon = getActivityTypeIcon(achievement.type);
                                return (
                                    <div
                                        key={achievement.id || achievement._id || index}
                                        className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-blue-100 hover:border-blue-500"
                                    >
                                        {achievement.images && achievement.images.length > 0 && (
                                            <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden">
                                                <img
                                                    src={getImageUrl(achievement.images[0])}
                                                    alt={achievement.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>
                                        )}
                                        {(!achievement.images || achievement.images.length === 0) && (
                                            <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden flex items-center justify-center">
                                                <Icon className="h-16 w-16 text-white opacity-50" />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            {/* Achievement Type and Status Badges */}
                                            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-md">
                                                        <FaCheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                                        Accepted
                                                    </span>
                                                    {achievement.achievement_type === 'group' ? (
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                                                            <FaUsers className="h-3.5 w-3.5 mr-1.5" />
                                                            Group Achievement
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-md">
                                                            <FaUser className="h-3.5 w-3.5 mr-1.5" />
                                                            Individual Achievement
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getActivityTypeColor(achievement.type)} shadow-md`}>
                                                    {achievement.type || 'General'}
                                                </span>
                                            </div>
                                            
                                            {/* Group Members Info */}
                                            {achievement.achievement_type === 'group' && achievement.group_members && achievement.group_members.length > 0 && (
                                                <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                                    <div className="flex items-center text-sm text-blue-800">
                                                        <FaUsers className="h-4 w-4 mr-2" />
                                                        <span className="font-semibold">
                                                            {achievement.group_members.length + 1} team member{achievement.group_members.length !== 0 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                                                {achievement.title}
                                            </h3>
                                            
                                            {/* Description */}
                                            <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
                                                {achievement.description}
                                            </p>
                                            
                                            {/* Metadata */}
                                            <div className="space-y-2.5 mb-5">
                                                <div className="flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                                                    <FaCalendar className="h-4 w-4 mr-2 text-blue-600" />
                                                    <span className="font-medium">
                                                        {achievement.created_at 
                                                            ? new Date(achievement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                            : 'Date not available'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                                                    <FaTag className="h-4 w-4 mr-2 text-blue-600" />
                                                    <span className="font-medium">{achievement.department || 'General'} • Year {achievement.year || 'N/A'}</span>
                                                </div>
                                                {achievement.images && achievement.images.length > 0 && (
                                                    <div className="flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                                                        <FaImage className="h-4 w-4 mr-2 text-blue-600" />
                                                        <span className="font-medium">{achievement.images.length} Image{achievement.images.length !== 1 ? 's' : ''}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Student Name */}
                                            {achievement.user_name && (
                                                <div className="pt-4 border-t border-blue-100">
                                                    <p className="text-xs text-gray-500">
                                                        By: <span className="font-semibold text-blue-600">{achievement.user_name}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border-2 border-blue-100">
                            <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaTrophy className="h-12 w-12 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Achievements Found</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                {searchQuery || selectedDept !== 'all' || selectedType !== 'all'
                                    ? `No achievements match your current filters. Try adjusting your search or filters.`
                                    : 'Check back soon for student achievements!'}
                            </p>
                            {(searchQuery || selectedDept !== 'all' || selectedType !== 'all') && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedDept('all');
                                        setSelectedType('all');
                                    }}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
};

export default Achievements;
