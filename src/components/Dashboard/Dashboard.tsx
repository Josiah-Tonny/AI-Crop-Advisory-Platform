import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CloudRain, 
  Thermometer, 
  Sprout,
  AlertTriangle,
  Calendar,
  BarChart3,
  X,
  Droplets,
  Wind,
  Sun,
  Activity,
  Target,
  Clock,
  CheckCircle,
  Zap,
  Leaf,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { weatherService } from '../../services/api';
import toast from 'react-hot-toast';

// Enhanced UI Components
import { PageTransition } from '../ui/page-transition';
import { PullToRefresh } from '../ui/pull-to-refresh';
import { StatCard, AnimatedCard } from '../ui/animated-card';
import { SkeletonCard } from '../ui/skeleton';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const { user, isTrialExpired } = useAuth();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTrialWarning, setShowTrialWarning] = useState(false);

  useEffect(() => {
    if (user && user.subscriptionTier === 'free' && isTrialExpired()) {
      setShowTrialWarning(true);
      toast.error('Your free trial has expired. Upgrade to continue using premium features.');
    }
  }, [user, isTrialExpired]);

  const fetchWeatherData = async () => {
    if (user?.location) {
      try {
        setLoading(true);
        // First get coordinates from location string
        const locationData = await weatherService.searchLocation(user.location);
        if (locationData.length > 0) {
          const { lat, lon } = locationData[0];
          const response = await weatherService.getCurrentWeather(lat, lon);
          
          // Transform the response to match expected format
          setWeatherData({
            current: {
              temp_c: response.temperature,
              feelslike_c: response.temperature + 2, // Approximate
              humidity: response.humidity,
              wind_kph: response.windSpeed * 3.6, // Convert m/s to km/h
              condition: { text: response.condition },
              uv: response.uvIndex
            }
          });
        }
      } catch (error) {
        // Error handling for fetching weather data
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [user]);

  const handleRefresh = async () => {
    await fetchWeatherData();
  };

  const statsCards = [
    {
      label: 'Estimated Yield',
      value: '2.3 tons/ha',
      change: { value: 15, trend: 'up' as const },
      icon: <TrendingUp className="h-6 w-6" />,
    },
    {
      label: 'Temperature',
      value: weatherData ? `${weatherData.current.temp_c}°C` : '--°C',
      icon: <Thermometer className="h-6 w-6" />,
    },
    {
      label: 'Humidity',
      value: weatherData ? `${weatherData.current.humidity}%` : '--%',
      icon: <CloudRain className="h-6 w-6" />,
    },
    {
      label: 'Active Crops',
      value: user?.cropTypes?.length || 0,
      icon: <Sprout className="h-6 w-6" />,
    },
  ];

  const recentActivities = [
    { id: 1, activity: 'Soil pH analysis completed', time: '2 hours ago', type: 'analysis' },
    { id: 2, activity: 'Weather alert: Heavy rain expected', time: '4 hours ago', type: 'alert' },
    { id: 3, activity: 'Crop recommendation updated', time: '6 hours ago', type: 'recommendation' },
    { id: 4, activity: 'Fertilizer application scheduled', time: '1 day ago', type: 'schedule' },
  ];

  const upcomingTasks = [
    { id: 1, task: 'Apply organic fertilizer', date: '2024-01-15', priority: 'high' },
    { id: 2, task: 'Soil moisture check', date: '2024-01-17', priority: 'medium' },
    { id: 3, task: 'Pest inspection', date: '2024-01-20', priority: 'low' },
  ];

  return (
    <PageTransition>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Trial Warning */}
          {showTrialWarning && (
            <AnimatedCard 
              animation="slide" 
              className="bg-gradient-to-r from-orange-100 to-red-100 border-orange-200/60 overflow-hidden shadow-lg"
            >
              <div className="p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 animate-pulse"></div>
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-500 rounded-full blur-sm opacity-75 animate-pulse"></div>
                      <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-12">
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold bg-gradient-to-r from-orange-800 to-red-800 bg-clip-text text-transparent mb-1">Free Trial Expired</h3>
                      <p className="text-sm text-orange-700 font-medium">
                        Your 14-day free trial has ended. Upgrade to premium to continue accessing all features.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => setShowTrialWarning(false)}
                      className={cn(
                        "p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-200/50",
                        "rounded-lg transition-all touch-target transform hover:scale-110"
                      )}
                      aria-label="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button className={cn(
                      "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold",
                      "transition-all touch-target whitespace-nowrap transform hover:scale-105 hover:shadow-lg"
                    )}>
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Welcome Section */}
          <AnimatedCard 
            animation="fade" 
            className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 border-0 text-white overflow-hidden shadow-2xl relative"
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
            </div>
            <div className="p-8 relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-sm animate-pulse"></div>
                  <div className="relative bg-white/20 backdrop-blur-sm p-3 rounded-full">
                    <Leaf className="h-8 w-8 text-white" />
                  </div>
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    Welcome back, {user?.firstName || user?.name}!
                  </h1>
                </div>
              </div>
              <p className="text-green-50 text-base md:text-lg font-medium flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-200" />
                {user?.subscriptionTier === 'free' && !isTrialExpired() 
                  ? `Your free trial is active. Here's your daily overview.`
                  : user?.subscriptionTier === 'free' && isTrialExpired()
                  ? `Limited access mode. Upgrade to unlock all features.`
                  : `Your farm is performing well. Here's your daily overview.`
                }
              </p>
            </div>
          </AnimatedCard>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonCard key={i} shimmer />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {statsCards.map((card, index) => (
                <StatCard
                  key={index}
                  label={card.label}
                  value={card.value}
                  change={card.change}
                  icon={card.icon}
                  delay={index * 50}
                />
              ))}
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Recent Activities */}
            <AnimatedCard animation="slide" delay={200} hover="lift" className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-75 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg shadow-md">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Recent Activities</h2>
                </div>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div 
                      key={activity.id} 
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl",
                        "bg-white/50 backdrop-blur-sm border border-gray-200/60",
                        "hover:bg-white hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]",
                        "animate-fade-in-up",
                        `animate-delay-${index * 50}`
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-xl shrink-0 shadow-sm transform transition-all duration-300 hover:scale-110",
                        activity.type === 'alert' && 'bg-gradient-to-r from-red-100 to-red-200 text-red-600',
                        activity.type === 'analysis' && 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600',
                        activity.type === 'recommendation' && 'bg-gradient-to-r from-green-100 to-green-200 text-green-600',
                        activity.type === 'schedule' && 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600'
                      )}>
                        {activity.type === 'alert' ? <AlertTriangle className="h-5 w-5" /> :
                         activity.type === 'analysis' ? <BarChart3 className="h-5 w-5" /> :
                         activity.type === 'recommendation' ? <Sprout className="h-5 w-5" /> :
                         <Calendar className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{activity.activity}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>

            {/* Upcoming Tasks */}
            <AnimatedCard animation="slide" delay={250} hover="lift" className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500 rounded-full blur-sm opacity-75 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg shadow-md">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Upcoming Tasks</h2>
                </div>
                <div className="space-y-3">
                  {upcomingTasks.map((task, index) => (
                    <div 
                      key={task.id} 
                      className={cn(
                        "flex items-center justify-between gap-4 p-4 rounded-xl",
                        "bg-white/50 backdrop-blur-sm border border-gray-200/60",
                        "hover:bg-white hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]",
                        "animate-fade-in-up",
                        `animate-delay-${index * 50}`
                      )}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={cn(
                          "w-4 h-4 rounded-full shrink-0 shadow-sm animate-pulse",
                          task.priority === 'high' && 'bg-gradient-to-r from-red-400 to-red-600',
                          task.priority === 'medium' && 'bg-gradient-to-r from-orange-400 to-orange-600',
                          task.priority === 'low' && 'bg-gradient-to-r from-green-400 to-green-600'
                        )}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{task.task}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.date}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-full shrink-0 shadow-sm",
                        task.priority === 'high' && 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300',
                        task.priority === 'medium' && 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300',
                        task.priority === 'low' && 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                      )}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Weather Forecast */}
          {loading ? (
            <SkeletonCard shimmer />
          ) : weatherData ? (
            <AnimatedCard animation="scale" delay={300} hover="lift" className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-sky-500 rounded-full blur-sm opacity-75 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-sky-500 to-blue-500 p-2 rounded-lg shadow-md">
                      <Sun className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Current Weather</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-50 border border-orange-200/60 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="flex justify-center mb-3">
                      <div className="bg-gradient-to-r from-orange-400 to-red-400 p-3 rounded-full shadow-md">
                        <Thermometer className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-orange-800 mb-2">Temperature</p>
                    <p className="text-3xl font-bold text-orange-900">{weatherData.current.temp_c}°C</p>
                    <p className="text-xs text-orange-600 mt-2 flex items-center justify-center gap-1">
                      <Droplets className="w-3 h-3" />
                      Feels like {weatherData.current.feelslike_c}°C
                    </p>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-50 border border-blue-200/60 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="flex justify-center mb-3">
                      <div className="bg-gradient-to-r from-blue-400 to-cyan-400 p-3 rounded-full shadow-md">
                        <CloudRain className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-blue-800 mb-2">Humidity</p>
                    <p className="text-3xl font-bold text-blue-900">{weatherData.current.humidity}%</p>
                    <p className="text-xs text-blue-600 mt-2 flex items-center justify-center gap-1">
                      <Wind className="w-3 h-3" />
                      Wind: {weatherData.current.wind_kph} km/h
                    </p>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-50 border border-green-200/60 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="flex justify-center mb-3">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-3 rounded-full shadow-md">
                        <Sun className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-green-800 mb-2">Condition</p>
                    <p className="text-lg font-bold text-green-900">{weatherData.current.condition.text}</p>
                    <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                      <Zap className="w-3 h-3" />
                      UV Index: {weatherData.current.uv}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ) : null}
        </div>
      </PullToRefresh>
    </PageTransition>
  );
};

export default Dashboard;