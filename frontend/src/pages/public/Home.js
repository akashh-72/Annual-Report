import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiArrowRight, 
  FiAward, 
  FiBook, 
  FiCalendar, 
  FiCheckCircle, 
  FiCpu, 
  FiGlobe, 
  FiMail, 
  FiMapPin, 
  FiPhone, 
  FiStar, 
  FiTrendingUp, 
  FiUsers,
  FiZap
} from 'react-icons/fi';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtils';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import StudentDashboard from '../../components/landing/StudentDashboard';

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState({});
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/activities/public?page=1&size=6`);
        setAchievements(response.data?.activities || []);
      } catch (error) {
        console.error('Error loading public data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (!user || user.role !== 'student') {
        loadData();
    }
  }, [API_BASE_URL, user]);

  // Intersection Observer for animations (for StudentDashboard)
  useEffect(() => {
    if (user && user.role === 'student') {
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
    }
  }, [user]);

  // If user is authenticated and is a student, show StudentDashboard as their main view
  if (!authLoading && user && user.role === 'student') {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <StudentDashboard isVisible={isVisible} />
        </div>
    );
  }

  const stats = [
    { label: 'Students Enrolled', value: '5,000+', icon: FiUsers, color: 'text-blue-600' },
    { label: 'Academic Awards', value: '450+', icon: FiAward, color: 'text-indigo-600' },
    { label: 'International Tie-ups', value: '12+', icon: FiGlobe, color: 'text-cyan-600' },
    { label: 'Placement Rate', value: '98%', icon: FiTrendingUp, color: 'text-emerald-600' },
  ];

  const features = [
    { 
      title: 'Academic Excellence', 
      desc: 'Our curriculum is designed to challenge and inspire the next generation of engineers.',
      icon: FiBook,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      title: 'Smart Moderation', 
      desc: 'Advanced local AI ensures all shared achievements meet professional and ethical standards.',
      icon: FiZap,
      bg: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    { 
      title: 'Verified Certificates', 
      desc: 'Automated OCR validation confirms the authenticity of every uploaded certificate.',
      icon: FiCheckCircle,
      bg: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar transparent={true} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[120%] bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm mb-6">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2" />
              <span className="text-sm font-semibold text-indigo-900 uppercase tracking-wider">Engineering Excellence</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
              Celebrating <span className="text-gradient">Student Success</span> & Innovation
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-600 leading-relaxed mb-10">
              The official TKIET Achievement Portal. A dedicated space to showcase, 
              verify, and celebrate the remarkable milestones of our engineering community.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:scale-[1.02] active:scale-95 btn-premium">
                Create Portfolio
              </Link>
              <Link to="/achievements" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg shadow-sm hover:bg-slate-50 transition-all transform hover:scale-[1.02] active:scale-95">
                Public Gallery
              </Link>
            </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="glass-morphism p-6 rounded-3xl border border-white/50 flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-white shadow-sm ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">Integrity in Recognition</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">We use state-of-the-art automation to ensure every achievement is authentic and visible.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all hover:bg-slate-50 group">
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Achievements */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">Latest Accomplishments</h2>
              <p className="text-lg text-slate-600">Discover what our students have been up to recently.</p>
            </div>
            <Link to="/achievements" className="flex items-center gap-2 font-bold text-indigo-600 hover:gap-3 transition-all">
              View Global Hall of Fame <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[400px] bg-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {achievements.length > 0 ? achievements.map((achievement, idx) => (
                <div key={idx} className="card-premium group overflow-hidden">
                  <div className="h-56 relative overflow-hidden bg-slate-200">
                    {achievement.images?.[0] ? (
                      <img 
                        src={getImageUrl(achievement.images[0])} 
                        alt={achievement.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FiAward className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-indigo-600 shadow-sm uppercase tracking-widest">
                        {achievement.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                      {achievement.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {achievement.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-[10px] text-indigo-600 border border-indigo-100">
                                {achievement.user_name?.charAt(0) || 'S'}
                            </div>
                            <span className="text-xs font-bold text-slate-700">{achievement.user_name || 'Student'}</span>
                        </div>
                        <span className="text-xs font-black text-slate-400">{achievement.year}</span>
                    </div>
                  </div>
                </div>
              )) : (
                  <div className="col-span-full py-12 text-center text-slate-400 italic">
                      No public achievements available at the moment.
                  </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 pt-20 pb-10 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-slate-800 pb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 text-white mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <FiStar className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tight">TKIET <span className="text-indigo-500">Portal</span></span>
              </div>
              <p className="max-w-md text-lg leading-relaxed mb-8">
                  Empowering the technical leaders of tomorrow through innovation, 
                  recognition, and ethical transparency.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Directory</h4>
              <ul className="space-y-4 font-medium text-sm">
                <li><Link to="/achievements" className="hover:text-white transition-colors">Hall of Fame</Link></li>
                <li><Link to="/events" className="hover:text-white transition-colors">Campus Events</Link></li>
                <li><Link to="/departments" className="hover:text-white transition-colors">Academic Depts</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Apply Now</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Assistance</h4>
              <ul className="space-y-4 font-medium text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy & Data</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Developer API</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between text-xs font-bold uppercase tracking-widest gap-4">
            <div>&copy; {new Date().getFullYear()} TKIET Warananagar</div>
            <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Facebook</a>
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
