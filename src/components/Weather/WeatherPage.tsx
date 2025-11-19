import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  Eye, 
  Gauge,
  MapPin,
  Search,
  RefreshCw,
  Calendar,
  TrendingUp,
  Sparkles,
  Zap,
  AlertTriangle,
  Sunrise,
  Sunset,
  Compass,
  Waves,
  CloudSnow,
  CloudLightning,
  Navigation,
  Locate
} from 'lucide-react';
import ErrorFallback from '../ui/ErrorFallback';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { weatherService } from '../../services/weatherService'; // Use the enhanced weather service
import { ToastAction } from "../ui/toast"
import { useToast } from "../ui/use-toast"

// Enhanced UI Components
import { PageTransition } from '../ui/page-transition';
import { PullToRefresh } from '../ui/pull-to-refresh';
import { AnimatedCard } from '../ui/animated-card';
import { SkeletonCard, Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface AirQualityData {
  list: Array<{
    main: {
      aqi: number;
    };
    components: {
      co: number;
      no2: number;
      o3: number;
      pm2_5: number;
      pm10: number;
      so2: number;
    };
  }>;
}

interface ForecastItem {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    temp_max: number;
    temp_min: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  pop: number;
  rain?: {
    '3h': number;
  };
}

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind: { 
      speed: number;
      deg: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    visibility: number;
    name: string;
  };
  forecast: {
    list: ForecastItem[];
  };
  airQuality: AirQualityData;
  location: string;
}

const WeatherPage: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState({ lat: -1.2921, lon: 36.8219 }); // Nairobi default
  const { toast } = useToast();

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      // Use the improved weather service for real-time data
      const weatherData = await weatherService.getCurrentWeather(currentLocation.lat, currentLocation.lon);
      
      // Process the weather data into our standardized format
      let processedWeatherData: WeatherData;
      
      // Check if we have a raw OpenWeather API response
      if (weatherData.main && weatherData.weather) {
        // Direct OpenWeather API response
        processedWeatherData = {
          current: {
            temp: weatherData.main.temp,
            feels_like: weatherData.main.feels_like,
            humidity: weatherData.main.humidity,
            pressure: weatherData.main.pressure,
            wind: { 
              speed: weatherData.wind?.speed || 0, 
              deg: weatherData.wind?.deg || 0 
            },
            weather: weatherData.weather,
            visibility: weatherData.visibility,
            name: weatherData.name
          },
          forecast: { list: [] }, // We'll need to fetch forecast separately
          airQuality: {
            list: [{
              main: { aqi: 1 }, // Default good air quality since we don't have real data
              components: {
                co: 0,
                no2: 0,
                o3: 0,
                pm2_5: 0,
                pm10: 0,
                so2: 0
              }
            }]
          },
          location: weatherData.name
        };
        
        // Try to fetch forecast data separately
        try {
          const forecastData = await weatherService.getForecast(currentLocation.lat, currentLocation.lon);
          if (Array.isArray(forecastData) && forecastData.length > 0) {
            interface ForecastDay {
              date: string;
              high: number;
              low: number;
              condition: string;
              icon: string;
              humidity: number;
              windSpeed: number;
              precipitation: number;
              precipitationChance: number;
            }
            
            const mappedForecast: ForecastItem[] = forecastData.map((day: ForecastDay) => ({
              dt: new Date(day.date).getTime() / 1000,
              dt_txt: `${day.date} 12:00:00`,
              main: {
                temp: (day.high + day.low) / 2,
                temp_max: day.high,
                temp_min: day.low,
                humidity: day.humidity
              },
              weather: [{ 
                main: day.condition ? day.condition.split(' ')[0] : 'Clear', 
                description: day.condition || 'clear sky', 
                icon: day.icon || '01d' 
              }],
              wind: { speed: day.windSpeed || 0 },
              pop: (day.precipitationChance || 0) / 100,
              rain: day.precipitation && day.precipitation > 0 ? { '3h': day.precipitation } : undefined
            }));
            
            processedWeatherData.forecast = { list: mappedForecast };
          }
        } catch (forecastError) {
          // Error handling for forecast data
        }
      } else {
        // Handle case where weatherData is already processed or in a different format
        const weatherCondition = weatherData.condition || 'clear sky';
        const weatherMain = weatherData.condition ? weatherData.condition.split(' ')[0] : 'Clear';
        const weatherIcon = weatherData.icon || '01d';
        
        const airQualityData = weatherData.airQuality || {
          aqi: 1,
          level: 'Good',
          pollutants: {
            pm25: 0,
            pm10: 0,
            o3: 0,
            no2: 0,
            so2: 0,
            co: 0
          }
        };
        
        processedWeatherData = {
          current: {
            temp: weatherData.temperature || weatherData.temp || 25,
            feels_like: weatherData.feels_like || (weatherData.temperature ? weatherData.temperature + 2 : 27),
            humidity: weatherData.humidity || 60,
            pressure: weatherData.pressure || 1013,
            wind: { 
              speed: weatherData.windSpeed || (weatherData.wind && weatherData.wind.speed) || 2,
              deg: (weatherData.wind && weatherData.wind.deg) || 0 
            },
            weather: weatherData.weather || [{ 
              main: weatherMain, 
              description: weatherCondition, 
              icon: weatherIcon 
            }],
            visibility: (weatherData.visibility || 10) * 1000,
            name: weatherData.name || (weatherData.location ? weatherData.location.split(',')[0] : 'Unknown')
          },
          forecast: { list: [] },
          airQuality: {
            list: [{
              main: { aqi: airQualityData.aqi || 1 },
              components: {
                co: airQualityData.pollutants?.co || 0,
                no2: airQualityData.pollutants?.no2 || 0,
                o3: airQualityData.pollutants?.o3 || 0,
                pm2_5: airQualityData.pollutants?.pm25 || 0,
                pm10: airQualityData.pollutants?.pm10 || 0,
                so2: airQualityData.pollutants?.so2 || 0
              }
            }]
          },
          location: weatherData.location || weatherData.name || 'Unknown Location'
        };
        
        // Process forecast data if available
        if (weatherData.forecast && Array.isArray(weatherData.forecast)) {
          interface ForecastDay {
            date: string;
            high: number;
            low: number;
            condition?: string;
            icon?: string;
            humidity?: number;
            windSpeed?: number;
            precipitation?: number;
            precipitationChance?: number;
          }
            
          const mappedForecast: ForecastItem[] = weatherData.forecast.map((day: ForecastDay) => ({
            dt: new Date(day.date).getTime() / 1000,
            dt_txt: `${day.date} 12:00:00`,
            main: {
              temp: (day.high + day.low) / 2,
              temp_max: day.high,
              temp_min: day.low,
              humidity: day.humidity || 0
            },
            weather: [{ 
              main: day.condition ? day.condition.split(' ')[0] : 'Clear', 
              description: day.condition || 'clear sky', 
              icon: day.icon || '01d' 
            }],
            wind: { speed: day.windSpeed || 0 },
            pop: (day.precipitationChance || 0) / 100,
            rain: day.precipitation && day.precipitation > 0 ? { '3h': day.precipitation } : undefined
          }));
          
          processedWeatherData.forecast = { list: mappedForecast };
        }
      }
      
      // Set the processed weather data to state
      setWeatherData(processedWeatherData);
    } catch (error) {
      // Error handling for weather data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, [currentLocation]);

  const handleRefresh = async () => {
    await loadWeatherData();
  };

  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const locations = await weatherService.searchLocation(searchQuery);
      if (locations.length > 0) {
        setCurrentLocation({ lat: locations[0].lat, lon: locations[0].lon });
      }
    } catch (error) {
      // Error handling for location search
    }
  };

  const getWeatherIcon = (condition: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'clear': <div className="relative"><div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm opacity-75 animate-pulse"></div><Sun className="w-8 h-8 text-yellow-500 relative" /></div>,
      'clouds': <div className="relative"><div className="absolute inset-0 bg-gray-400 rounded-full blur-sm opacity-50 animate-pulse"></div><Cloud className="w-8 h-8 text-gray-500 relative" /></div>,
      'rain': <div className="relative"><div className="absolute inset-0 bg-blue-400 rounded-full blur-sm opacity-75 animate-pulse"></div><CloudRain className="w-8 h-8 text-blue-500 relative" /></div>,
      'drizzle': <div className="relative"><div className="absolute inset-0 bg-blue-300 rounded-full blur-sm opacity-50 animate-pulse"></div><CloudRain className="w-8 h-8 text-blue-400 relative" /></div>,
      'thunderstorm': <div className="relative"><div className="absolute inset-0 bg-purple-500 rounded-full blur-sm opacity-75 animate-pulse"></div><CloudLightning className="w-8 h-8 text-purple-600 relative" /></div>,
      'snow': <div className="relative"><div className="absolute inset-0 bg-blue-200 rounded-full blur-sm opacity-50 animate-pulse"></div><CloudSnow className="w-8 h-8 text-blue-200 relative" /></div>,
      'mist': <div className="relative"><div className="absolute inset-0 bg-gray-300 rounded-full blur-sm opacity-50 animate-pulse"></div><Cloud className="w-8 h-8 text-gray-400 relative" /></div>
    };
    return iconMap[condition.toLowerCase()] || <div className="relative"><div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm opacity-75 animate-pulse"></div><Sun className="w-8 h-8 text-yellow-500 relative" /></div>;
  };

  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return { level: 'Good', color: 'bg-green-500', textColor: 'text-green-700' };
    if (aqi <= 100) return { level: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: 'bg-orange-500', textColor: 'text-orange-700' };
    if (aqi <= 200) return { level: 'Unhealthy', color: 'bg-red-500', textColor: 'text-red-700' };
    return { level: 'Very Unhealthy', color: 'bg-purple-500', textColor: 'text-purple-700' };
  };

  interface WeatherForFarmingAdvice {
    temp: number;
    humidity: number;
    wind?: {
      speed: number;
    };
    rain?: {
      '1h'?: number;
      '3h'?: number;
    };
  }

  const getFarmingAdvice = (weather: WeatherForFarmingAdvice) => {
    const advice = [];
    const temp = weather.temp;
    const humidity = weather.humidity;
    const windSpeed = weather.wind?.speed || 0;

    if (temp > 30) {
      advice.push('High temperature - ensure adequate irrigation and shade for livestock');
    } else if (temp < 15) {
      advice.push('Cool weather - protect sensitive crops from cold stress');
    }

    if (humidity > 80) {
      advice.push('High humidity - monitor for fungal diseases');
    } else if (humidity < 40) {
      advice.push('Low humidity - increase irrigation frequency');
    }

    if (windSpeed > 10) {
      advice.push('Strong winds - secure greenhouse structures and young plants');
    }

    if (weather.rain && weather.rain['1h'] && weather.rain['1h'] > 5) {
      advice.push('Heavy rainfall expected - ensure proper drainage');
    }

    return advice.length > 0 ? advice : ['Weather conditions are favorable for farming activities'];
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-10 w-80 mb-3 rounded-xl" shimmer />
            <Skeleton className="h-5 w-96 rounded-lg" shimmer />
          </div>

          {/* Search Skeleton */}
          <SkeletonCard shimmer className="h-16" />

          {/* Main Content Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <SkeletonCard shimmer className="h-96" />
            </div>
            <SkeletonCard shimmer className="h-96" />
          </div>

          <SkeletonCard shimmer className="h-64" />
          <SkeletonCard shimmer className="h-80" />
        </div>
      </PageTransition>
    );
  }

  if (!weatherData) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-md">
            <ErrorFallback 
              title="Weather Data Unavailable"
              message="Unable to load weather information. Please check your connection and try again."
              retry={loadWeatherData}
              isNetworkError={true}
            />
          </div>
        </div>
      </PageTransition>
    );
  }

  // Safely destructure weatherData
  const { 
    current = { 
      temp: 0, 
      feels_like: 0,
      humidity: 0,
      pressure: 0,
      wind: { speed: 0, deg: 0 },
      weather: [{ main: '', description: '', icon: '' }],
      visibility: 0
    }, 
    forecast = { list: [] }, 
    airQuality = { 
      list: [{ 
        main: { aqi: 0 }, 
        components: { 
          co: 0, 
          no2: 0, 
          o3: 0, 
          pm2_5: 0,
          pm10: 0,
          so2: 0 
        } 
      }] 
    } 
  } = weatherData;
  
  const aqiValue = airQuality.list[0]?.main?.aqi || 1;
  const aqiInfo = getAQILevel(aqiValue * 50 || 50);

  return (
    <PageTransition>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Header */}
          <div className="animate-fade-in relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-75 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-full shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-800 to-cyan-800 bg-clip-text text-transparent">Weather Dashboard</h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 font-medium">Real-time weather data and agricultural insights</p>
            </div>
          </div>

          {/* Location Search */}
          <AnimatedCard animation="slide" delay={50} className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-blue-50 to-white">
            <div className="p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 animate-pulse"></div>
              <div className="relative">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-50"></div>
                        <Search className="w-5 h-5 text-blue-600 relative" />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for a location..."
                      className={cn(
                        "w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-blue-200/60 rounded-xl",
                        "focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm",
                        "transition-all touch-target font-medium placeholder:text-gray-500"
                      )}
                      onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleLocationSearch} 
                      className={cn(
                        "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-bold",
                        "transition-all touch-target whitespace-nowrap transform hover:scale-105 hover:shadow-lg"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4" />
                        Search
                      </div>
                    </button>
                    <button 
                      onClick={loadWeatherData} 
                      className={cn(
                        "bg-white/80 backdrop-blur-sm border border-blue-200/60 hover:bg-blue-50 px-4 py-3 rounded-xl",
                        "transition-all touch-target transform hover:scale-105 hover:shadow-md"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-blue-600" />
                        <span className="hidden sm:inline text-blue-600 font-medium">Refresh</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Current Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <AnimatedCard animation="slide" delay={100} hover="lift" className="lg:col-span-2 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-white">
              <div className="p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 animate-pulse rounded-xl"></div>
                <div className="relative">
                  <h2 className="flex items-center text-xl font-bold mb-6 bg-gradient-to-r from-blue-800 to-cyan-800 bg-clip-text text-transparent">
                    <div className="relative mr-3">
                      <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
                      <MapPin className="w-6 h-6 text-blue-600 relative" />
                    </div>
                    {weatherData.location}
                  </h2>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center">
                      <div className="mr-6">
                        {getWeatherIcon(current.weather[0]?.main || 'clear')}
                      </div>
                      <div>
                        <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-800 to-cyan-800 bg-clip-text text-transparent">
                          {Math.round(current.temp)}°C
                        </div>
                        <div className="text-gray-700 capitalize text-base md:text-lg font-medium mt-1">
                          {current.weather[0]?.description || 'Clear sky'}
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl">
                      <div className="text-sm text-gray-600 font-medium">Feels like</div>
                      <div className="text-3xl font-bold text-blue-800">
                        {Math.round(current.feels_like)}°C
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl transition-all hover:shadow-md hover:scale-105">
                      <div className="relative mb-3">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
                        <Droplets className="w-7 h-7 text-blue-600 relative mx-auto" />
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Humidity</div>
                      <div className="font-bold text-lg text-blue-800">{current.humidity}%</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-50 rounded-xl transition-all hover:shadow-md hover:scale-105">
                      <div className="relative mb-3">
                        <div className="absolute inset-0 bg-green-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
                        <Wind className="w-7 h-7 text-green-600 relative mx-auto" />
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Wind Speed</div>
                      <div className="font-bold text-lg text-green-800">{current.wind?.speed || 0} m/s</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl transition-all hover:shadow-md hover:scale-105">
                      <div className="relative mb-3">
                        <div className="absolute inset-0 bg-purple-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
                        <Gauge className="w-7 h-7 text-purple-600 relative mx-auto" />
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Pressure</div>
                      <div className="font-bold text-lg text-purple-800">{current.pressure || 1013} hPa</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl transition-all hover:shadow-md hover:scale-105">
                      <div className="relative mb-3">
                        <div className="absolute inset-0 bg-orange-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
                        <Eye className="w-7 h-7 text-orange-600 relative mx-auto" />
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Visibility</div>
                      <div className="font-bold text-lg text-orange-800">{((current.visibility || 10000) / 1000).toFixed(1)} km</div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard animation="slide" delay={150} hover="lift" className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-white">
              <div className="p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse rounded-xl"></div>
                <div className="relative">
                  <h2 className="flex items-center text-xl font-bold mb-6 bg-gradient-to-r from-green-800 to-emerald-800 bg-clip-text text-transparent">
                    <div className="relative mr-3">
                      <div className="absolute inset-0 bg-green-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
                      <TrendingUp className="w-6 h-6 text-green-600 relative" />
                    </div>
                    Air Quality
                  </h2>

                  <div className="text-center mb-6">
                    <div className={`inline-block px-6 py-3 rounded-full text-white font-bold text-base shadow-lg transform hover:scale-105 transition-all ${aqiInfo.color}`}>
                      {aqiInfo.level}
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-800 to-emerald-800 bg-clip-text text-transparent mt-4">
                      AQI: {(airQuality.list[0]?.main?.aqi || 1) * 50}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all">
                      <span className="text-gray-700 font-medium">CO:</span>
                      <span className="font-bold text-blue-800">{(airQuality.list[0]?.components?.co || 0).toFixed(1)} μg/m³</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all">
                      <span className="text-gray-700 font-medium">NO₂:</span>
                      <span className="font-bold text-purple-800">{(airQuality.list[0]?.components?.no2 || 0).toFixed(1)} μg/m³</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all">
                      <span className="text-gray-700 font-medium">O₃:</span>
                      <span className="font-bold text-green-800">{(airQuality.list[0]?.components?.o3 || 0).toFixed(1)} μg/m³</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all">
                      <span className="text-gray-700 font-medium">PM2.5:</span>
                      <span className="font-bold text-orange-800">{(airQuality.list[0]?.components?.pm2_5 || 0).toFixed(1)} μg/m³</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* 5-Day Forecast */}
          <AnimatedCard animation="scale" delay={200} hover="lift" className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-white">
            <div className="p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 animate-pulse rounded-xl"></div>
              <div className="relative">
                <h2 className="flex items-center text-xl font-bold mb-6 bg-gradient-to-r from-indigo-800 to-purple-800 bg-clip-text text-transparent">
                  <div className="relative mr-3">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
                    <Calendar className="w-6 h-6 text-indigo-600 relative" />
                  </div>
                  5-Day Forecast
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {Array.isArray(forecast.list) && forecast.list.length > 0 ? 
                    forecast.list.filter((_: ForecastItem, index: number) => index % 8 === 0).slice(0, 5).map((day: ForecastItem, index: number) => {
                      const date = new Date(day.dt * 1000);
                      const weather = day.weather && day.weather.length > 0 ? day.weather[0] : { main: 'clear', description: 'Clear sky' };
                      const temp_max = day.main?.temp_max || Math.round(day.main?.temp || 0) + 3;
                      const temp_min = day.main?.temp_min || Math.round(day.main?.temp || 0) - 3;
                    
                    return (
                      <div 
                        key={index} 
                        className={cn(
                          "text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-100",
                          "hover:shadow-lg hover:scale-105 transition-all duration-200",
                          "animate-fade-in-up"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="font-bold text-gray-800 mb-3 text-sm bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="mb-3 flex justify-center">
                          {getWeatherIcon(weather.main)}
                        </div>
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          {Math.round(temp_max)}° / {Math.round(temp_min)}°
                        </div>
                        <div className="text-xs text-gray-600 capitalize font-medium">
                          {weather.description}
                        </div>
                        {day.rain && (
                          <div className="text-xs text-blue-600 mt-2 font-bold">
                            {day.rain['3h']}mm
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="col-span-full text-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                      <p className="text-gray-600 font-medium">No forecast data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Agricultural Insights */}
          <AnimatedCard animation="slide" delay={250} hover="lift" className="shadow-lg border-0 bg-gradient-to-br from-amber-50 to-white">
            <div className="p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10 animate-pulse rounded-xl"></div>
              <div className="relative">
                <h2 className="flex items-center text-xl font-bold mb-6 bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent">
                  <div className="relative mr-3">
                    <div className="absolute inset-0 bg-amber-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
                    <Thermometer className="w-6 h-6 text-amber-600 relative" />
                  </div>
                  Agricultural Insights
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-4 bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">Farming Recommendations</h4>
                    <div className="space-y-3">
                      {getFarmingAdvice(current).map((advice, index) => (
                        <div key={index} className="flex items-start p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all hover:shadow-md">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-2 mr-3 shrink-0 animate-pulse"></div>
                          <p className="text-sm text-gray-700 font-medium flex-1">{advice}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">Weather Impact</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all hover:shadow-md">
                        <span className="text-sm font-bold text-gray-800">Crop Water Stress</span>
                        <Badge variant={current.humidity < 40 ? "destructive" : current.humidity > 80 ? "secondary" : "default"} className="font-bold">
                          {current.humidity < 40 ? 'High' : current.humidity > 80 ? 'Low' : 'Normal'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all hover:shadow-md">
                        <span className="text-sm font-bold text-gray-800">Disease Risk</span>
                        <Badge variant={current.humidity > 80 && current.temp > 25 ? "destructive" : "default"} className="font-bold">
                          {current.humidity > 80 && current.temp > 25 ? 'High' : 'Low'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all hover:shadow-md">
                        <span className="text-sm font-bold text-gray-800">Pest Activity</span>
                        <Badge variant={current.temp > 30 ? "destructive" : current.temp < 15 ? "secondary" : "default"} className="font-bold">
                          {current.temp > 30 ? 'High' : current.temp < 15 ? 'Low' : 'Moderate'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </PullToRefresh>
    </PageTransition>
  );
};

export default WeatherPage;