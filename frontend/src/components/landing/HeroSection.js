import React from 'react';
import { 
  FaUsers, 
  FaGraduationCap, 
  FaTrophy, 
  FaAward,
  FaChevronDown,
  FaPlay,
  FaArrowRight
} from 'react-icons/fa';
import heroImage from '../../images/hero.jpg';

const HeroSection = ({ isVisible, scrollToSection, user }) => {
  return (
    <section id="home" className="relative pt-16 min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-blue-900/80"></div>
        {/* Additional gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-blue-900/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Text Content */}
          <div 
            data-animate
            className={`transition-all duration-1000 ${isVisible['hero-text'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            id="hero-text"
          >
            {user ? (
              <>
                <div className="inline-block mb-4 px-4 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-full text-sm font-semibold">
                  Welcome Back
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Welcome back, <span className="text-yellow-400">{user.name}!</span>
                </h1>
                <p className="text-xl text-blue-50 mb-8 leading-relaxed">
                  Continue your journey of excellence at TKIET Warananagar. 
                  Share your achievements, track your progress, and showcase your growth.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => scrollToSection('dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    View Dashboard <FaArrowRight className="ml-2" />
                  </button>
                  <button 
                    onClick={() => scrollToSection('about')}
                    className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center"
                  >
                    <FaPlay className="mr-2" /> Explore More
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="inline-block mb-4 px-4 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-full text-sm font-semibold">
                  Excellence in Engineering Education
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Welcome to <span className="text-yellow-400">TKIET Warananagar</span>
                </h1>
                <p className="text-xl text-blue-50 mb-8 leading-relaxed">
                  Empowering minds, shaping futures. Discover excellence in engineering education 
                  with state-of-the-art facilities, experienced faculty, and a vibrant campus life.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => scrollToSection('about')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    Explore More <FaArrowRight className="ml-2" />
                  </button>
                  <button className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center">
                    <FaPlay className="mr-2" /> Watch Video
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Side - Stats Cards */}
          <div 
            data-animate
            className={`transition-all duration-1000 delay-300 ${isVisible['hero-image'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            id="hero-image"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center shadow-xl transform hover:scale-105 transition-all">
                <FaUsers className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                <div className="text-3xl font-bold text-gray-900">5000+</div>
                <div className="text-sm text-gray-600 font-medium">Students</div>
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center shadow-xl transform hover:scale-105 transition-all">
                <FaGraduationCap className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                <div className="text-3xl font-bold text-gray-900">15+</div>
                <div className="text-sm text-gray-600 font-medium">Programs</div>
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center shadow-xl transform hover:scale-105 transition-all">
                <FaTrophy className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                <div className="text-3xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600 font-medium">Placement</div>
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center shadow-xl transform hover:scale-105 transition-all">
                <FaAward className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                <div className="text-3xl font-bold text-gray-900">25+</div>
                <div className="text-sm text-gray-600 font-medium">Years</div>
              </div>
            </div>
            {/* NAAC Badge */}
            <div className="mt-6 flex justify-center">
              <div className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full text-sm font-bold shadow-lg">
                NAAC 'A' Grade
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <button 
          onClick={() => scrollToSection('about')}
          className="animate-bounce text-white hover:text-yellow-400 transition-colors bg-white/10 backdrop-blur-sm rounded-full p-3"
        >
          <FaChevronDown className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
