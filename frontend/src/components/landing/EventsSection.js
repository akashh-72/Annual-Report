import React, { useState, useEffect } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { FiLoader, FiCalendar } from 'react-icons/fi';
import axios from 'axios';

const EventsSection = ({ isVisible }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      // Fetch admin-created public activities (these are events)
      const response = await axios.get(`${API_BASE_URL}/api/v1/activities/public`, {
        params: { 
          page: 1, 
          size: 20 
        }
      });
      
      // Filter for admin-created activities and format as events
      const adminEvents = (response.data?.activities || [])
        .filter(activity => activity.is_admin_created === true)
        .slice(0, 4) // Show max 4 events
        .map(activity => {
          // Format date
          let dateStr = 'Ongoing';
          if (activity.activity_date) {
            const date = new Date(activity.activity_date);
            dateStr = date.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            });
          } else if (activity.organizer) {
            // If there's an organizer, it might be a recurring event
            dateStr = 'Ongoing';
          } else {
            // Use created date as fallback
            const date = new Date(activity.created_at);
            dateStr = date.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            });
          }
          
          // Capitalize type
          const type = activity.type 
            ? activity.type.charAt(0).toUpperCase() + activity.type.slice(1)
            : 'Event';
          
          return {
            id: activity.id || activity._id,
            title: activity.title,
            date: dateStr,
            description: activity.description,
            type: type,
            venue: activity.venue,
            organizer: activity.organizer
          };
        });
      
      // If we have admin events, use them; otherwise show default events
      if (adminEvents.length > 0) {
        setEvents(adminEvents);
      } else {
        // Fallback to default events if no admin-created activities exist
        setEvents([
          {
            id: 1,
            title: "Annual Technical Festival - TechFest 2024",
            date: "March 15-17, 2024",
            description: "Three days of technical competitions, workshops, and exhibitions",
            type: "Technical"
          },
          {
            id: 2,
            title: "Cultural Festival - Utsav 2024",
            date: "February 20-22, 2024",
            description: "Celebrating arts, music, dance, and cultural diversity",
            type: "Cultural"
          },
          {
            id: 3,
            title: "Sports Week 2024",
            date: "January 10-15, 2024",
            description: "Inter-college sports competitions and athletic events",
            type: "Sports"
          },
          {
            id: 4,
            title: "Industry Expert Lecture Series",
            date: "Ongoing",
            description: "Regular sessions with industry leaders and experts",
            type: "Academic"
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      // On error, show default events
      setEvents([
        {
          id: 1,
          title: "Annual Technical Festival - TechFest 2024",
          date: "March 15-17, 2024",
          description: "Three days of technical competitions, workshops, and exhibitions",
          type: "Technical"
        },
        {
          id: 2,
          title: "Cultural Festival - Utsav 2024",
          date: "February 20-22, 2024",
          description: "Celebrating arts, music, dance, and cultural diversity",
          type: "Cultural"
        },
        {
          id: 3,
          title: "Sports Week 2024",
          date: "January 10-15, 2024",
          description: "Inter-college sports competitions and athletic events",
          type: "Sports"
        },
        {
          id: 4,
          title: "Industry Expert Lecture Series",
          date: "Ongoin",
          description: "Regular sessions with industry leaders and experts",
          type: "Academic"
        }
      ]);
    } finally {
      setLoading(false);
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

  return (
    <section id="events" className="py-16 lg:py-24 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          data-animate
          className={`text-center mb-12 lg:mb-16 transition-all duration-1000 ${isVisible['events-title'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          id="events-title"
        >
          <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 rounded-full">
            <span className="text-sm font-semibold text-indigo-700">Events & Festivals</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join us for exciting events, competitions, and celebrations throughout the year.
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4 w-20"></div>
                  <div className="h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event, index) => (
              <div 
                key={event.id || index}
                data-animate
                className={`group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-indigo-200 ${isVisible[`event-${event.id || index}`] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                id={`event-${event.id || index}`}
              >
                <div className={`h-40 bg-gradient-to-br ${getEventTypeColor(event.type)} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                  <FaCalendarAlt className="h-16 w-16 text-white relative z-10 group-hover:scale-110 transition-transform" />
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                    <span className="text-xs font-bold text-white">{event.type}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                    {event.description}
                  </p>
                  {event.venue && (
                    <p className="text-xs text-gray-500 mb-3">
                      <span className="font-semibold">Venue:</span> {event.venue}
                    </p>
                  )}
                  {event.organizer && (
                    <p className="text-xs text-gray-500 mb-3">
                      <span className="font-semibold">Organizer:</span> {event.organizer}
                    </p>
                  )}
                  <div className="flex items-center text-sm font-semibold text-gray-500">
                    <FiCalendar className="w-4 h-4 mr-2 text-indigo-600" />
                    {event.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaCalendarAlt className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Available</h3>
            <p className="text-gray-600">Check back soon for upcoming events!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
