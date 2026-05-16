import React from 'react';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from 'react-icons/fa';

const ContactSection = ({ isVisible }) => {
  return (
    <section id="contact" className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          data-animate
          className={`text-center mb-12 lg:mb-16 transition-all duration-1000 ${isVisible['contact-title'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          id="contact-title"
        >
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
            <span className="text-sm font-semibold text-blue-700">Contact Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ready to join our community? Contact us for more information about admissions and programs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div 
            data-animate
            className={`transition-all duration-1000 delay-100 ${isVisible['contact-info'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            id="contact-info"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start group">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg mr-4 group-hover:scale-110 transition-transform">
                    <FaMapMarkerAlt className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Address</p>
                    <p className="text-gray-700 font-medium">TKIET Warananagar, Kolhapur, Maharashtra, India</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg mr-4 group-hover:scale-110 transition-transform">
                    <FaPhone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Phone</p>
                    <p className="text-gray-700 font-medium">+91-XXX-XXXX-XXXX</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg mr-4 group-hover:scale-110 transition-transform">
                    <FaEnvelope className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Email</p>
                    <p className="text-gray-700 font-medium">info@tkiet.edu.in</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 pt-8 border-t border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="bg-blue-50 hover:bg-blue-100 p-3 rounded-xl text-blue-600 hover:text-blue-700 transition-all transform hover:scale-110">
                    <FaFacebook className="h-6 w-6" />
                  </a>
                  <a href="#" className="bg-blue-50 hover:bg-blue-100 p-3 rounded-xl text-blue-600 hover:text-blue-700 transition-all transform hover:scale-110">
                    <FaTwitter className="h-6 w-6" />
                  </a>
                  <a href="#" className="bg-blue-50 hover:bg-blue-100 p-3 rounded-xl text-blue-600 hover:text-blue-700 transition-all transform hover:scale-110">
                    <FaInstagram className="h-6 w-6" />
                  </a>
                  <a href="#" className="bg-blue-50 hover:bg-blue-100 p-3 rounded-xl text-blue-600 hover:text-blue-700 transition-all transform hover:scale-110">
                    <FaLinkedin className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            data-animate
            className={`transition-all duration-1000 delay-200 ${isVisible['contact-form'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            id="contact-form"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Your message"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
