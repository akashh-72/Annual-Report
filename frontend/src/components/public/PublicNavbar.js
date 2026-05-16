import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaGraduationCap, FaBars, FaTimes, FaChevronDown, FaSearch } from 'react-icons/fa';

const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: 'Home', path: '/' },
    {
      name: 'About',
      path: '/about',
      dropdown: [
        { name: 'About Institute', path: '/about' }
      ]
    },
    {
      name: 'Academics',
      path: '/departments',
      dropdown: [
        { name: 'Departments', path: '/departments' }
      ]
    },
    
    {
      name: 'Student Life',
      path: '#',
      dropdown: [
        { name: 'Achievements', path: '/achievements' },
        { name: 'Events', path: '/events/public' },
        { name: 'Gallery', path: '/gallery' },
        
      ]
    },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white shadow-xl'
        : 'bg-white border-b-2 border-blue-100'
      }`}>
      {/* Top Bar - Subtle Header */}
      <div className="hidden lg:block bg-blue-900 text-white py-2 border-b border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-6 text-xs font-medium">
            <span className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              <span>AICTE Approved</span>
            </span>
            <span className="text-blue-500">|</span>
            <span className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              <span>NAAC Accredited 'A' Grade</span>
            </span>
            <span className="text-blue-500">|</span>
            <span className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              <span>NBA Accredited Programs</span>
            </span>
          </div>
          
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-700 p-2.5 rounded-lg group-hover:bg-blue-600 transition-all duration-300">
                <FaGraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900 leading-none tracking-tight">
                  TKIET
                </h1>
                <p className="text-xs text-blue-700 font-medium tracking-wider uppercase mt-0.5">Warananagar</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={item.path}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center transition-all duration-200 ${isActive(item.path)
                      ? 'text-white bg-blue-600 shadow-sm'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                >
                  {item.name}
                  {item.dropdown && <FaChevronDown className="ml-1 h-3 w-3 group-hover:rotate-180 transition-transform duration-200" />}
                </Link>

                {/* Dropdown Menu */}
                {item.dropdown && (
                  <div className={`absolute top-full left-0 w-56 pt-2 transition-all duration-200 transform origin-top-left ${activeDropdown === item.name
                      ? 'opacity-100 scale-100 visible'
                      : 'opacity-0 scale-95 invisible'
                    }`}>
                    <div className="bg-white rounded-lg shadow-xl border-2 border-blue-200 overflow-hidden py-2">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:text-white hover:bg-blue-600 transition-all duration-200 font-medium"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-white hover:bg-blue-600 border-2 border-blue-300 hover:border-blue-600 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              Apply Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t-2 border-blue-200 bg-white max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.path}
                    className={`block w-full text-left px-4 py-3 rounded-lg text-base font-bold transition-all ${isActive(item.path)
                        ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-md'
                        : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700'
                      }`}
                    onClick={() => !item.dropdown && setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <div className="pl-8 space-y-1 mt-1 border-l-2 border-blue-200 ml-4">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-white hover:bg-blue-600 rounded-lg font-medium transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="border-t-2 border-blue-200 pt-4 mt-4 space-y-2">
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-3 rounded-lg text-base font-bold text-blue-600 hover:text-white hover:bg-blue-600 border-2 border-blue-600 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white px-4 py-3 rounded-lg text-base font-bold shadow-lg transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
