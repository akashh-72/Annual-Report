import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaRocket, FaAward, FaTrophy, FaBook, FaGraduationCap, FaFilter, FaSearch, FaClock, FaTag } from 'react-icons/fa';
import PublicLayout from '../../layouts/PublicLayout';
import { getImageUrl } from '../../utils/imageUtils';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [allEvents, setAllEvents] = useState([]);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    const eventTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'academic', label: 'Academic' },
        { value: 'technical', label: 'Technical' },
        { value: 'cultural', label: 'Cultural' },
        { value: 'sports', label: 'Sports' },
        { value: 'social', label: 'Social' }
    ];

    useEffect(() => {
        loadEvents();
    }, []); // Only load once on mount

    useEffect(() => {
        filterEvents();
    }, [searchQuery, allEvents, selectedDept, selectedType]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            console.log('[Events] Starting to load all events...');
            
            // Fetch all events by paginating through all pages
            let allEventsData = [];
            let currentPage = 1;
            let hasMore = true;
            const pageSize = 100;
            
            while (hasMore) {
                try {
                    const params = { 
                        page: currentPage, 
                        size: pageSize 
                    };
                    
                    console.log(`[Events] Fetching page ${currentPage}...`);
                    const response = await axios.get(`${API_BASE_URL}/api/v1/events/public`, { 
                        params,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        withCredentials: false
                    });
                    
                    // Handle response structure
                    let eventsList = [];
                    if (response.data) {
                        if (Array.isArray(response.data)) {
                            eventsList = response.data;
                        } else if (response.data.events && Array.isArray(response.data.events)) {
                            eventsList = response.data.events;
                        } else if (response.data.data && Array.isArray(response.data.data)) {
                            eventsList = response.data.data;
                        }
                    }
                    
                    console.log(`[Events] Page ${currentPage}: Found ${eventsList.length} events`);
                    
                    if (eventsList.length > 0) {
                        allEventsData = [...allEventsData, ...eventsList];
                        currentPage++;
                        
                        // Check if there are more pages
                        const totalPages = response.data?.pages || response.data?.total_pages || 1;
                        hasMore = currentPage <= totalPages && eventsList.length === pageSize;
                    } else {
                        hasMore = false;
                    }
                } catch (pageError) {
                    console.error(`[Events] Error fetching page ${currentPage}:`, pageError);
                    hasMore = false;
                }
            }
            
            console.log(`[Events] Total events fetched: ${allEventsData.length}`);
            setAllEvents(allEventsData);

            // Extract unique departments from all events
            const deptSet = new Set();
            allEventsData.forEach(e => {
                if (e.department && e.department.trim()) {
                    deptSet.add(e.department.trim());
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
            console.log(`[Events] Departments found: ${sortedDepts.join(', ')}`);
            setDepartments(sortedDepts);

        } catch (error) {
            console.error('[Events] Error loading events:', error);
            console.error('[Events] Error response:', error.response?.data);
            console.error('[Events] Error status:', error.response?.status);
            setAllEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const filterEvents = () => {
        let filtered = [...allEvents];

        // Filter by department
        if (selectedDept !== 'all') {
            filtered = filtered.filter(e => 
                e.department && e.department.trim().toLowerCase() === selectedDept.toLowerCase()
            );
        }

        // Filter by type
        if (selectedType !== 'all') {
            filtered = filtered.filter(e => 
                e.type && e.type.toLowerCase() === selectedType.toLowerCase()
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(e =>
                (e.title && e.title.toLowerCase().includes(query)) ||
                (e.description && e.description.toLowerCase().includes(query)) ||
                (e.organizer && e.organizer.toLowerCase().includes(query)) ||
                (e.venue && e.venue.toLowerCase().includes(query)) ||
                (e.department && e.department.toLowerCase().includes(query))
            );
        }

        // Sort by date (upcoming first)
        filtered.sort((a, b) => {
            const dateA = new Date(a.activity_date || a.date || 0);
            const dateB = new Date(b.activity_date || b.date || 0);
            return dateA - dateB;
        });

        setEvents(filtered);
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
        return icons[type?.toLowerCase()] || FaCalendarAlt;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return 'TBA';
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return '';
        }
    };

    const isUpcoming = (dateString) => {
        if (!dateString) return false;
        try {
            const eventDate = new Date(dateString);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return eventDate >= today;
        } catch {
            return false;
        }
    };

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-blue-900/90"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-block mb-4 px-4 py-2 bg-blue-800/50 backdrop-blur-sm rounded-full border border-blue-600">
                        <span className="text-sm font-semibold text-blue-100">Events & Festivals</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Upcoming Events</h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                        Join us for exciting events, competitions, and celebrations throughout the year.
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
                                placeholder="Search events by title, description, organizer, venue, or department..."
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
                                {eventTypes.map((type) => (
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
                                Showing <span className="font-semibold text-blue-600">{events.length}</span> event{events.length !== 1 ? 's' : ''}
                                {allEvents.length > 0 && (
                                    <span> out of {allEvents.length} total</span>
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
                    ) : events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event, index) => {
                                const Icon = getActivityTypeIcon(event.type);
                                const upcoming = isUpcoming(event.activity_date || event.date);
                                return (
                                    <div
                                        key={event.id || event._id || index}
                                        className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-blue-100 hover:border-blue-500"
                                    >
                                        {/* Event Image or Icon */}
                                        {event.images && event.images.length > 0 ? (
                                            <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden">
                                                <img
                                                    src={getImageUrl(event.images[0])}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                {upcoming && (
                                                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                        Upcoming
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                                                    <span className="text-xs font-bold text-white capitalize">{event.type || 'Event'}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`h-48 bg-gradient-to-br ${getActivityTypeColor(event.type)} flex items-center justify-center relative overflow-hidden`}>
                                                <Icon className="h-16 w-16 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                                                {upcoming && (
                                                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                        Upcoming
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                                                    <span className="text-xs font-bold text-white capitalize">{event.type || 'Event'}</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {event.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-5 leading-relaxed line-clamp-3">
                                                {event.description}
                                            </p>
                                            
                                            {/* Event Details */}
                                            <div className="space-y-2.5 mb-5">
                                                {event.venue && (
                                                    <div className="flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                                                        <FaMapMarkerAlt className="h-4 w-4 mr-2 text-blue-600" />
                                                        <span className="font-medium">{event.venue}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                                                    <FaCalendarAlt className="h-4 w-4 mr-2 text-blue-600" />
                                                    <div>
                                                        <span className="font-medium">{formatDate(event.activity_date || event.date)}</span>
                                                        {formatTime(event.activity_date || event.date) && (
                                                            <span className="text-gray-500 ml-2">• {formatTime(event.activity_date || event.date)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {event.organizer && (
                                                    <div className="flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                                                        <FaUsers className="h-4 w-4 mr-2 text-blue-600" />
                                                        <span className="font-medium">Organizer: {event.organizer}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Footer */}
                                            <div className="pt-4 border-t border-blue-100 flex items-center justify-between">
                                                {event.department && (
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">
                                                        {event.department}
                                                    </span>
                                                )}
                                                {event.attendees_count > 0 && (
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <FaUsers className="h-3 w-3 mr-1" />
                                                        <span className="font-medium">{event.attendees_count} participant{event.attendees_count !== 1 ? 's' : ''}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border-2 border-blue-100">
                            <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaCalendarAlt className="h-12 w-12 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Events Found</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                {searchQuery || selectedDept !== 'all' || selectedType !== 'all'
                                    ? `No events match your current filters. Try adjusting your search or filters.`
                                    : 'Check back soon for upcoming events!'}
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

export default Events;
