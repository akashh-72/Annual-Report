import React, { useState } from 'react';
import { FaImages, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import PublicLayout from '../../layouts/PublicLayout';

const Gallery = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const categories = [
        { id: 'all', name: 'All Photos' },
        { id: 'campus', name: 'Campus' },
        { id: 'events', name: 'Events' },
        { id: 'activities', name: 'Activities' },
        { id: 'sports', name: 'Sports' },
        { id: 'cultural', name: 'Cultural' },
        { id: 'graduation', name: 'Graduation' }
    ];

    // Sample gallery images - In production, these would come from an API
    const galleryImages = {
        campus: [
            { id: 1, url: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Main Building' },
            { id: 2, url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Library' },
            { id: 3, url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Laboratory' },
            { id: 4, url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Auditorium' },
            { id: 5, url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Campus Ground' },
            { id: 6, url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Classroom' }
        ],
        events: [
            { id: 7, url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'TechFest 2024' },
            { id: 8, url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Workshop Session' },
            { id: 9, url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Guest Lecture' },
            { id: 10, url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Seminar' },
            { id: 11, url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Conference' },
            { id: 12, url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Exhibition' }
        ],
        activities: [
            { id: 13, url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Coding Competition' },
            { id: 14, url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Hackathon' },
            { id: 15, url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Project Exhibition' },
            { id: 16, url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Robotics Workshop' },
            { id: 17, url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Innovation Day' },
            { id: 18, url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Industry Visit' }
        ],
        sports: [
            { id: 19, url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Cricket Match' },
            { id: 20, url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Football Tournament' },
            { id: 21, url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Basketball' },
            { id: 22, url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Athletics' },
            { id: 23, url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Volleyball' },
            { id: 24, url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Sports Day' }
        ],
        cultural: [
            { id: 25, url: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Dance Performance' },
            { id: 26, url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Music Concert' },
            { id: 27, url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Drama' },
            { id: 28, url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Cultural Fest' },
            { id: 29, url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Rangoli Competition' },
            { id: 30, url: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Fashion Show' }
        ],
        graduation: [
            { id: 31, url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Convocation 2024' },
            { id: 32, url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Graduation Ceremony' },
            { id: 33, url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Award Distribution' },
            { id: 34, url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', title: 'Alumni Meet' }
        ]
    };

    const getAllImages = () => {
        if (selectedCategory === 'all') {
            return Object.values(galleryImages).flat();
        }
        return galleryImages[selectedCategory] || [];
    };

    const images = getAllImages();

    const openLightbox = (image, index) => {
        setSelectedImage(image);
        setCurrentIndex(index);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const navigateImage = (direction) => {
        const newIndex = direction === 'next' 
            ? (currentIndex + 1) % images.length 
            : (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    return (
        <PublicLayout>
            <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
                            <span className="text-sm font-semibold text-blue-700">Photo Gallery</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Campus Gallery
                        </h1>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Explore our vibrant campus life through photos of events, activities, and daily life at TKIET.
                        </p>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                                    selectedCategory === category.id
                                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                        : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                            <div
                                key={image.id}
                                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                                onClick={() => openLightbox(image, index)}
                            >
                                <div className="aspect-square overflow-hidden bg-gray-200">
                                    <img
                                        src={image.url}
                                        alt={image.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <p className="text-white font-semibold text-sm">{image.title}</p>
                                </div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FaImages className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {images.length === 0 && (
                        <div className="text-center py-16">
                            <FaImages className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Photos Available</h3>
                            <p className="text-gray-600">Check back soon for gallery updates!</p>
                        </div>
                    )}
                </div>

                {/* Lightbox Modal */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                        >
                            <FaTimes className="h-8 w-8" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateImage('prev');
                            }}
                            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 p-3 rounded-full"
                        >
                            <FaChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateImage('next');
                            }}
                            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 p-3 rounded-full"
                        >
                            <FaChevronRight className="h-6 w-6" />
                        </button>
                        <div
                            className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage.url}
                                alt={selectedImage.title}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                            />
                            <p className="text-white text-xl font-semibold mt-4">{selectedImage.title}</p>
                            <p className="text-gray-400 text-sm mt-2">
                                {currentIndex + 1} of {images.length}
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </PublicLayout>
    );
};

export default Gallery;

