import React from 'react';
import { FaCheckCircle, FaHistory, FaAward, FaUserTie, FaGraduationCap, FaBuilding, FaTrophy, FaGlobe, FaUsers, FaQuoteLeft } from 'react-icons/fa';
import PublicLayout from '../../layouts/PublicLayout';

const About = () => {
    const leaders = [
        {
            name: "Hon. Shri. Vinay Kore",
            role: "Chairman",
            image: "https://tkietwarana.ac.in/upload/images/kore.jpg", // Placeholder
            message: "Visionary leader guiding the institute towards global excellence."
        },
        {
            name: "Dr. Vilas V Karjinni",
            role: "Chief Executive Officer",
            image: "https://tkietwarana.ac.in/upload/images/Dr-Vilas-V-Karjinni.jpg", // Placeholder
            message: "Committed to academic rigor and holistic student development."
        },
        {
            name: "Dr. Pise Shivling M",
            role: "Dean Eng.,Tech. & Management",
            image: "https://tkietwarana.ac.in/upload/images/PiseSir.jpg", // Placeholder
            message: "Fostering research and innovation culture on campus."
        },
        {
            name: "Dr. D. N. Mane",
            role: "Principal",
            image: "https://tkietwarana.ac.in/upload/images/Mane%20Sir.jpg", // Placeholder
            message: "Fostering research and innovation culture on campus."
        }
    ];

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-blue-900/90"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-block mb-4 px-4 py-2 bg-blue-800/50 backdrop-blur-sm rounded-full border border-blue-600">
                        <span className="text-sm font-semibold text-blue-100">Our Story</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">About TKIET</h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                        A legacy of 40+ years in shaping the future of engineering education in India.
                    </p>
                </div>
            </section>

            {/* Vision & Mission */}
            <section id="vision" className="py-20 bg-gradient-to-br from-blue-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
                            Core Values
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Vision & Mission</h2>
                        <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-white rounded-3xl p-10 border-2 border-blue-100 shadow-lg hover:shadow-2xl hover:border-blue-500 transition-all duration-300">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="bg-blue-600 p-4 rounded-xl">
                                    <FaUserTie className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
                            </div>
                            <div className="border-l-4 border-blue-600 pl-6">
                                <p className="text-lg text-gray-700 leading-relaxed italic">
                                    "To become an institute of excellence in Engineering Education & Research, producing globally competent professionals with ethical values and social responsibility."
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl p-10 border-2 border-blue-100 shadow-lg hover:shadow-2xl hover:border-blue-500 transition-all duration-300">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="bg-blue-600 p-4 rounded-xl">
                                    <FaHistory className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
                            </div>
                            <ul className="space-y-4 text-lg text-gray-700">
                                <li className="flex items-start">
                                    <FaCheckCircle className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                                    <span>To provide state-of-the-art infrastructure and learning environment.</span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheckCircle className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                                    <span>To promote research, innovation and entrepreneurship.</span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheckCircle className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                                    <span>To inculcate ethical values and leadership qualities.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* History Timeline */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
                            Our Legacy
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
                        <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="relative border-l-4 border-blue-300 ml-6 md:ml-auto md:mr-auto md:w-2/3 space-y-12">
                        {[
                            { year: '1983', title: 'Establishment', desc: 'TKIET was established with 3 branches.', icon: FaBuilding },
                            { year: '1995', title: 'Expansion', desc: 'Added Electronics & IT branches.', icon: FaGraduationCap },
                            { year: '2010', title: 'Post Graduation', desc: 'Started M.E. programs in Civil & Mech.', icon: FaUsers },
                            { year: '2020', title: 'Autonomy', desc: 'Granted Autonomous status by UGC.', icon: FaTrophy },
                        ].map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="relative pl-8 md:pl-12">
                                    <div className="absolute -left-3 top-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                        <Icon className="h-3 w-3 text-white" />
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl border-2 border-blue-100 hover:border-blue-500 transition-all duration-300">
                                        <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 text-sm font-bold rounded-full mb-3">
                                            {item.year}
                                        </span>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-gray-600">{item.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Leadership */}
            <section id="leadership" className="py-20 bg-gradient-to-br from-blue-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
                            Our Leaders
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Leadership</h2>
                        <p className="text-gray-600 text-lg">Guiding us towards excellence</p>
                        <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mt-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {leaders.map((leader, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-blue-100 hover:shadow-2xl hover:border-blue-500 transition-all duration-300 text-center group">
                                <div className="h-64 overflow-hidden relative">
                                    <img
                                        src={leader.image}
                                        alt={leader.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{leader.name}</h3>
                                    <p className="text-blue-600 font-semibold mb-4">{leader.role}</p>
                                    <div className="border-l-4 border-blue-600 pl-4">
                                        <p className="text-gray-600 italic">"{leader.message}"</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Accreditations */}
            <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <FaAward className="absolute top-10 left-10 text-9xl text-blue-400" />
                    <FaAward className="absolute bottom-10 right-10 text-9xl text-blue-400" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                        <span className="text-sm font-semibold text-blue-200">Recognition</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-12">Accreditations & Approvals</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <div className="flex flex-col items-center group">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <FaAward className="h-12 w-12 text-blue-600" />
                            </div>
                            <span className="font-bold text-lg text-blue-100">NAAC 'A' Grade</span>
                            <span className="text-sm text-blue-300 mt-1">Accredited</span>
                        </div>
                        <div className="flex flex-col items-center group">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <FaAward className="h-12 w-12 text-blue-600" />
                            </div>
                            <span className="font-bold text-lg text-blue-100">NBA Accredited</span>
                            <span className="text-sm text-blue-300 mt-1">Programs</span>
                        </div>
                        <div className="flex flex-col items-center group">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <FaAward className="h-12 w-12 text-blue-600" />
                            </div>
                            <span className="font-bold text-lg text-blue-100">AICTE Approved</span>
                            <span className="text-sm text-blue-300 mt-1">Recognized</span>
                        </div>
                        <div className="flex flex-col items-center group">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <FaAward className="h-12 w-12 text-blue-600" />
                            </div>
                            <span className="font-bold text-lg text-blue-100">UGC Autonomous</span>
                            <span className="text-sm text-blue-300 mt-1">Status</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Awards & Recognitions */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
                            Excellence
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Awards & Recognitions</h2>
                        <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border-2 border-blue-100 hover:border-blue-500 transition-all duration-300">
                            <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                                <FaTrophy className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Top Engineering College</h3>
                            <p className="text-gray-600">Ranked among top 50 engineering colleges in Maharashtra by leading educational surveys.</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border-2 border-blue-100 hover:border-blue-500 transition-all duration-300">
                            <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                                <FaGlobe className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">International Recognition</h3>
                            <p className="text-gray-600">Active participation in international conferences and research collaborations worldwide.</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border-2 border-blue-100 hover:border-blue-500 transition-all duration-300">
                            <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                                <FaAward className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Research Excellence</h3>
                            <p className="text-gray-600">Multiple research publications and patents contributing to technological advancement.</p>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default About;
