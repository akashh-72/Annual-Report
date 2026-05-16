import React, { useState, useEffect } from 'react';
import { FaTrophy, FaAward, FaRocket, FaLightbulb, FaGraduationCap, FaBuilding } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import axios from 'axios';

const AchievementsSection = ({ isVisible }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      // Fetch admin-created public activities (institution achievements)
      const response = await axios.get(`${API_BASE_URL}/api/v1/activities/public`, {
        params: { 
          page: 1, 
          size: 20 
        }
      });
      
      // Filter for admin-created activities only (institution achievements)
      const adminActivities = (response.data?.activities || [])
        .filter(activity => activity.is_admin_created === true)
        .slice(0, 4) // Show max 4
        .map(activity => {
          // Map activity type to achievement category
          const typeToCategory = {
            academic: 'Accreditation',
            technical: 'Recognition',
            social: 'Placement',
            cultural: 'Research',
            sports: 'Recognition'
          };
          
          const category = typeToCategory[activity.type] || 'Recognition';
          
          // Map category to icon
          const categoryIcons = {
            Accreditation: FaTrophy,
            Recognition: FaAward,
            Placement: FaRocket,
            Research: FaLightbulb
          };
          
          return {
            id: activity.id || activity._id,
            title: activity.title,
            description: activity.description,
            icon: categoryIcons[category] || FaAward,
            year: activity.year?.toString() || new Date(activity.created_at).getFullYear().toString(),
            category: category,
            type: activity.type
          };
        });
      
      // If we have admin activities, use them; otherwise show default achievements
      if (adminActivities.length > 0) {
        setAchievements(adminActivities);
      } else {
        // Fallback to default achievements if no admin-created activities exist
        setAchievements([
          {
            id: 1,
            title: "NAAC 'A' Grade Accreditation",
            description: "Recognized for excellence in education and infrastructure",
            icon: FaTrophy,
            year: "2023",
            category: "Accreditation"
          },
          {
            id: 2,
            title: "Best Engineering College Award",
            description: "Awarded by Maharashtra State Government",
            icon: FaAward,
            year: "2022",
            category: "Recognition"
          },
          {
            id: 3,
            title: "100% Placement Record",
            description: "Outstanding placement achievements across all branches",
            icon: FaRocket,
            year: "2023",
            category: "Placement"
          },
          {
            id: 4,
            title: "Research Excellence",
            description: "Multiple research papers published in international journals",
            icon: FaLightbulb,
            year: "2023",
            category: "Research"
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      // On error, show default achievements
      setAchievements([
        {
          id: 1,
          title: "NAAC 'A' Grade Accreditation",
          description: "Recognized for excellence in education and infrastructure",
          icon: FaTrophy,
          year: "2023",
          category: "Accreditation"
        },
        {
          id: 2,
          title: "Best Engineering College Award",
          description: "Awarded by Maharashtra State Government",
          icon: FaAward,
          year: "2022",
          category: "Recognition"
        },
        {
          id: 3,
          title: "100% Placement Record",
          description: "Outstanding placement achievements across all branches",
          icon: FaRocket,
          year: "2023",
          category: "Placement"
        },
        {
          id: 4,
          title: "Research Excellence",
          description: "Multiple research papers published in international journals",
          icon: FaLightbulb,
          year: "2023",
          category: "Research"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    Accreditation: 'from-blue-500 to-blue-600',
    Recognition: 'from-green-500 to-green-600',
    Placement: 'from-purple-500 to-purple-600',
    Research: 'from-orange-500 to-orange-600'
  };
  
  const bgColors = {
    Accreditation: 'from-blue-50 to-blue-100',
    Recognition: 'from-green-50 to-green-100',
    Placement: 'from-purple-50 to-purple-100',
    Research: 'from-orange-50 to-orange-100'
  };

  return (
    <section id="achievements" className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          data-animate
          className={`text-center mb-12 lg:mb-16 transition-all duration-1000 ${isVisible['achievements-title'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          id="achievements-title"
        >
          <div className="inline-block mb-4 px-4 py-2 bg-yellow-100 rounded-full">
            <span className="text-sm font-semibold text-yellow-700">Milestones</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Our Achievements</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Celebrating our milestones and recognition in the field of engineering education.
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="w-14 h-14 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-24"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div 
                  key={achievement.id || index}
                  data-animate
                  className={`group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-blue-200 ${isVisible[`achievement-${achievement.id || index}`] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  id={`achievement-${achievement.id || index}`}
                >
                  <div className={`bg-gradient-to-br ${colors[achievement.category] || 'from-gray-500 to-gray-600'} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${bgColors[achievement.category] || 'from-gray-50 to-gray-100'} text-gray-700 mb-3`}>
                    {achievement.category}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{achievement.description}</p>
                  <div className="text-sm font-semibold text-gray-500">{achievement.year}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaAward className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Achievements Available</h3>
            <p className="text-gray-600">Check back soon for institution achievements!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AchievementsSection;
