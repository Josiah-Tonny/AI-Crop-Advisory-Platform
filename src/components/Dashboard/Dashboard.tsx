import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CloudRain, 
  Thermometer, 
  Sprout,
  AlertTriangle,
  Calendar,
  BarChart3
} from 'lucide-react';
import StatsCard from './StatsCard';
import { useAuth } from '../../contexts/AuthContext';
import { weatherService } from '../../services/api';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (user?.location) {
        try {
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
      }
    };

    fetchWeatherData();
  }, [user]);

  const statsCards = [
    {
      title: 'Estimated Yield',
      value: '2.3 tons/hectare',
      icon: TrendingUp,
      trend: { value: 15, isPositive: true },
      color: 'green' as const,
    },
    {
      title: 'Current Temperature',
      value: weatherData ? `${weatherData.current.temp_c}°C` : '--°C',
      icon: Thermometer,
      color: 'orange' as const,
    },
    {
      title: 'Humidity',
      value: weatherData ? `${weatherData.current.humidity}%` : '--%',
      icon: CloudRain,
      color: 'blue' as const,
    },
    {
      title: 'Active Crops',
      value: user?.cropTypes?.length || 0,
      icon: Sprout,
      color: 'green' as const,
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
    <div className="space-y-6">
      {/* Trial Warning */}
      {showTrialWarning && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-800">Free Trial Expired</h3>
                <p className="text-sm text-orange-600">
                  Your 14-day free trial has ended. Upgrade to premium to continue accessing all features.
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowTrialWarning(false)}
                className="text-orange-600 hover:text-orange-800 text-sm"
              >
                Dismiss
              </button>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName || user?.name}!
        </h1>
        <p className="text-green-100">
          {user?.subscriptionTier === 'free' && !isTrialExpired() 
            ? `Your free trial is active. Here's your daily overview.`
            : user?.subscriptionTier === 'free' && isTrialExpired()
            ? `Limited access mode. Upgrade to unlock all features.`
            : `Your farm is performing well. Here's your daily overview.`
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-full ${
                  activity.type === 'alert' ? 'bg-red-100 text-red-600' :
                  activity.type === 'analysis' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'recommendation' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.type === 'alert' ? <AlertTriangle className="h-4 w-4" /> :
                   activity.type === 'analysis' ? <BarChart3 className="h-4 w-4" /> :
                   activity.type === 'recommendation' ? <Sprout className="h-4 w-4" /> :
                   <Calendar className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.activity}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h2>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.task}</p>
                    <p className="text-xs text-gray-500">{task.date}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weather Forecast */}
      {weatherData && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Weather</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Temperature</p>
              <p className="text-2xl font-bold text-gray-900">{weatherData.current.temp_c}°C</p>
              <p className="text-xs text-gray-500">Feels like {weatherData.current.feelslike_c}°C</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Humidity</p>
              <p className="text-2xl font-bold text-gray-900">{weatherData.current.humidity}%</p>
              <p className="text-xs text-gray-500">Wind: {weatherData.current.wind_kph} km/h</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Condition</p>
              <p className="text-lg font-semibold text-gray-900">{weatherData.current.condition.text}</p>
              <p className="text-xs text-gray-500">UV Index: {weatherData.current.uv}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;