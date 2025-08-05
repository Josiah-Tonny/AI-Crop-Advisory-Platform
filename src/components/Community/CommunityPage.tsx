import React, { useState, useEffect } from 'react';
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
  BookOpen
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

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newDiscussion, setNewDiscussion] = useState<NewDiscussion>({
    title: '',
    content: '',
    category: 'general',
    tags: [],
    images: []
  });
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadDiscussions();
  }, [selectedCategory, searchTerm]);

  const loadDiscussions = async () => {
    setLoading(true);
    try {
      // Simulate API call with real-looking data
      const mockDiscussions: Discussion[] = [
        {
          id: '1',
          title: 'Maize yellowing after recent rains - need urgent help!',
          content: 'My maize crop started yellowing after the heavy rains last week. The plants are about 1 meter tall. I\'m in Nakuru and this is my second season. Has anyone experienced this? Could it be waterlogging or a nutrient deficiency?',
          author: {
            id: '1',
            name: 'John Kamau',
            avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
            location: 'Nakuru, Kenya',
            reputation: 85,
            isExpert: false
          },
          category: 'crop-management',
          tags: ['maize', 'yellowing', 'rainfall', 'urgent'],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          replies: [
            {
              id: '1-1',
              content: 'This sounds like waterlogging combined with nitrogen deficiency. Check if water is pooling around your plants. You might need to create drainage channels and apply some nitrogen fertilizer once the soil drains.',
              author: {
                id: '2',
                name: 'Dr. Sarah Muthoni',
                avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
                isExpert: true
              },
              createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
              likes: 12,
              isLiked: false
            }
          ],
          likes: 24,
          views: 156,
          isLiked: false,
          isPinned: false
        },
        {
          id: '2',
          title: 'Organic pest control methods that actually work - my 3-year experience',
          content: 'After 3 years of experimenting with organic pest control, I want to share what really works. Neem oil + soap solution has been 90% effective against aphids. Companion planting with marigolds reduced pest damage by 70%. Here are the detailed recipes and application methods...',
          author: {
            id: '3',
            name: 'Mary Wanjiku',
            avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
            location: 'Kiambu, Kenya',
            reputation: 92,
            isExpert: false
          },
          category: 'pest-control',
          tags: ['organic', 'pestcontrol', 'neem', 'companion-planting', 'success-story'],
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          replies: [],
          likes: 45,
          views: 234,
          isLiked: true,
          isPinned: true
        }
      ];

      // Filter discussions based on category and search
      let filtered = mockDiscussions;
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(d => d.category === selectedCategory);
      }
      if (searchTerm) {
        filtered = filtered.filter(d => 
          d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setDiscussions(filtered);
    } catch (error) {
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    try {
      // Simulate API call
      const discussion: Discussion = {
        id: Date.now().toString(),
        title: newDiscussion.title,
        content: newDiscussion.content,
        author: {
          id: user?.id || '1',
          name: user?.firstName + ' ' + user?.lastName || user?.name || 'Current User', // Fix name access
          avatar: user?.avatar || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
          location: user?.location || 'Unknown',
          reputation: 50,
          isExpert: false
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
    } catch (error) {
      toast.error('Failed to create discussion');
    }
  };

  const handleLikeDiscussion = async (discussionId: string) => {
    setDiscussions(prev => prev.map(d => {
      if (d.id === discussionId) {
        return {
          ...d,
          isLiked: !d.isLiked,
          likes: d.isLiked ? d.likes - 1 : d.likes + 1
        };
      }
      return d;
    }));
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
    { id: 'trending', name: 'Trending', icon: TrendingUp, count: 12 },
    { id: 'experts', name: 'Expert Advice', icon: Award, count: 8 },
    { id: 'events', name: 'Events', icon: Calendar, count: 5 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Farmer Community</h1>
            <p className="text-green-100">Connect, learn, and grow together with farmers across Africa</p>
          </div>
          <div className="text-center">
            <div className="bg-white bg-opacity-20 p-4 rounded-full mb-2">
              <Users className="h-8 w-8" />
            </div>
            <p className="text-sm">12,450+ Active Farmers</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">3,284</p>
            <p className="text-sm text-gray-600">Active Discussions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">156</p>
            <p className="text-sm text-gray-600">Agricultural Experts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">892</p>
            <p className="text-sm text-gray-600">Knowledge Articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">15,642</p>
            <p className="text-sm text-gray-600">Solutions Shared</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation and Filters */}
      <Card>
        <CardContent className="p-6">
          {/* Tabs */}
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

          {/* Search and Filters */}
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
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              aria-label="Select discussion category"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <Button 
              onClick={() => setShowNewDiscussion(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          </div>

          {/* Category Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.slice(1).map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Discussion Modal */}
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
              <Button onClick={handleCreateDiscussion} className="bg-green-600 hover:bg-green-700">
                <Send className="h-4 w-4 mr-2" />
                Post Discussion
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discussions List */}
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
              <Card key={discussion.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={discussion.author.avatar} 
                      alt={discussion.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 hover:text-green-600 cursor-pointer">
                            {discussion.title}
                          </h3>
                          {discussion.isPinned && (
                            <Badge variant="secondary" className="text-xs">Pinned</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === discussion.category)?.name}
                          </Badge>
                        </div>
                      </div>

                      {/* Author info */}
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

                      {/* Content */}
                      <p className="text-gray-700 mb-4 line-clamp-3">{discussion.content}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {discussion.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => handleLikeDiscussion(discussion.id)}
                            className={`flex items-center space-x-1 hover:text-red-600 transition-colors ${
                              discussion.isLiked ? 'text-red-600' : ''
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${discussion.isLiked ? 'fill-current' : ''}`} />
                            <span>{discussion.likes}</span>
                          </button>
                          <div className="flex items-center space-x-1">
                            <Reply className="h-4 w-4" />
                            <span>{discussion.replies.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs">👁</span>
                            </div>
                            <span>{discussion.views}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-600">
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>

                      {/* Latest Reply Preview */}
                      {discussion.replies.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                          <div className="flex items-center space-x-2 mb-2">
                            <img 
                              src={discussion.replies[0].author.avatar} 
                              alt={discussion.replies[0].author.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm font-medium">{discussion.replies[0].author.name}</span>
                            {discussion.replies[0].author.isExpert && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">Expert</Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(discussion.replies[0].createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">{discussion.replies[0].content}</p>
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
    </div>
  );
};

export default CommunityPage;