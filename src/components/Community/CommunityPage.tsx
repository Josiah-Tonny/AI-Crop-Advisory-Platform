import React, { useState } from 'react';
import { 
  Users, 
  MessageCircle, 
  ThumbsUp, 
  Share2, 
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Award
} from 'lucide-react';

const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchTerm, setSearchTerm] = useState('');

  const discussions = [
    {
      id: 1,
      title: 'Best practices for maize farming in rainy season',
      author: 'John Kamau',
      location: 'Nakuru, Kenya',
      time: '2 hours ago',
      replies: 12,
      likes: 24,
      category: 'Crop Management',
      excerpt: 'I\'ve been struggling with waterlogging in my maize fields during heavy rains. What are the best drainage techniques you\'ve used?',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: 2,
      title: 'Organic pest control methods that actually work',
      author: 'Mary Wanjiku',
      location: 'Kiambu, Kenya',
      time: '5 hours ago',
      replies: 8,
      likes: 18,
      category: 'Pest Control',
      excerpt: 'Sharing my experience with neem oil and companion planting. These methods have reduced pest damage by 70% on my farm.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: 3,
      title: 'Coffee farming: When to harvest for best quality',
      author: 'Peter Mwangi',
      location: 'Nyeri, Kenya',
      time: '1 day ago',
      replies: 15,
      likes: 32,
      category: 'Harvesting',
      excerpt: 'Timing is everything in coffee harvesting. Here\'s what I\'ve learned about identifying the perfect ripeness for premium coffee beans.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  const experts = [
    {
      id: 1,
      name: 'Dr. Sarah Muthoni',
      title: 'Agricultural Extension Officer',
      specialization: 'Soil Health & Nutrition',
      location: 'Nairobi, Kenya',
      rating: 4.9,
      consultations: 150,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: 2,
      name: 'James Ochieng',
      title: 'Crop Management Specialist',
      specialization: 'Maize & Bean Production',
      location: 'Kisumu, Kenya',
      rating: 4.8,
      consultations: 120,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: 3,
      name: 'Grace Nyong\'o',
      title: 'Sustainable Agriculture Consultant',
      specialization: 'Organic Farming & Permaculture',
      location: 'Mombasa, Kenya',
      rating: 4.9,
      consultations: 95,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  const events = [
    {
      id: 1,
      title: 'Sustainable Farming Workshop',
      date: '2024-02-15',
      time: '9:00 AM - 4:00 PM',
      location: 'Nakuru Agricultural Center',
      attendees: 45,
      type: 'Workshop',
      description: 'Learn about sustainable farming practices and organic certification processes.'
    },
    {
      id: 2,
      title: 'Coffee Farmers Cooperative Meeting',
      date: '2024-02-20',
      time: '2:00 PM - 5:00 PM',
      location: 'Nyeri Community Hall',
      attendees: 78,
      type: 'Meeting',
      description: 'Monthly meeting to discuss market prices, quality standards, and cooperative benefits.'
    },
    {
      id: 3,
      title: 'Modern Irrigation Techniques Demo',
      date: '2024-02-25',
      time: '10:00 AM - 3:00 PM',
      location: 'Kiambu Demo Farm',
      attendees: 32,
      type: 'Demonstration',
      description: 'Hands-on demonstration of drip irrigation and smart watering systems.'
    }
  ];

  const tabs = [
    { id: 'discussions', name: 'Discussions', icon: MessageCircle },
    { id: 'experts', name: 'Expert Advice', icon: Award },
    { id: 'events', name: 'Events', icon: Calendar }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Farmer Community</h1>
        <p className="text-purple-100">Connect, learn, and grow together with fellow farmers across East Africa</p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 text-center">
          <div className="bg-blue-100 p-3 rounded-full inline-block mb-3">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">12,450</p>
          <p className="text-sm text-gray-600">Active Farmers</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 text-center">
          <div className="bg-green-100 p-3 rounded-full inline-block mb-3">
            <MessageCircle className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">3,280</p>
          <p className="text-sm text-gray-600">Discussions</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 text-center">
          <div className="bg-purple-100 p-3 rounded-full inline-block mb-3">
            <Award className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">156</p>
          <p className="text-sm text-gray-600">Experts</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 text-center">
          <div className="bg-orange-100 p-3 rounded-full inline-block mb-3">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">24</p>
          <p className="text-sm text-gray-600">Upcoming Events</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Discussions Tab */}
          {activeTab === 'discussions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Discussions</h2>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Start Discussion</span>
                </button>
              </div>

              <div className="space-y-4">
                {discussions.map(discussion => (
                  <div key={discussion.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={discussion.avatar} 
                        alt={discussion.author}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{discussion.title}</h3>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                            {discussion.category}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{discussion.excerpt}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-700">{discussion.author}</span>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{discussion.location}</span>
                            </div>
                            <span>{discussion.time}</span>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{discussion.replies}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{discussion.likes}</span>
                            </div>
                            <button className="hover:text-purple-600">
                              <Share2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experts Tab */}
          {activeTab === 'experts' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Agricultural Experts</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experts.map(expert => (
                  <div key={expert.id} className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                    <img 
                      src={expert.avatar} 
                      alt={expert.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                    />
                    <h3 className="font-semibold text-gray-900 mb-1">{expert.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{expert.title}</p>
                    <p className="text-sm text-purple-600 font-medium mb-3">{expert.specialization}</p>
                    
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{expert.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4" />
                        <span>{expert.rating}</span>
                      </div>
                      <div>
                        <span>{expert.consultations} consultations</span>
                      </div>
                    </div>
                    
                    <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                      Book Consultation
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create Event</span>
                </button>
              </div>

              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                      </div>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                        {event.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees} attending</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm text-gray-500">{event.time}</span>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                        Join Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;