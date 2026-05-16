import React from 'react';
import { FaBuilding, FaLaptopCode, FaCogs, FaHardHat, FaMicrochip, FaFlask, FaArrowRight } from 'react-icons/fa';
import PublicLayout from '../../layouts/PublicLayout';

const Departments = () => {
  const departments = [
    {
      name: 'Computer Science & Engineering',
      icon: FaLaptopCode,
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Focusing on AI, ML, Data Science, and core computing technologies with state-of-the-art labs.',
      hod: 'Dr. V. A. Kulkarni',
      intake: 180
    },
    {
      name: 'Mechanical Engineering',
      icon: FaCogs,
      image: 'https://images.unsplash.com/photo-1537462713505-a111002572f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Equipped with modern workshops, CAD/CAM labs, and research facilities for robotics and automation.',
      hod: 'Dr. N. S. Dharashivkar',
      intake: 120
    },
    {
      name: 'Civil Engineering',
      icon: FaHardHat,
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Emphasizing sustainable infrastructure, structural engineering, and environmental solutions.',
      hod: 'Dr. D. M. Patil',
      intake: 60
    },
    {
      name: 'Electronics & Telecommunication',
      icon: FaMicrochip,
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Covering VLSI, Embedded Systems, IoT, and advanced communication technologies.',
      hod: 'Dr. S. V. Anekar',
      intake: 60
    },
    {
      name: 'Chemical Engineering',
      icon: FaFlask,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Focusing on process engineering, biotechnology, and sustainable chemical processes.',
      hod: 'Dr. K. I. Patil',
      intake: 60
    }
  ];

  return (
    <PublicLayout>
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
              <span className="text-sm font-semibold text-blue-700">Academic Programs</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Departments
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore our diverse range of engineering programs designed to meet industry demands and foster innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {departments.map((dept, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col md:flex-row"
              >
                <div className="md:w-2/5 relative overflow-hidden">
                  <img
                    src={dept.image}
                    alt={dept.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white font-bold flex items-center">
                      View Details <FaArrowRight className="ml-2" />
                    </span>
                  </div>
                </div>
                <div className="p-8 md:w-3/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600">
                        <dept.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">{dept.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                      {dept.description}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-auto">
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-gray-500 block text-xs uppercase tracking-wider">Head of Dept</span>
                        <span className="font-semibold text-gray-900">{dept.hod}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 block text-xs uppercase tracking-wider">Intake</span>
                        <span className="font-bold text-blue-600">{dept.intake}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Departments;
