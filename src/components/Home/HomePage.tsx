import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Brain, 
  CloudRain, 
  Sprout, 
  TestTube, 
  TrendingUp,
  Users,
  Award,
  Globe,
  Zap,
  CheckCircle,
  Star,
  Play,
  ChevronRight,
  Leaf,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Animated counter hook
  const useCounter = (end: number, duration = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, [end, duration]);

    return count;
  };

  const farmersCount = useCounter(50000);
  const yieldIncrease = useCounter(25);
  const countriesCount = useCounter(15);
  const accuracyCount = useCounter(94);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Advisory',
      description: 'Get intelligent crop recommendations based on real-time weather data and soil conditions.',
      details: 'Our AI analyzes over 100+ parameters to give you personalized farming advice',
      href: '/ai-advisory',
      gradient: 'from-purple-500 to-purple-600',
      badge: 'Popular',
      stats: '10K+ daily advisories'
    },
    {
      icon: CloudRain,
      title: 'Weather Forecasting',
      description: 'Accurate 7-day weather forecasts with agricultural insights and alerts.',
      details: 'Get hyper-local weather predictions with 95% accuracy',
      href: '/weather',
      gradient: 'from-blue-500 to-blue-600',
      stats: '24/7 monitoring'
    },
    {
      icon: TestTube,
      title: 'Soil Analysis',
      description: 'Comprehensive soil health assessment with nutrient management recommendations.',
      details: 'Digital soil testing with instant results and actionable insights',
      href: '/soil',
      gradient: 'from-amber-500 to-amber-600',
      stats: '15+ soil metrics'
    },
    {
      icon: Sprout,
      title: 'Crop Management',
      description: 'Monitor crop health, track growth stages, and optimize farming practices.',
      details: 'Track your crops from seed to harvest with AI-powered insights',
      href: '/crops',
      gradient: 'from-green-500 to-green-600',
      badge: 'New',
      stats: '50+ crop types'
    }
  ];

  const stats = [
    { label: 'Farmers Served', value: farmersCount.toLocaleString(), suffix: '+', icon: Users, color: 'from-green-400 to-emerald-500' },
    { label: 'Yield Increase', value: yieldIncrease, suffix: '%', icon: TrendingUp, color: 'from-blue-400 to-blue-500' },
    { label: 'Countries', value: countriesCount, suffix: '', icon: Globe, color: 'from-purple-400 to-purple-500' },
    { label: 'AI Accuracy', value: accuracyCount, suffix: '%', icon: Zap, color: 'from-amber-400 to-amber-500' }
  ];

  const testimonials = [
    {
      name: 'Sarah Mwangi',
      location: 'Kenya',
      crop: 'Maize Farmer',
      quote: 'FARM AI helped me increase my yield by 35% in just one season. The weather alerts saved my crops!',
      rating: 5,
      avatar: 'SM'
    },
    {
      name: 'John Banda',
      location: 'Zambia',
      crop: 'Coffee Farmer',
      quote: 'The soil analysis feature is incredible. I now know exactly what my crops need.',
      rating: 5,
      avatar: 'JB'
    },
    {
      name: 'Grace Omondi',
      location: 'Uganda',
      crop: 'Vegetable Farmer',
      quote: 'Best investment for my farm. The AI advisory is like having an expert agronomist in my pocket!',
      rating: 5,
      avatar: 'GO'
    }
  ];

  const benefits = [
    'Real-time AI crop recommendations',
    'Hyper-local weather forecasting',
    'Soil health monitoring',
    'Pest & disease detection',
    'Market price insights',
    'Expert agronomist support'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-7xl mx-auto">
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <Award className="h-4 w-4 text-green-600" />
              <span className="font-medium">Award-Winning Platform</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">Trusted by 50K+ Farmers</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="font-medium">4.9/5 Rating</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2 rounded-full mb-6 shadow-lg">
              <Leaf className="h-4 w-4" />
              <span className="text-sm font-semibold">AI-Powered Agriculture Platform</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-fadeIn">
              Transform Your Farm with
              <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent mt-2">
                AI-Powered Insights
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-3xl mx-auto">
              Empowering smallholder farmers across East and Central Africa with intelligent 
              agricultural solutions. Increase yields by 25%, optimize resources, and build sustainable farming practices.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate('/ai-advisory')}
                className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Get AI Advisory
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setIsVideoOpen(true)}
                className="group bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center gap-2 border border-gray-200"
              >
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Stats Section with Animation */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/50"
              >
                <div className={`bg-gradient-to-br ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full mb-4">
            <span className="text-green-700 font-semibold text-sm">POWERFUL FEATURES</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with practical farming expertise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              onMouseEnter={() => setActiveFeature(index)}
              className={`group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 cursor-pointer ${
                activeFeature === index ? 'border-green-500 scale-105' : 'border-transparent'
              }`}
            >
              {feature.badge && (
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {feature.badge}
                  </span>
                </div>
              )}

              <div className={`bg-gradient-to-br ${feature.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {feature.description}
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <BarChart3 className="h-4 w-4" />
                <span>{feature.stats}</span>
              </div>

              <button 
                onClick={() => navigate(feature.href)}
                className="group/btn flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all"
              >
                Explore Feature
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform origin-left transition-transform duration-500 ${
                activeFeature === index ? 'scale-x-100' : 'scale-x-0'
              }`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Why Farmers Choose FARM AI
              </h2>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Join thousands of farmers who are already transforming their farming practices with our AI-powered platform
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-green-200 flex-shrink-0 mt-1" />
                    <span className="text-green-50">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                  <Star className="h-5 w-5 text-amber-300" />
                  <span className="font-semibold">Success Stories</span>
                </div>
              </div>
              
              {testimonials.map((testimonial, index) => (
                <div key={index} className={`mb-6 ${index === testimonials.length - 1 ? '' : 'pb-6 border-b border-white/20'}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-300 text-amber-300" />
                        ))}
                      </div>
                      <p className="text-green-50 text-sm italic mb-2">"{testimonial.quote}"</p>
                      <div className="flex items-center gap-2 text-xs text-green-200">
                        <span className="font-semibold">{testimonial.name}</span>
                        <span>•</span>
                        <span>{testimonial.crop}</span>
                        <span>•</span>
                        <span>{testimonial.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 rounded-3xl p-12 lg:p-16 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>

          <div className="relative text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Brain className="h-10 w-10 text-white" />
            </div>
            
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Farm?
            </h3>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers who are already using AI to increase their yields by 25% and optimize their farming practices
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/ai-advisory')}
                className="group bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Your AI Advisory
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300">
                Learn More
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Free 30-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoOpen && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsVideoOpen(false)}
        >
          <div className="bg-white rounded-3xl p-2 max-w-5xl w-full shadow-2xl animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center text-white relative">
              <button 
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
              <div className="text-center">
                <Play className="h-20 w-20 mx-auto mb-4 text-green-400" />
                <p className="text-xl font-semibold mb-2">Demo Video</p>
                <p className="text-sm text-gray-400">Replace with your video embed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HomePage;