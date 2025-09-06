import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  Download, 
  Users, 
  Star,
  Clock,
  Award,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aimlService } from '../../services/aimlService';
import { Badge } from '@/components/ui/badge';
import { Course, Resource } from '@/types';

interface EducationalContent {
  courses: Course[];
  resources: Resource[];
  recommendedCourses?: Course[];
  learningPath?: string;
  topicSuggestions?: string[];
  resourceLinks?: {
    title: string;
    url: string;
    description?: string;
  }[];
  totalCount?: number;
  userStats?: {
    coursesCompleted: number;
    certificatesEarned: number;
    learningHours: number;
    lastActive?: string;
  };
}

interface CourseDisplayItem {
  id: string | number;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
  rating: number;
  students: number;
  image: string;
  lessons: number;
  type: string;
  isAiRecommended?: boolean;
}

const EducationPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [educationContent, setEducationContent] = useState<EducationalContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>(['crop-management', 'soil-health']);
  const { user } = useAuth();
  
  // Define categories outside of render to avoid recreating on each render
  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'crop-management', name: 'Crop Management' },
    { id: 'soil-health', name: 'Soil Health' },
    { id: 'pest-control', name: 'Pest Control' },
    { id: 'irrigation', name: 'Irrigation' },
    { id: 'harvesting', name: 'Harvesting' },
    { id: 'marketing', name: 'Marketing' }
  ];
  
  // Fetch content when component mounts or when interests/search changes
  useEffect(() => {
    fetchEducationalContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInterests, searchTerm, selectedCategory]);
  
  const fetchEducationalContent = async () => {
    try {
      setLoadingContent(true);
      setError(null);
      
      const params = {
        topic: selectedCategory !== 'all' ? selectedCategory : undefined,
        interests: userInterests,
        location: user?.location || 'Nairobi, Kenya',
        searchTerm: searchTerm || undefined,
        skillLevel: undefined // Can be added based on user preferences later
      };
      
      const content = await aimlService.getEducationalContent(params);
      setEducationContent(content);
    } catch (error) {
      console.error('Error fetching educational content:', error);
      setError('Failed to load educational content. Please try again later.');
    } finally {
      setLoadingContent(false);
    }
  };
  
  const handleInterestToggle = (interest: string) => {
    if (userInterests.includes(interest)) {
      setUserInterests(userInterests.filter(i => i !== interest));
    } else {
      setUserInterests([...userInterests, interest]);
    }
  };

  // Transform API courses to display format
  const coursesToDisplay: CourseDisplayItem[] = educationContent?.courses?.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    duration: course.duration,
    level: course.level,
    rating: course.rating,
    students: course.students,
    image: course.thumbnail,
    lessons: course.lessons,
    type: course.tags[0] || 'video' // Using first tag as type
  })) || [];

  const filteredCourses = coursesToDisplay.filter(course => {
    const matchesSearch = !searchTerm || 
                         course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Agricultural Education Center</h1>
            <p className="text-blue-100">Expand your farming knowledge with expert-led courses and resources</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={fetchEducationalContent} 
              className="bg-white text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-1"
              disabled={loadingContent}
            >
              <RefreshCw className={`h-4 w-4 ${loadingContent ? 'animate-spin' : ''}`} />
              <span>Update</span>
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

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
              aria-label="Select category"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* User Interests */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Your Interests:</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              category.id !== 'all' && (
                <button
                  key={category.id}
                  onClick={() => handleInterestToggle(category.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${userInterests.includes(category.id) ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                >
                  {category.name}
                </button>
              )
            ))}
          </div>
        </div>
      </div>
      
      {/* AI Personalized Recommendations */}
      {educationContent && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Personalized Learning Path</h2>
            <Badge className="bg-blue-100 text-blue-800">AI POWERED</Badge>
          </div>
          
          {loadingContent ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
              <p className="mt-2 text-gray-500">Personalizing your learning experience...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {educationContent.learningPath && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Your Learning Path</h3>
                  <p className="text-gray-700">{educationContent.learningPath}</p>
                </div>
              )}
              
              {educationContent.topicSuggestions && educationContent.topicSuggestions.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Recommended Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {educationContent.topicSuggestions.map((topic, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {educationContent.resourceLinks && educationContent.resourceLinks.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Additional Resources</h3>
                  <ul className="space-y-2 pl-5 list-disc text-gray-700">
                    {educationContent.resourceLinks.map((resource, index) => (
                      <li key={index}>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {resource.title}
                        </a>
                        {resource.description && <p className="text-sm text-gray-500">{resource.description}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Featured Courses */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Courses</h2>
        
        {loadingContent ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto"></div>
            <p className="mt-3 text-gray-500">Loading courses...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
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
                  
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {course.title}
                    {course.isAiRecommended && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Recommended</Badge>
                    )}
                  </h3>
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
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No courses found</h3>
            <p className="text-gray-500">Try changing your search criteria or interests</p>
          </div>
        )}
      </div>

      {/* Downloadable Resources */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Downloadable Resources</h2>
        
        {loadingContent ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700 mx-auto"></div>
            <p className="mt-3 text-gray-500">Loading resources...</p>
          </div>
        ) : educationContent?.resources?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {educationContent.resources.map(resource => (
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
                
                <a 
                  href={resource.downloadUrl} 
                  download
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 no-underline"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Download className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No resources available</h3>
            <p className="text-gray-500">Check back later for updated materials</p>
          </div>
        )}
      </div>

      {/* Learning Progress - Using user profile data or default values if not available */}
      {user && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Learning Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full inline-block mb-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {educationContent?.userStats?.coursesCompleted || 0}
              </p>
              <p className="text-sm text-gray-600">Courses Completed</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full inline-block mb-3">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {educationContent?.userStats?.certificatesEarned || 0}
              </p>
              <p className="text-sm text-gray-600">Certificates Earned</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full inline-block mb-3">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {educationContent?.userStats?.learningHours || 0}h
              </p>
              <p className="text-sm text-gray-600">Learning Time</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationPage;