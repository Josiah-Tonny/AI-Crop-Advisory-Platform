import React, { useState } from 'react';
import { 
  BookOpen, 
  Play, 
  Download, 
  Users, 
  Star,
  Clock,
  Award,
  Search,
  Filter
} from 'lucide-react';

const EducationPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'crop-management', name: 'Crop Management' },
    { id: 'soil-health', name: 'Soil Health' },
    { id: 'pest-control', name: 'Pest Control' },
    { id: 'irrigation', name: 'Irrigation' },
    { id: 'harvesting', name: 'Harvesting' },
    { id: 'marketing', name: 'Marketing' }
  ];

  const courses = [
    {
      id: 1,
      title: 'Modern Maize Farming Techniques',
      description: 'Learn advanced techniques for growing high-yield maize crops in East African conditions.',
      category: 'crop-management',
      duration: '2 hours',
      level: 'Intermediate',
      rating: 4.8,
      students: 1250,
      image: 'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=400',
      lessons: 12,
      type: 'video'
    },
    {
      id: 2,
      title: 'Soil Testing and Nutrient Management',
      description: 'Understand how to test your soil and manage nutrients for optimal crop growth.',
      category: 'soil-health',
      duration: '1.5 hours',
      level: 'Beginner',
      rating: 4.9,
      students: 890,
      image: 'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=400',
      lessons: 8,
      type: 'interactive'
    },
    {
      id: 3,
      title: 'Integrated Pest Management',
      description: 'Comprehensive guide to managing pests using sustainable and effective methods.',
      category: 'pest-control',
      duration: '3 hours',
      level: 'Advanced',
      rating: 4.7,
      students: 650,
      image: 'https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?auto=compress&cs=tinysrgb&w=400',
      lessons: 15,
      type: 'video'
    },
    {
      id: 4,
      title: 'Water-Efficient Irrigation Systems',
      description: 'Learn about drip irrigation, sprinkler systems, and water conservation techniques.',
      category: 'irrigation',
      duration: '2.5 hours',
      level: 'Intermediate',
      rating: 4.6,
      students: 720,
      image: 'https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?auto=compress&cs=tinysrgb&w=400',
      lessons: 10,
      type: 'practical'
    },
    {
      id: 5,
      title: 'Post-Harvest Handling and Storage',
      description: 'Best practices for handling, processing, and storing crops to minimize losses.',
      category: 'harvesting',
      duration: '1.8 hours',
      level: 'Beginner',
      rating: 4.8,
      students: 980,
      image: 'https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?auto=compress&cs=tinysrgb&w=400',
      lessons: 9,
      type: 'video'
    },
    {
      id: 6,
      title: 'Agricultural Marketing and Value Addition',
      description: 'Strategies for marketing your produce and adding value to increase profits.',
      category: 'marketing',
      duration: '2.2 hours',
      level: 'Intermediate',
      rating: 4.5,
      students: 540,
      image: 'https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?auto=compress&cs=tinysrgb&w=400',
      lessons: 11,
      type: 'business'
    }
  ];

  const resources = [
    {
      id: 1,
      title: 'Crop Calendar for East Africa',
      type: 'PDF Guide',
      size: '2.5 MB',
      downloads: 3200,
      description: 'Comprehensive planting and harvesting calendar for major crops in East Africa.'
    },
    {
      id: 2,
      title: 'Pest Identification Chart',
      type: 'Visual Guide',
      size: '1.8 MB',
      downloads: 2100,
      description: 'Visual guide to identify common pests and diseases affecting crops.'
    },
    {
      id: 3,
      title: 'Fertilizer Application Calculator',
      type: 'Excel Tool',
      size: '0.5 MB',
      downloads: 1850,
      description: 'Calculate optimal fertilizer amounts based on soil test results.'
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'interactive': return <Users className="h-4 w-4" />;
      case 'practical': return <Award className="h-4 w-4" />;
      case 'business': return <BookOpen className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Agricultural Education Center</h1>
        <p className="text-blue-100">Expand your farming knowledge with expert-led courses and resources</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses and resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                  <div className="flex items-center space-x-1">
                    {getTypeIcon(course.type)}
                    <span className="text-xs text-gray-500 capitalize">{course.type}</span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons} lessons</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{course.rating}</span>
                    <span className="text-xs text-gray-500">({course.students} students)</span>
                  </div>
                </div>
                
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Start Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Downloadable Resources */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Downloadable Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map(resource => (
            <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xs text-gray-500">{resource.size}</span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{resource.type}</span>
                <span>{resource.downloads.toLocaleString()} downloads</span>
              </div>
              
              <button className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Progress */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Learning Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full inline-block mb-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-600">Courses Completed</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full inline-block mb-3">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">8</p>
            <p className="text-sm text-gray-600">Certificates Earned</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-full inline-block mb-3">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">24h</p>
            <p className="text-sm text-gray-600">Learning Time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationPage;