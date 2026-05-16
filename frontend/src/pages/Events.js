import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiCalendar, 
  FiMapPin, 
  FiUsers, 
  FiClock, 
  FiTag, 
  FiCheckCircle, 
  FiXCircle,
  FiLoader,
  FiSearch,
  FiFilter,
  FiArrowRight,
  FiX,
  FiPhone,
  FiMessageSquare
} from 'react-icons/fi';
import { api } from '../services/authService';
import toast from 'react-hot-toast';

const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ type: '', department: '', search: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [enrollForm, setEnrollForm] = useState({
    phone: '',
    reason: ''
  });
  const [enrolling, setEnrolling] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    // Debounce search input
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    const timeout = filters.search ? 500 : 0; // 500ms delay for search, immediate for other filters
    
    searchTimeoutRef.current = setTimeout(() => {
      loadEvents();
    }, timeout);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.type, filters.department, filters.search]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/events/upcoming', {
        params: {
          page,
          size: 12,
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
          )
        }
      });
      
      setEvents(response.data.events || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (event) => {
    setSelectedEvent(event);
    setEnrollForm({
      phone: user?.phone || '',
      reason: ''
    });
    setShowEnrollDialog(true);
  };

  const handleEnroll = async () => {
    if (!selectedEvent) return;
    
    if (!enrollForm.phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    
    if (!enrollForm.reason.trim()) {
      toast.error('Please provide a reason for participation');
      return;
    }

    try {
      setEnrolling(true);
      await api.post(`/api/v1/events/${selectedEvent.id}/enroll`, {
        phone: enrollForm.phone.trim(),
        reason: enrollForm.reason.trim()
      });
      toast.success('Successfully enrolled in event!');
      setShowEnrollDialog(false);
      setSelectedEvent(null);
      loadEvents(); // Reload to update enrollment status
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to enroll in event';
      toast.error(message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (eventId) => {
    try {
      await api.post(`/api/v1/events/${eventId}/unenroll`);
      toast.success('Successfully unenrolled from event');
      loadEvents(); // Reload to update enrollment status
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to unenroll from event';
      toast.error(message);
    }
  };

  const getEventTypeColor = (type) => {
    const typeLower = type?.toLowerCase() || '';
    const colors = {
      technical: 'from-blue-500 to-indigo-600',
      cultural: 'from-pink-500 to-rose-600',
      sports: 'from-green-500 to-emerald-600',
      academic: 'from-purple-500 to-violet-600',
      social: 'from-orange-500 to-amber-600'
    };
    return colors[typeLower] || 'from-gray-500 to-gray-600';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Date TBA';
    }
  };

  const isUpcoming = (dateString) => {
    if (!dateString) return true;
    try {
      const eventDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    } catch {
      return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Upcoming Events
              </h1>
              <p className="text-lg text-gray-600">
                Discover and enroll in exciting events and festivals at TKIET Warananagar
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FiFilter className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>
            {(filters.type || filters.department || filters.search) && (
              <button
                onClick={() => {
                  setFilters({ type: '', department: '', search: '' });
                  setPage(1);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <FiX className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({...filters, search: e.target.value});
                    setPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (searchTimeoutRef.current) {
                        clearTimeout(searchTimeoutRef.current);
                      }
                      loadEvents();
                    }
                  }}
                  placeholder="Search events..."
                  className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => {
                  setFilters({...filters, type: e.target.value});
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="">All Types</option>
                <option value="technical">Technical</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="academic">Academic</option>
                <option value="social">Social</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => {
                  setFilters({...filters, department: e.target.value});
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics and Telecommunication Engineering">Electronics and Telecommunication Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Automobile Engineering">Automobile Engineering</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FiLoader className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event) => {
              const eventDate = event.activity_date || event.date;
              const upcoming = isUpcoming(eventDate);
              
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all overflow-hidden"
                >
                  {/* Header with gradient */}
                  <div className={`h-32 bg-gradient-to-br ${getEventTypeColor(event.type)} relative`}>
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-white/30">
                        {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-xl font-bold text-white line-clamp-2">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[60px]">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      {eventDate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FiClock className="h-4 w-4 mr-2 text-indigo-600" />
                          <span>{formatDate(eventDate)}</span>
                          {!upcoming && (
                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              Past Event
                            </span>
                          )}
                        </div>
                      )}
                      {event.venue && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FiMapPin className="h-4 w-4 mr-2 text-indigo-600" />
                          <span>{event.venue}</span>
                        </div>
                      )}
                      {event.department && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FiTag className="h-4 w-4 mr-2 text-indigo-600" />
                          <span>{event.department}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <FiUsers className="h-4 w-4 mr-2 text-indigo-600" />
                        <span>{event.attendees_count || 0} enrolled</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => event.is_enrolled ? handleUnenroll(event.id) : handleEnrollClick(event)}
                      disabled={!upcoming}
                      className={`w-full py-3 rounded-xl font-bold transition-all ${
                        event.is_enrolled
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : upcoming
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {event.is_enrolled ? (
                        <span className="flex items-center justify-center">
                          <FiXCircle className="h-5 w-5 mr-2" />
                          Unenroll
                        </span>
                      ) : upcoming ? (
                        <span className="flex items-center justify-center">
                          <FiCheckCircle className="h-5 w-5 mr-2" />
                          Enroll Now
                        </span>
                      ) : (
                        'Event Ended'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
            <FiCalendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600">Check back later for upcoming events!</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Enrollment Dialog */}
      {showEnrollDialog && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Enroll in Event</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedEvent.title}</p>
              </div>
              <button
                onClick={() => {
                  setShowEnrollDialog(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    value={enrollForm.phone}
                    onChange={(e) => setEnrollForm({...enrollForm, phone: e.target.value})}
                    placeholder="Enter your phone number"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Participation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMessageSquare className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                  <textarea
                    value={enrollForm.reason}
                    onChange={(e) => setEnrollForm({...enrollForm, reason: e.target.value})}
                    placeholder="Tell us why you want to participate in this event..."
                    rows={4}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 20 characters</p>
              </div>

              {/* Event Info */}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <h4 className="text-sm font-semibold text-indigo-900 mb-2">Event Details</h4>
                <div className="space-y-1.5 text-sm text-indigo-700">
                  {selectedEvent.activity_date && (
                    <div className="flex items-center">
                      <FiClock className="h-4 w-4 mr-2" />
                      <span>{formatDate(selectedEvent.activity_date)}</span>
                    </div>
                  )}
                  {selectedEvent.venue && (
                    <div className="flex items-center">
                      <FiMapPin className="h-4 w-4 mr-2" />
                      <span>{selectedEvent.venue}</span>
                    </div>
                  )}
                  {selectedEvent.department && (
                    <div className="flex items-center">
                      <FiTag className="h-4 w-4 mr-2" />
                      <span>{selectedEvent.department}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowEnrollDialog(false);
                  setSelectedEvent(null);
                }}
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={enrolling || !enrollForm.phone.trim() || !enrollForm.reason.trim() || enrollForm.reason.trim().length < 20}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {enrolling ? (
                  <>
                    <FiLoader className="h-4 w-4 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="h-4 w-4 mr-2" />
                    Confirm Enrollment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;

