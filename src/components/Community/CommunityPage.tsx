import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  MessageCircle, 
  Share2, 
  Plus,
  Search,
  MapPin,
  Calendar,
  Award,
  Send,
  Image,
  Heart,
  Reply,
  Clock,
  TrendingUp,
  Star,
  BookOpen,
  Filter,
  ChevronDown,
  Eye,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    location: string;
    reputation: number;
    isExpert: boolean;
  };
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
  likes: number;
  views: number;
  isLiked: boolean;
  isPinned: boolean;
  images?: string[];
}

interface CommunityMember {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  location: string;
  role: string;
  farmSize: string;
  cropTypes: string[];
  memberSince: string;
  lastActive?: string;
}

interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    isExpert: boolean;
  };
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

interface NewDiscussion {
  title: string;
  content: string;
  category: string;
  tags: string[];
  images: File[];
}

interface APIDiscussion {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    location?: string;
    role: string;
  };
  category: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  replies: APIReply[];
  likes: string[];
  views?: number;
  isPinned?: boolean;
  images?: string[];
}

interface APIReply {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  createdAt: string;
  likes: string[];
}

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [newDiscussion, setNewDiscussion] = useState<NewDiscussion>({
    title: '',
    content: '',
    category: 'general',
    tags: [],
    images: []
  });
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);

  // Debugging - log when component mounts
  useEffect(() => {
    console.log('CommunityPage mounted');
  }, []);

  // Fallback timeout to ensure page loads even if API calls fail
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && activeTab === 'discussions' && discussions.length === 0) {
        console.log('Using fallback discussion data');
        setDiscussions(getMockDiscussions());
        setLoading(false);
      } else if (loading && activeTab === 'members' && communityMembers.length === 0) {
        console.log('Using fallback community member data');
        setCommunityMembers(getMockCommunityMembers());
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading, activeTab, discussions.length, communityMembers.length]);

  const categories = [
    { id: 'all', name: 'All Topics', color: 'bg-gray-100' },
    { id: 'crop-management', name: 'Crop Management', color: 'bg-green-100' },
    { id: 'pest-control', name: 'Pest Control', color: 'bg-red-100' },
    { id: 'soil-health', name: 'Soil Health', color: 'bg-brown-100' },
    { id: 'irrigation', name: 'Irrigation', color: 'bg-blue-100' },
    { id: 'weather', name: 'Weather & Climate', color: 'bg-cyan-100' },
    { id: 'market-prices', name: 'Market Prices', color: 'bg-yellow-100' },
    { id: 'success-stories', name: 'Success Stories', color: 'bg-purple-100' },
    { id: 'equipment', name: 'Equipment & Tools', color: 'bg-orange-100' }
  ];

  const sortOptions = [
    { id: 'latest', name: 'Latest' },
    { id: 'popular', name: 'Most Popular' },
    { id: 'trending', name: 'Trending' }
  ];

  const loadDiscussions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/discussions?category=${selectedCategory}&search=${searchTerm}&sort=${sortBy}`);
      const data = await response.json();
      
      if (data.success) {
        setDiscussions(data.data.discussions.map((discussion: APIDiscussion) => ({
          id: discussion._id,
          title: discussion.title,
          content: discussion.content,
          author: {
            id: discussion.author._id,
            name: `${discussion.author.firstName} ${discussion.author.lastName}`,
            avatar: discussion.author.avatar || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
            location: discussion.author.location || 'Kenya',
            reputation: 85,
            isExpert: discussion.author.role === 'expert'
          },
          category: discussion.category,
          tags: discussion.tags || [],
          createdAt: discussion.createdAt,
          updatedAt: discussion.updatedAt,
          replies: discussion.replies.map((reply: APIReply) => ({
            id: reply._id,
            content: reply.content,
            author: {
              id: reply.author._id,
              name: `${reply.author.firstName} ${reply.author.lastName}`,
              avatar: reply.author.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
              isExpert: reply.author.role === 'expert'
            },
            createdAt: reply.createdAt,
            likes: reply.likes.length,
            isLiked: user ? reply.likes.includes(user.id) : false
          })), 
          likes: discussion.likes.length,
          views: discussion.views || 0,
          isLiked: user ? discussion.likes.includes(user.id) : false,
          isPinned: discussion.isPinned || false,
          images: discussion.images || []
        })));
      } else {
        setDiscussions(getMockDiscussions());
      }
    } catch (error) {
      console.error('Error loading discussions:', error);
      toast.error('Failed to load discussions. Using mock data.');
      setDiscussions(getMockDiscussions());
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm, user, sortBy]);

  const loadCommunityMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/community');
      const data = await response.json();
      
      if (data.success) {
        setCommunityMembers(data.data.members);
      } else {
        setCommunityMembers(getMockCommunityMembers());
      }
    } catch (error) {
      console.error('Error loading community members:', error);
      toast.error('Failed to load community members. Using mock data.');
      setCommunityMembers(getMockCommunityMembers());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'discussions') {
      loadDiscussions();
    } else if (activeTab === 'members') {
      loadCommunityMembers();
    }
  }, [selectedCategory, searchTerm, loadDiscussions, loadCommunityMembers, activeTab]);

  const handleCreateDiscussion = async () => {
    if (!user) {
      toast.error('Please log in to create a discussion');
      return;
    }
    
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_AIMLAPI_AI_API_KEY
        },
        body: JSON.stringify({
          title: newDiscussion.title,
          content: newDiscussion.content,
          category: newDiscussion.category,
          tags: newDiscussion.tags
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const discussion: Discussion = {
          id: data.data._id || Date.now().toString(),
          title: newDiscussion.title,
          content: newDiscussion.content,
          author: {
            id: user?.id || '1',
            name: user?.firstName + ' ' + user?.lastName || user?.name || 'Current User',
            avatar: user?.avatar || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
            location: user?.location || 'Unknown',
            reputation: 50,
            isExpert: user?.role === 'expert' || false
          },
          category: newDiscussion.category,
          tags: newDiscussion.tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          replies: [],
          likes: 0,
          views: 1,
          isLiked: false,
          isPinned: false
        };

        setDiscussions(prev => [discussion, ...prev]);
        setNewDiscussion({ title: '', content: '', category: 'general', tags: [], images: [] });
        setShowNewDiscussion(false);
        toast.success('Discussion posted successfully!');
      } else {
        toast.error(data.message || 'Failed to create discussion');
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast.error('Failed to create discussion. Please try again.');
    }
  };

  const handleLikeDiscussion = async (discussionId: string) => {
    if (!user) {
      toast.error('Please log in to like discussions');
      return;
    }
    
    try {
      const response = await fetch(`/api/discussions/${discussionId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_AIMLAPI_AI_API_KEY
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDiscussions(prev => prev.map(d => {
          if (d.id === discussionId) {
            return {
              ...d,
              isLiked: data.liked,
              likes: data.likesCount
            };
          }
          return d;
        }));
      } else {
        toast.error(data.message || 'Failed to like discussion');
      }
    } catch (error) {
      console.error('Error liking discussion:', error);
      toast.error('Failed to like discussion. Please try again.');
    }
  };

  const handleReply = async (discussionId: string, content: string) => {
    if (!user) {
      toast.error('Please log in to reply');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    
    try {
      const response = await fetch(`/api/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_AIMLAPI_AI_API_KEY
        },
        body: JSON.stringify({ content })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const newReply: Reply = {
          id: data.data._id,
          content: data.data.content,
          author: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
            isExpert: user.role === 'expert'
          },
          createdAt: data.data.createdAt,
          likes: 0,
          isLiked: false
        };
        
        setDiscussions(prev => prev.map(d => {
          if (d.id === discussionId) {
            return {
              ...d,
              replies: [...d.replies, newReply]
            };
          }
          return d;
        }));
        
        toast.success('Reply added successfully!');
      } else {
        toast.error(data.message || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply. Please try again.');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const tabs = [
    { id: 'discussions', name: 'Discussions', icon: MessageCircle, count: discussions.length },
    { id: 'members', name: 'Community Members', icon: Users, count: communityMembers.length },
    { id: 'trending', name: 'Trending', icon: TrendingUp, count: 12 },
    { id: 'experts', name: 'Expert Advice', icon: Award, count: 8 },
    { id: 'events', name: 'Events', icon: Calendar, count: 5 }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold mb-3">Farmer Community</h1>
            <p className="text-green-100 text-lg max-w-2xl">Connect, learn, and grow together with farmers across Africa. Share your experiences, ask questions, and discover solutions to agricultural challenges.</p>
          </div>
          <div className="text-center bg-white bg-opacity-20 p-6 rounded-full">
            <Users className="h-12 w-12 mx-auto mb-2" />
            <p className="text-xl font-semibold">12,450+</p>
            <p className="text-sm">Active Farmers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">3,284</p>
            <p className="text-sm text-gray-600">Active Discussions</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-purple-500">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">156</p>
            <p className="text-sm text-gray-600">Agricultural Experts</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-green-500">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">892</p>
            <p className="text-sm text-gray-600">Knowledge Articles</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-red-500">
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">15,642</p>
            <p className="text-sm text-gray-600">Solutions Shared</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-1 mb-6 border-b">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
                <Badge variant="secondary" className="text-xs">{tab.count}</Badge>
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search discussions, topics, or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                          aria-label="Sort discussions by"
                          title="Sort discussions by"
                        >
                          {sortOptions.map(option => (
                            <option key={option.id} value={option.id}>{option.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                          aria-label="Filter discussions by category"
                          title="Filter discussions by category"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => setShowNewDiscussion(true)}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Discussion</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.slice(1).map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                  selectedCategory === category.id 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Tag className="h-3 w-3" />
                {category.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {showNewDiscussion && (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Start a New Discussion</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewDiscussion(false)}
              >
                Cancel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Discussion title..."
              value={newDiscussion.title}
              onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <select
              value={newDiscussion.category}
              onChange={(e) => setNewDiscussion(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              aria-label="Select discussion category for new post"
            >
              {categories.slice(1).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <textarea
              placeholder="Share your question, experience, or knowledge with the community..."
              value={newDiscussion.content}
              onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 h-32 resize-none"
            />
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Image className="h-4 w-4 mr-2" />
                  Add Photos
                </Button>
              </div>
              <Button 
                onClick={handleCreateDiscussion} 
                className="bg-green-600 hover:bg-green-700"
                disabled={!user || !newDiscussion.title || !newDiscussion.content}
              >
                <Send className="h-4 w-4 mr-2" />
                Post Discussion
              </Button>
              {!user && <p className="text-sm text-red-500 mt-2">Please log in to post a discussion</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'discussions' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading discussions...</p>
            </div>
          ) : discussions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No discussions found</h3>
                <p className="text-gray-600 mb-4">Be the first to start a conversation!</p>
                <Button onClick={() => setShowNewDiscussion(true)} className="bg-green-600 hover:bg-green-700">
                  Start Discussion
                </Button>
              </CardContent>
            </Card>
          ) : (
            discussions.map(discussion => (
              <Card key={discussion.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={discussion.author.avatar} 
                      alt={discussion.author.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-green-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-bold text-gray-900 hover:text-green-600 cursor-pointer">
                            {discussion.title}
                          </h3>
                          {discussion.isPinned && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Pinned</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs bg-gray-100">
                            {categories.find(c => c.id === discussion.category)?.name}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                        <span className="font-medium text-gray-800">{discussion.author.name}</span>
                        {discussion.author.isExpert && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                            <Award className="h-3 w-3 mr-1" />
                            Expert
                          </Badge>
                        )}
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{discussion.author.location}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(discussion.createdAt)}</span>
                        <span>•</span>
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{discussion.author.reputation}</span>
                      </div>

                      <p className="text-gray-700 mb-4">{discussion.content}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {discussion.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => handleLikeDiscussion(discussion.id)}
                            className={`flex items-center space-x-1 hover:text-red-600 transition-colors ${
                              discussion.isLiked ? 'text-red-600' : ''
                            }`}
                          >
                            <Heart className={`h-5 w-5 ${discussion.isLiked ? 'fill-current' : ''}`} />
                            <span className="font-medium">{discussion.likes}</span>
                          </button>
                          <div className="flex items-center space-x-1">
                            <Reply className="h-5 w-5" />
                            <span className="font-medium">{discussion.replies.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-5 w-5" />
                            <span className="font-medium">{discussion.views}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-500 hover:text-green-600"
                            onClick={() => {
                              if (user) {
                                const replyContent = prompt('Enter your reply:');
                                if (replyContent) {
                                  handleReply(discussion.id, replyContent);
                                }
                              } else {
                                toast.error('Please log in to reply');
                              }
                            }}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>

                      {discussion.replies.length > 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                          <div className="flex items-center space-x-3 mb-3">
                            <img 
                              src={discussion.replies[0].author.avatar} 
                              alt={discussion.replies[0].author.name}
                              className="w-10 h-10 rounded-full border border-gray-200"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{discussion.replies[0].author.name}</span>
                                {discussion.replies[0].author.isExpert && (
                                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">Expert</Badge>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(discussion.replies[0].createdAt)}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700">{discussion.replies[0].content}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading community members...</p>
            </div>
          ) : communityMembers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No community members found</h3>
                <p className="text-gray-600">Be the first to join our community!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communityMembers.map((member: CommunityMember) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <img 
                        src={member.avatar} 
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          {member.firstName} {member.lastName}
                          {member.role === 'expert' && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                              <Award className="h-3 w-3 mr-1" />
                              Expert
                            </Badge>
                          )}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{member.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Farm Size:</span>
                        <span className="font-medium">{member.farmSize}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600 block mb-1">Crops:</span>
                        <div className="flex flex-wrap gap-1">
                          {member.cropTypes.map(crop => (
                            <Badge key={crop} variant="secondary" className="text-xs">
                              {crop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-3 pt-3 border-t">
                        <span>Member since: {new Date(member.memberSince).toLocaleDateString()}</span>
                        {member.lastActive && (
                          <span>Last active: {formatTimeAgo(member.lastActive)}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;

const getMockDiscussions = (): Discussion[] => [
  {
    id: '1',
    title: 'Best practices for drought-resistant farming',
    content: 'I\'ve been experimenting with drought-resistant crops and would love to share my findings with the community. What methods have you found effective?',
    author: {
      id: 'user1',
      name: 'Samuel Kariuki',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
      location: 'Nairobi, Kenya',
      reputation: 92,
      isExpert: true
    },
    category: 'crop-management',
    tags: ['drought', 'resistance', 'maize'],
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-15T10:30:00Z',
    replies: [
      {
        id: 'r1',
        content: 'I\'ve had great success with drought-resistant varieties of sorghum. The yields are surprisingly good even in dry seasons.',
        author: {
          id: 'user2',
          name: 'Grace Njeri',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
          isExpert: false
        },
        createdAt: '2023-06-15T12:45:00Z',
        likes: 5,
        isLiked: false
      }
    ],
    likes: 12,
    views: 87,
    isLiked: false,
    isPinned: true
  },
  {
    id: '2',
    title: 'Organic pest control methods for tomatoes',
    content: 'My tomato plants have been struggling with pests lately. What organic solutions have worked for you?',
    author: {
      id: 'user3',
      name: 'David Ochieng',
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100',
      location: 'Kisumu, Kenya',
      reputation: 75,
      isExpert: false
    },
    category: 'pest-control',
    tags: ['tomatoes', 'pests', 'organic'],
    createdAt: '2023-06-14T09:15:00Z',
    updatedAt: '2023-06-14T09:15:00Z',
    replies: [],
    likes: 8,
    views: 42,
    isLiked: false,
    isPinned: false
  }
];

const getMockCommunityMembers = (): CommunityMember[] => [
  {
    id: 'user1',
    firstName: 'Samuel',
    lastName: 'Kariuki',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
    location: 'Nairobi, Kenya',
    role: 'expert',
    farmSize: 'large',
    cropTypes: ['maize', 'beans', 'vegetables'],
    memberSince: '2022-01-15T10:30:00Z',
    lastActive: '2023-06-15T10:30:00Z'
  },
  {
    id: 'user2',
    firstName: 'Grace',
    lastName: 'Njeri',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    location: 'Mombasa, Kenya',
    role: 'user',
    farmSize: 'medium',
    cropTypes: ['rice', 'coconut'],
    memberSince: '2022-03-22T09:15:00Z',
    lastActive: '2023-06-14T09:15:00Z'
  },
  {
    id: 'user3',
    firstName: 'David',
    lastName: 'Ochieng',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100',
    location: 'Kisumu, Kenya',
    role: 'user',
    farmSize: 'small',
    cropTypes: ['tomatoes', 'onions'],
    memberSince: '2022-05-30T14:20:00Z',
    lastActive: '2023-06-13T14:20:00Z'
  }
];