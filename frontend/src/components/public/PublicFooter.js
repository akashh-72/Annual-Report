import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaChevronRight, FaYoutube } from 'react-icons/fa';

const PublicFooter = () => {
    return (
        <footer className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white relative overflow-hidden">
            {/* Decorative Top Wave */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
                <svg className="relative block w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    
                    {/* Column 1: About TKIET */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-blue-700 p-3 rounded-xl">
                                <FaGraduationCap className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">TKIET</h3>
                                <p className="text-blue-200 text-sm">Warananagar</p>
                            </div>
                        </div>
                        <p className="text-blue-100 mb-6 leading-relaxed">
                            A premier engineering institution committed to excellence in education, research, and innovation since 1983.
                        </p>
                        
                        {/* Accreditation badges */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <div className="bg-blue-800/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-600">
                                <span className="text-xs font-semibold text-blue-200">AICTE Approved</span>
                            </div>
                            <div className="bg-blue-800/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-600">
                                <span className="text-xs font-semibold text-blue-200">NAAC 'A' Grade</span>
                            </div>
                            <div className="bg-blue-800/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-600">
                                <span className="text-xs font-semibold text-blue-200">NBA Accredited</span>
                            </div>
                        </div>
                        
                        {/* Social Media */}
                        <div className="flex space-x-3">
                            <a href="#" className="w-10 h-10 rounded-lg bg-blue-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                                <FaFacebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-blue-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                                <FaLinkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-blue-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                                <FaTwitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-blue-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                                <FaInstagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-blue-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                                <FaYoutube className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                    
                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-blue-100 border-b border-blue-700 pb-2">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                                    <FaChevronRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" />
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                                    <FaChevronRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" />
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/achievements" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                                    <FaChevronRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" />
                                    Achievements
                                </Link>
                            </li>
                            <li>
                                <Link to="/events/public" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                                    <FaChevronRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" />
                                    Events
                                </Link>
                            </li>
                            <li>
                                <Link to="/gallery" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                                    <FaChevronRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" />
                                    Gallery
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                                    <FaChevronRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" />
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Column 3: Academics */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-blue-100 border-b border-blue-700 pb-2">Academics</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/departments" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                                    <FaChevronRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" />
                                    Departments
                                </Link>
                            </li>
                            <li>
                                <Link to="/departments" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                                    <FaChevronRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" />
                                    Computer Science
                                </Link>
                            </li>
                            <li>
                                <Link to="/departments" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                                    <FaChevronRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" />
                                    Mechanical Engineering
                                </Link>
                            </li>
                            <li>
                                <Link to="/departments" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                                    <FaChevronRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" />
                                    Civil Engineering
                                </Link>
                            </li>
                            <li>
                                <Link to="/departments" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                                    <FaChevronRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" />
                                    Electronics & Telecomm
                                </Link>
                            </li>
                        </ul>
                    </div>
                    
                    
                    
                    {/* Column 5: Contact & Newsletter */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-blue-100 border-b border-blue-700 pb-2">Stay Connected</h3>
                        
                        {/* Contact Info with icons */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start space-x-3">
                                <div className="bg-blue-800 p-2 rounded-lg mt-1">
                                    <FaMapMarkerAlt className="h-4 w-4 text-blue-300" />
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm leading-relaxed">
                                        TKIET Warananagar<br />
                                        Kolhapur, Maharashtra 416113
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-800 p-2 rounded-lg">
                                    <FaPhone className="h-4 w-4 text-blue-300" />
                                </div>
                                <a href="tel:+911234567890" className="text-blue-100 hover:text-white transition-colors">
                                    +91 123 456 7890
                                </a>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-800 p-2 rounded-lg">
                                    <FaEnvelope className="h-4 w-4 text-blue-300" />
                                </div>
                                <a href="mailto:info@tkiet.ac.in" className="text-blue-100 hover:text-white transition-colors">
                                    info@tkiet.ac.in
                                </a>
                            </div>
                        </div>
                        
                        
                    </div>
                </div>
                
                {/* Bottom Bar */}
                <div className="border-t border-blue-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-blue-300 text-sm mb-4 md:mb-0">
                            © {new Date().getFullYear()} TKIET Warananagar. All Rights Reserved.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <a href="#" className="text-blue-300 hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="text-blue-300 hover:text-white transition-colors">Terms & Conditions</a>
                            <a href="#" className="text-blue-300 hover:text-white transition-colors">Disclaimer</a>
                            <a href="#" className="text-blue-300 hover:text-white transition-colors">Sitemap</a>
                            <a href="#" className="text-blue-300 hover:text-white transition-colors">Grievance</a>
                        </div>
                    </div>
                    
                    {/* Designed by credit */}
                    <div className="text-center mt-6 text-blue-400 text-xs">
                        Designed & Developed by TKIET IT Team
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
