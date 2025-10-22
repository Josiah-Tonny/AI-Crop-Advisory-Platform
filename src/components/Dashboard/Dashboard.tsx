import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CloudRain, 
  Thermometer, 
  Sprout,
  AlertTriangle,
  Calendar,
  BarChart3,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { weatherService } from '../../services/api';
import toast from 'react-hot-toast';

// Enhanced UI Components
import { PageTransition } from '../ui/page-transition';
import { PullToRefresh } from '../ui/pull-to-refresh';
import { StatCard, AnimatedCard } from '../ui/animated-card';
import { SkeletonCard, SkeletonText } from '../ui/skeleton';
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
        console.error('Error fetching weather data:', error);
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
              className="bg-orange-50 border-orange-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className="h-6 w-6 text-orange-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-orange-800 mb-1">Free Trial Expired</h3>
                      <p className="text-sm text-orange-600">
                        Your 14-day free trial has ended. Upgrade to premium to continue accessing all features.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => setShowTrialWarning(false)}
                      className={cn(
                        "p-1.5 text-orange-600 hover:text-orange-800 hover:bg-orange-100",
                        "rounded-md transition-all touch-target"
                      )}
                      aria-label="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button className={cn(
                      "bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold",
                      "hover:bg-orange-700 transition-all touch-target whitespace-nowrap"
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
            className="bg-gradient-to-r from-green-600 to-green-800 border-0 text-white overflow-hidden"
          >
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {user?.firstName || user?.name}!
              </h1>
              <p className="text-green-100 text-sm md:text-base">
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
            <AnimatedCard animation="slide" delay={200} hover="lift">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
                <div className="space-y-2">
                  {recentActivities.map((activity, index) => (
                    <div 
                      key={activity.id} 
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg",
                        "hover:bg-gray-50 transition-all duration-200",
                        "animate-fade-in-up"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={cn(
                        "p-2 rounded-full shrink-0",
                        activity.type === 'alert' && 'bg-red-100 text-red-600',
                        activity.type === 'analysis' && 'bg-blue-100 text-blue-600',
                        activity.type === 'recommendation' && 'bg-green-100 text-green-600',
                        activity.type === 'schedule' && 'bg-gray-100 text-gray-600'
                      )}>
                        {activity.type === 'alert' ? <AlertTriangle className="h-4 w-4" /> :
                         activity.type === 'analysis' ? <BarChart3 className="h-4 w-4" /> :
                         activity.type === 'recommendation' ? <Sprout className="h-4 w-4" /> :
                         <Calendar className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{activity.activity}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>

            {/* Upcoming Tasks */}
            <AnimatedCard animation="slide" delay={250} hover="lift">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h2>
                <div className="space-y-2">
                  {upcomingTasks.map((task, index) => (
                    <div 
                      key={task.id} 
                      className={cn(
                        "flex items-center justify-between gap-3 p-3 rounded-lg",
                        "hover:bg-gray-50 transition-all duration-200",
                        "animate-fade-in-up"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={cn(
                          "w-3 h-3 rounded-full shrink-0",
                          task.priority === 'high' && 'bg-red-500',
                          task.priority === 'medium' && 'bg-orange-500',
                          task.priority === 'low' && 'bg-green-500'
                        )}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{task.task}</p>
                          <p className="text-xs text-gray-500">{task.date}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full shrink-0",
                        task.priority === 'high' && 'bg-red-100 text-red-800',
                        task.priority === 'medium' && 'bg-orange-100 text-orange-800',
                        task.priority === 'low' && 'bg-green-100 text-green-800'
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
            <AnimatedCard animation="scale" delay={300} hover="lift">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Weather</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-transparent">
                    <p className="text-sm text-gray-600 mb-1">Temperature</p>
                    <p className="text-3xl font-bold text-gray-900">{weatherData.current.temp_c}°C</p>
                    <p className="text-xs text-gray-500 mt-1">Feels like {weatherData.current.feelslike_c}°C</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-transparent">
                    <p className="text-sm text-gray-600 mb-1">Humidity</p>
                    <p className="text-3xl font-bold text-gray-900">{weatherData.current.humidity}%</p>
                    <p className="text-xs text-gray-500 mt-1">Wind: {weatherData.current.wind_kph} km/h</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-transparent">
                    <p className="text-sm text-gray-600 mb-1">Condition</p>
                    <p className="text-lg font-semibold text-gray-900">{weatherData.current.condition.text}</p>
                    <p className="text-xs text-gray-500 mt-1">UV Index: {weatherData.current.uv}</p>
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