import React, { useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiPlus, FiSearch, FiFilter, FiRefreshCw, FiEye, FiUsers, FiLoader } from 'react-icons/fi';
import adminService from '../../services/adminService';
import { api } from '../../services/authService';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';
import Badge from '../../components/admin/Badge';
import Modal from '../../components/admin/Modal';
import LoadingScreen from '../../components/admin/LoadingScreen';
import { getImageUrl } from '../../utils/imageUtils';

const Events = () => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ department: '', type: '', year: '', search: '' });
  const [selected, setSelected] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    type: 'academic',
    department: '',
    year: new Date().getFullYear(),
    date: '',
    organizer: '',
    venue: ''
  });
  const [isVisible, setIsVisible] = useState({});

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
    // Filter for admin-created activities only
    const cleanParams = { 
      skip: (page - 1) * 20, 
      limit: 20,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      )
    };
    return cleanParams;
  }, [page, filters]);

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
      
      // Filter for admin-created activities only
      const adminEvents = (list.activities || []).filter(a => a.is_admin_created === true);
      
      // Add attendees count from the event data
      const eventsWithAttendees = adminEvents.map(event => ({
        ...event,
        attendees: event.attendees || [],
        attendees_count: (event.attendees || []).length
      }));
      
      setEvents(eventsWithAttendees);
      setTotal(eventsWithAttendees.length);
    } catch (e) {
      console.error('Failed to load:', e);
      toast.error('Failed to load events');
      setEvents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, [params]);

  const onFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const loadAttendees = async (eventId) => {
    try {
      setLoadingAttendees(true);
      const response = await api.get(`/api/v1/events/${eventId}/attendees`);
      setAttendees(response.data.attendees || []);
    } catch (error) {
      console.error('Error loading attendees:', error);
      toast.error('Failed to load attendees');
      setAttendees([]);
    } finally {
      setLoadingAttendees(false);
    }
  };

  const handleViewEvent = async (event) => {
    setSelected(event);
    if (event.id || event._id) {
      await loadAttendees(event.id || event._id);
    }
  };

  const handleCreateEvent = async () => {
    if (!createForm.title || !createForm.description || !createForm.department) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Validate year - cannot be in the past
    const currentYear = new Date().getFullYear();
    if (createForm.year < currentYear) {
      toast.error(`Year cannot be in the past. Please select ${currentYear} or later.`);
      return;
    }
    
    // Validate date - cannot be in the past
    if (createForm.date) {
      const selectedDate = new Date(createForm.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      
      if (selectedDate < today) {
        toast.error('Event date cannot be in the past. Please select today or a future date.');
        return;
      }
    }
    
    try {
      await adminService.createActivity(createForm);
      toast.success('Event created successfully!');
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        type: 'academic',
        department: '',
        year: new Date().getFullYear(),
        date: '',
        organizer: '',
        venue: ''
      });
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create event');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div 
        data-animate
        id="events-hero"
        className={`relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-3xl shadow-2xl p-8 transition-all duration-1000 ${isVisible['events-hero'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                  Admin • Events
                </span>
                <span className="px-3 py-1 bg-blue-600/30 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center border border-blue-400/30">
                  <FiCalendar className="mr-1.5 h-3 w-3" />
                  {total} Total
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Event Management</h1>
              <p className="text-blue-100 text-lg">Create and manage institution events and festivals</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <FiPlus className="h-5 w-5" />
                <span>Create Event</span>
              </button>
              <button 
                onClick={load} 
                className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                aria-label="Refresh events"
              >
                <FiRefreshCw className="h-5 w-5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div 
        data-animate
        id="events-filters"
        className={`relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-1000 delay-200 ${isVisible['events-filters'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiFilter className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => onFilter('search', e.target.value)}
                  placeholder="Search by title..."
                  className="w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
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
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics and Telecommunication Engineering">Electronics and Telecommunication Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Automobile Engineering">Automobile Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Instrumentation Engineering">Instrumentation Engineering</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input type="number" value={filters.year} onChange={(e) => onFilter('year', e.target.value)} placeholder="e.g., 2024" className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div 
        data-animate
        id="events-table"
        className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-1000 delay-300 hover:shadow-xl ${isVisible['events-table'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        {loading && events.length === 0 ? (
          <LoadingScreen message="Loading events..." />
        ) : events.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Venue</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Attendees</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {events.map((event) => {
                    const eventId = event.id || event._id;
                    return (
                    <tr key={eventId} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{event.title}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{event.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                          {event.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{event.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {event.activity_date ? new Date(event.activity_date).toLocaleDateString() : 
                         event.date ? new Date(event.date).toLocaleDateString() : 
                         'Not set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{event.venue || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <FiUsers className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-900">{event.attendees_count || event.attendees?.length || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewEvent(event)} 
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all" 
                            title="View Details & Attendees"
                          >
                            <FiEye className="h-4 w-4 inline mr-1" />
                            View
                          </button>
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
              <FiCalendar className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
            <p className="text-sm text-gray-500 mb-8">Get started by creating your first event</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 space-x-2"
            >
              <FiPlus className="h-5 w-5" />
              <span>Create Event</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <Modal 
          title="Create New Event" 
          onClose={() => {
            setShowCreateModal(false);
            setCreateForm({
              title: '',
              description: '',
              type: 'academic',
              department: '',
              year: new Date().getFullYear(),
              date: '',
              organizer: '',
              venue: ''
            });
          }}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title *</label>
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                placeholder="e.g., Annual Technical Festival"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                placeholder="Describe the event..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({...createForm, type: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="academic">Academic</option>
                  <option value="technical">Technical</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="social">Social</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                <select
                  value={createForm.department}
                  onChange={(e) => setCreateForm({...createForm, department: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics and Telecommunication Engineering">Electronics and Telecommunication Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Automobile Engineering">Automobile Engineering</option>
                  <option value="Chemical Engineering">Chemical Engineering</option>
                  <option value="Instrumentation Engineering">Instrumentation Engineering</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year *</label>
                <input
                  type="number"
                  min={new Date().getFullYear()}
                  value={createForm.year}
                  onChange={(e) => {
                    const year = parseInt(e.target.value) || new Date().getFullYear();
                    if (year >= new Date().getFullYear()) {
                      setCreateForm({...createForm, year});
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: {new Date().getFullYear()}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={createForm.date}
                  onChange={(e) => setCreateForm({...createForm, date: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Cannot select past dates</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Organizer</label>
                <input
                  type="text"
                  value={createForm.organizer}
                  onChange={(e) => setCreateForm({...createForm, organizer: e.target.value})}
                  placeholder="Event organizer"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Venue</label>
                <input
                  type="text"
                  value={createForm.venue}
                  onChange={(e) => setCreateForm({...createForm, venue: e.target.value})}
                  placeholder="Event venue"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({
                    title: '',
                    description: '',
                    type: 'academic',
                    department: '',
                    year: new Date().getFullYear(),
                    date: '',
                    organizer: '',
                    venue: ''
                  });
                }}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:shadow-lg transition-all"
              >
                Create Event
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Event Details Modal with Attendees */}
      {selected && (
        <Modal 
          title={
            <div className="flex items-center justify-between w-full">
              <span>{selected.title}</span>
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 rounded-full">
                <FiUsers className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">{attendees.length} Attendees</span>
              </div>
            </div>
          }
          onClose={() => {
            setSelected(null);
            setAttendees([]);
          }}
          size="xl"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</h4>
              <p className="text-gray-700 leading-relaxed">{selected.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Type</span>
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
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date</span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {selected.activity_date ? new Date(selected.activity_date).toLocaleDateString() : 
                   selected.date ? new Date(selected.date).toLocaleDateString() : 
                   'Not set'}
                </p>
              </div>
              {selected.venue && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Venue</span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selected.venue}</p>
                </div>
              )}
              {selected.organizer && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Organizer</span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selected.organizer}</p>
                </div>
              )}
            </div>

            {/* Attendees Section */}
            <div className="border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center">
                  <FiUsers className="h-4 w-4 mr-2 text-blue-600" />
                  Attendees ({attendees.length})
                </h4>
              </div>
              {loadingAttendees ? (
                <div className="flex items-center justify-center py-8">
                  <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : attendees.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {attendee.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{attendee.name}</p>
                          <p className="text-xs text-gray-500 truncate">{attendee.email}</p>
                          {attendee.department && (
                            <p className="text-xs text-gray-400 truncate">{attendee.department}</p>
                          )}
                        </div>
                      </div>
                      {attendee.student_id && (
                        <div className="text-xs text-gray-500 font-medium flex-shrink-0 ml-3">
                          ID: {attendee.student_id}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiUsers className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">No attendees yet</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Events;

