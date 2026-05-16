// Sample data service for landing page content
// This can be replaced with actual API calls in the future

export const getAchievements = () => {
  return [
    {
      id: 1,
      title: "NAAC 'A' Grade Accreditation",
      description: "Recognized for excellence in education and infrastructure",
      icon: "FaTrophy",
      year: "2023",
      category: "Accreditation"
    },
    {
      id: 2,
      title: "Best Engineering College Award",
      description: "Awarded by Maharashtra State Government",
      icon: "FaAward",
      year: "2022",
      category: "Recognition"
    },
    {
      id: 3,
      title: "100% Placement Record",
      description: "Outstanding placement achievements across all branches",
      icon: "FaRocket",
      year: "2023",
      category: "Placement"
    },
    {
      id: 4,
      title: "Research Excellence",
      description: "Multiple research papers published in international journals",
      icon: "FaLightbulb",
      year: "2023",
      category: "Research"
    }
  ];
};

export const getEvents = () => {
  return [
    {
      id: 1,
      title: "Annual Technical Festival - TechFest 2024",
      date: "March 15-17, 2024",
      description: "Three days of technical competitions, workshops, and exhibitions",
      type: "Technical",
      status: "Upcoming"
    },
    {
      id: 2,
      title: "Cultural Festival - Utsav 2024",
      date: "February 20-22, 2024",
      description: "Celebrating arts, music, dance, and cultural diversity",
      type: "Cultural",
      status: "Upcoming"
    },
    {
      id: 3,
      title: "Sports Week 2024",
      date: "January 10-15, 2024",
      description: "Inter-college sports competitions and athletic events",
      type: "Sports",
      status: "Completed"
    },
    {
      id: 4,
      title: "Industry Expert Lecture Series",
      date: "Ongoing",
      description: "Regular sessions with industry leaders and experts",
      type: "Academic",
      status: "Ongoing"
    }
  ];
};

export const getActivities = () => {
  return [
    {
      id: 1,
      title: "Robotics Club",
      description: "Building innovative robots and participating in competitions",
      participants: 45,
      category: "Technical",
      status: "Active",
      established: "2018"
    },
    {
      id: 2,
      title: "Coding Club",
      description: "Programming competitions and hackathons",
      participants: 120,
      category: "Technical",
      status: "Active",
      established: "2015"
    },
    {
      id: 3,
      title: "Drama Society",
      description: "Theatrical performances and cultural events",
      participants: 30,
      category: "Cultural",
      status: "Active",
      established: "2010"
    },
    {
      id: 4,
      title: "Environmental Club",
      description: "Sustainability initiatives and green campus projects",
      participants: 60,
      category: "Social",
      status: "Active",
      established: "2019"
    },
    {
      id: 5,
      title: "Photography Club",
      description: "Capturing campus life and events through photography",
      participants: 25,
      category: "Cultural",
      status: "Active",
      established: "2020"
    },
    {
      id: 6,
      title: "Entrepreneurship Cell",
      description: "Fostering innovation and startup culture among students",
      participants: 80,
      category: "Professional",
      status: "Active",
      established: "2017"
    }
  ];
};

export const getTestimonials = () => {
  return [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Computer Science Student",
       content: "TKIET Warananagar has provided me with excellent opportunities to grow both academically and personally. The autonomous status allows for innovative curriculum and the faculty is highly supportive.",
      rating: 5,
      year: "2023"
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      role: "Mechanical Engineering Alumni",
       content: "The practical approach to learning and industry exposure at TKIET Warananagar helped me secure a great job at a leading automotive company. The autonomous curriculum was very relevant.",
      rating: 5,
      year: "2022"
    },
    {
      id: 3,
      name: "Dr. Anjali Patel",
      role: "Professor, Computer Science",
       content: "Teaching at TKIET Warananagar has been a rewarding experience. The autonomous status allows for innovative teaching methods and the students are highly motivated.",
      rating: 5,
      year: "2023"
    },
    {
      id: 4,
      name: "Sneha Reddy",
      role: "Electronics & Communication Student",
       content: "The hands-on learning approach and modern laboratories at TKIET Warananagar have given me practical skills that are directly applicable in the industry.",
      rating: 5,
      year: "2023"
    }
  ];
};

export const getCollegeStats = () => {
  return {
    students: "5000+",
    programs: "15+",
    placement: "100%",
    years: "25+",
    faculty: "200+",
    alumni: "15000+"
  };
};

export const getContactInfo = () => {
  return {
     address: "TKIET Warananagar, Kolhapur, Maharashtra, India",
     phone: "+91-XXX-XXXX-XXXX",
     email: "info@tkiet.edu.in",
     website: "www.tkiet.edu.in",
     socialMedia: {
       facebook: "https://facebook.com/tkiet",
       twitter: "https://twitter.com/tkiet",
       instagram: "https://instagram.com/tkiet",
       linkedin: "https://linkedin.com/school/tkiet"
     }
  };
};
