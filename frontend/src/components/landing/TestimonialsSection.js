import React, { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const TestimonialsSection = ({ isVisible }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Computer Science Student",
       content: "TKIET Warananagar has provided me with excellent opportunities to grow both academically and personally. The autonomous status allows for innovative curriculum and the faculty is highly supportive.",
      rating: 5
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      role: "Mechanical Engineering Alumni",
       content: "The practical approach to learning and industry exposure at TKIET Warananagar helped me secure a great job at a leading automotive company. The autonomous curriculum was very relevant.",
      rating: 5
    },
    {
      id: 3,
      name: "Dr. Anjali Patel",
      role: "Professor, Computer Science",
       content: "Teaching at TKIET Warananagar has been a rewarding experience. The autonomous status allows for innovative teaching methods and the students are highly motivated.",
      rating: 5
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          data-animate
          className={`text-center mb-12 lg:mb-16 transition-all duration-1000 ${isVisible['testimonials-title'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          id="testimonials-title"
        >
          <div className="inline-block mb-4 px-4 py-2 bg-purple-100 rounded-full">
            <span className="text-sm font-semibold text-purple-700">Testimonials</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">What Our Community Says</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
             Hear from our students, alumni, and faculty about their experiences at TKIET Warananagar.
          </p>
        </div>
        
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-100">
                    <div className="text-center max-w-3xl mx-auto">
                      <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaQuoteLeft className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-lg lg:text-xl text-gray-700 mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                      <div className="flex justify-center mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <FaStar key={i} className="h-5 w-5 text-yellow-400 mx-1" />
                        ))}
                      </div>
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">{testimonial.name}</h4>
                        <p className="text-gray-600 font-medium">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
