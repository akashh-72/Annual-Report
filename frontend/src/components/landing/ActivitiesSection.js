import React, { useEffect, useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { FiImage as FiImg, FiUser } from 'react-icons/fi';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtils';

const ActivitiesSection = ({ isVisible }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        console.log('[ActivitiesSection] Fetching from:', `${API_BASE_URL}/api/v1/activities/public`);
        
        const response = await axios.get(`${API_BASE_URL}/api/v1/activities/public`, {
          params: { page: 1, size: 8 }  // Show more achievements
        });
        
        console.log('[ActivitiesSection] Full response:', response);
        console.log('[ActivitiesSection] Response data:', response.data);
        console.log('[ActivitiesSection] Activities array:', response.data?.activities);
        console.log('[ActivitiesSection] Activities count:', response.data?.activities?.length || 0);
        
        const activitiesList = response.data?.activities || response.data?.items || [];
        console.log('[ActivitiesSection] Setting activities:', activitiesList.length);
        
        if (activitiesList.length > 0) {
          setActivities(activitiesList);
        } else {
          console.warn('[ActivitiesSection] No activities found in response, keeping empty array');
          setActivities([]);
        }
      } catch (error) {
        console.error('[ActivitiesSection] Error loading public activities:', error);
        console.error('[ActivitiesSection] Error status:', error.response?.status);
        console.error('[ActivitiesSection] Error response data:', error.response?.data);
        console.error('[ActivitiesSection] Error message:', error.message);
        // Don't set fallback - show empty state instead
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  // Map activities to display format - ONLY show real data from API
  const displayActivities = activities.map(a => {
        console.log('[ActivitiesSection] Processing activity:', a);
        // Handle both string and enum types
        const activityType = typeof a.type === 'string' ? a.type : (a.type?.value || a.type || 'general');
        return {
          id: a.id || a._id || `activity-${Math.random()}`,
          title: a.title || 'Untitled Achievement',
          description: a.description || 'No description available',
          type: activityType,
          category: activityType ? activityType.charAt(0).toUpperCase() + activityType.slice(1) : "General",
          status: a.status === 'accepted' || a.status === 'Accepted' ? 'Active' : 'Pending',
          images: a.images || [],
          user_name: a.user_name || 'Student',
          department: a.department || '',
          year: a.year || new Date().getFullYear(),
          created_at: a.created_at
        };
      });

  const getCategoryColor = (category) => {
    const colors = {
      Technical: 'from-blue-500 to-indigo-600',
      Cultural: 'from-pink-500 to-rose-600',
      Social: 'from-green-500 to-emerald-600',
      Academic: 'from-purple-500 to-violet-600',
      Sports: 'from-orange-500 to-red-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <section id="activities" className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          data-animate
          className={`text-center mb-12 lg:mb-16 transition-all duration-1000 ${isVisible['activities-title'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          id="activities-title"
        >
          <div className="inline-block mb-4 px-4 py-2 bg-green-100 rounded-full">
            <span className="text-sm font-semibold text-green-700">Student Achievements</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Approved Student Achievements</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the outstanding achievements and accomplishments of our students across various fields and disciplines.
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayActivities.map((activity, index) => {
            // Get first image if available
            const firstImage = activity.images && activity.images.length > 0 
              ? getImageUrl(activity.images[0])
              : null;
            
            return (
              <div 
                key={activity.id || index}
                data-animate
                className={`group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${isVisible[`activity-${activity.id || index}`] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                id={`activity-${activity.id || index}`}
              >
                {/* Image Section */}
                {firstImage ? (
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={firstImage}
                      alt={activity.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent hidden items-end p-4">
                      <FiImg className="h-6 w-6 text-white" />
                    </div>
                    {activity.images && activity.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <FiImg className="h-3 w-3 mr-1" />
                        {activity.images.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                    <FiImg className="h-12 w-12 text-blue-400" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getCategoryColor(activity.category)} text-white`}>
                      {activity.category}
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      <span className="text-xs font-semibold text-green-600">{activity.status}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                    {activity.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                    {activity.description}
                  </p>
                  
                  {/* Student Info */}
                  {activity.user_name && (
                    <div className="flex items-center text-xs text-gray-500 mb-3 bg-gray-50 px-3 py-2 rounded-lg">
                      <FiUser className="h-3 w-3 mr-2 text-blue-600" />
                      <span className="font-medium">{activity.user_name}</span>
                      {activity.department && (
                        <span className="ml-2 text-gray-400">• {activity.department}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Year */}
                  {activity.year && (
                    <div className="text-xs font-semibold text-gray-400">
                      Year {activity.year}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiImg className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
            <p className="text-gray-600">Check back soon for approved student achievements!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivitiesSection;
