import React from 'react';
import { FaRocket, FaLightbulb, FaHandsHelping } from 'react-icons/fa';

const AboutSection = ({ isVisible }) => {
  return (
    <section id="about" className="py-16 lg:py-24 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          data-animate
          className={`text-center mb-12 lg:mb-16 transition-all duration-1000 ${isVisible['about-title'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          id="about-title"
        >
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
            <span className="text-sm font-semibold text-blue-700">About Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">TKIET Warananagar</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Tatyasaheb Kore Institute of Engineering & Technology (An Autonomous Institute) 
            has been at the forefront of academic excellence, providing world-class engineering 
            education with a commitment to innovation and student success.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div 
            data-animate
            className={`group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${isVisible['about-mission'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            id="about-mission"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <FaRocket className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To provide quality engineering education and develop competent professionals 
              who can contribute to society and industry through innovation and excellence.
            </p>
          </div>
          
          <div 
            data-animate
            className={`group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${isVisible['about-vision'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            id="about-vision"
          >
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <FaLightbulb className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To be a leading autonomous institution in engineering education, 
              research, and innovation that shapes the future of technology and society.
            </p>
          </div>
          
          <div 
            data-animate
            className={`group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${isVisible['about-values'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            id="about-values"
          >
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <FaHandsHelping className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Values</h3>
            <p className="text-gray-600 leading-relaxed">
              Excellence, integrity, innovation, autonomy, and commitment to 
              student success, research, and community development.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
