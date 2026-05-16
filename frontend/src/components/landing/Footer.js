import React from 'react';
import { 
  FaGraduationCap,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl mr-3">
                <FaGraduationCap className="h-7 w-7 text-white" />
              </div>
              <span className="text-xl font-bold">TKIET Warananagar</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed text-sm">
              Tatyasaheb Kore Institute of Engineering & Technology (An Autonomous Institute). 
              Empowering minds, shaping futures through excellence in engineering education.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#about" className="text-gray-400 hover:text-blue-400 transition-colors font-medium">About Us</a></li>
              <li><a href="#achievements" className="text-gray-400 hover:text-blue-400 transition-colors font-medium">Programs</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-blue-400 transition-colors font-medium">Admissions</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-blue-400 transition-colors font-medium">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Programs</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors font-medium">Computer Science</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors font-medium">Mechanical Engineering</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors font-medium">Electronics & Communication</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors font-medium">Civil Engineering</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Connect</h3>
            <div className="flex space-x-3 mb-6">
              <a href="#" className="bg-gray-800 hover:bg-blue-600 p-3 rounded-xl text-gray-300 hover:text-white transition-all transform hover:scale-110">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-blue-600 p-3 rounded-xl text-gray-300 hover:text-white transition-all transform hover:scale-110">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-pink-600 p-3 rounded-xl text-gray-300 hover:text-white transition-all transform hover:scale-110">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-blue-700 p-3 rounded-xl text-gray-300 hover:text-white transition-all transform hover:scale-110">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
            <p className="text-gray-400 text-sm font-medium">
              © 2024 TKIET Warananagar. All rights reserved.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Made with ❤️ for TKIET Warananagar Community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
