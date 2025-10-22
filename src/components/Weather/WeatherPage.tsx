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
  TrendingUp
} from 'lucide-react';
import ErrorFallback from '../ui/ErrorFallback';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { weatherService } from '../../services/api';

// Enhanced UI Components
import { PageTransition } from '../ui/page-transition';
import { PullToRefresh } from '../ui/pull-to-refresh';
import { AnimatedCard } from '../ui/animated-card';
import { SkeletonCard, Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

// ... keeping all the interface definitions ...
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
          console.error('Error fetching forecast:', forecastError);
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
      console.error('Failed to load weather data:', error);
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
      console.error('Location search failed:', error);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'clear': <Sun className="w-8 h-8 text-yellow-500" />,
      'clouds': <Cloud className="w-8 h-8 text-gray-500" />,
      'rain': <CloudRain className="w-8 h-8 text-blue-500" />,
      'drizzle': <CloudRain className="w-8 h-8 text-blue-400" />,
      'thunderstorm': <CloudRain className="w-8 h-8 text-purple-600" />,
      'snow': <Cloud className="w-8 h-8 text-blue-200" />,
      'mist': <Cloud className="w-8 h-8 text-gray-400" />
    };
    return iconMap[condition.toLowerCase()] || <Sun className="w-8 h-8 text-yellow-500" />;
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
            <Skeleton className="h-8 w-64 mb-2" shimmer />
            <Skeleton className="h-4 w-96" shimmer />
          </div>

          {/* Search Skeleton */}
          <SkeletonCard shimmer />

          {/* Main Content Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <SkeletonCard shimmer />
            </div>
            <SkeletonCard shimmer />
          </div>

          <SkeletonCard shimmer />
          <SkeletonCard shimmer />
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
          <div className="animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Weather Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">Real-time weather data and agricultural insights</p>
          </div>

          {/* Location Search */}
          <AnimatedCard animation="slide" delay={50} className="overflow-hidden">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a location..."
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg",
                      "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      "transition-all touch-target"
                    )}
                    onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleLocationSearch} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 touch-target">
                    Search
                  </Button>
                  <Button onClick={loadWeatherData} variant="outline" className="touch-target">
                    <RefreshCw className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Current Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <AnimatedCard animation="slide" delay={100} hover="lift" className="lg:col-span-2">
              <div className="p-6">
                <h2 className="flex items-center text-lg font-semibold mb-4">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  {weatherData.location}
                </h2>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center">
                    {getWeatherIcon(current.weather[0]?.main || 'clear')}
                    <div className="ml-4">
                      <div className="text-4xl md:text-5xl font-bold text-gray-800">
                        {Math.round(current.temp)}°C
                      </div>
                      <div className="text-gray-600 capitalize text-sm md:text-base">
                        {current.weather[0]?.description || 'Clear sky'}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-sm text-gray-600">Feels like</div>
                    <div className="text-2xl font-semibold text-gray-800">
                      {Math.round(current.feels_like)}°C
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg transition-all hover:bg-blue-100">
                    <Droplets className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-xs text-gray-600">Humidity</div>
                    <div className="font-semibold text-sm">{current.humidity}%</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg transition-all hover:bg-green-100">
                    <Wind className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-xs text-gray-600">Wind Speed</div>
                    <div className="font-semibold text-sm">{current.wind?.speed || 0} m/s</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg transition-all hover:bg-purple-100">
                    <Gauge className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-xs text-gray-600">Pressure</div>
                    <div className="font-semibold text-sm">{current.pressure || 1013} hPa</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg transition-all hover:bg-orange-100">
                    <Eye className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-xs text-gray-600">Visibility</div>
                    <div className="font-semibold text-sm">{((current.visibility || 10000) / 1000).toFixed(1)} km</div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard animation="slide" delay={150} hover="lift">
              <div className="p-6">
                <h2 className="flex items-center text-lg font-semibold mb-4">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Air Quality
                </h2>

                <div className="text-center mb-4">
                  <div className={`inline-block px-4 py-2 rounded-full text-white ${aqiInfo.color} text-sm font-medium`}>
                    {aqiInfo.level}
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mt-3">
                    AQI: {(airQuality.list[0]?.main?.aqi || 1) * 50}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                    <span className="text-gray-600">CO:</span>
                    <span className="font-medium">{(airQuality.list[0]?.components?.co || 0).toFixed(1)} μg/m³</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                    <span className="text-gray-600">NO₂:</span>
                    <span className="font-medium">{(airQuality.list[0]?.components?.no2 || 0).toFixed(1)} μg/m³</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                    <span className="text-gray-600">O₃:</span>
                    <span className="font-medium">{(airQuality.list[0]?.components?.o3 || 0).toFixed(1)} μg/m³</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                    <span className="text-gray-600">PM2.5:</span>
                    <span className="font-medium">{(airQuality.list[0]?.components?.pm2_5 || 0).toFixed(1)} μg/m³</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* 5-Day Forecast */}
          <AnimatedCard animation="scale" delay={200} hover="lift">
            <div className="p-6">
              <h2 className="flex items-center text-lg font-semibold mb-4">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                5-Day Forecast
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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
                        "text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg",
                        "hover:shadow-md transition-all duration-200",
                        "animate-fade-in-up"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="font-semibold text-gray-800 mb-2 text-sm">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="mb-2 flex justify-center">
                        {getWeatherIcon(weather.main)}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {Math.round(temp_max)}° / {Math.round(temp_min)}°
                      </div>
                      <div className="text-xs text-gray-500 capitalize truncate">
                        {weather.description}
                      </div>
                      {day.rain && (
                        <div className="text-xs text-blue-600 mt-1 font-medium">
                          {day.rain['3h']}mm
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No forecast data available</p>
                  </div>
                )}
              </div>
            </div>
          </AnimatedCard>

          {/* Agricultural Insights */}
          <AnimatedCard animation="slide" delay={250} hover="lift">
            <div className="p-6">
              <h2 className="flex items-center text-lg font-semibold mb-4">
                <Thermometer className="w-5 h-5 mr-2 text-green-600" />
                Agricultural Insights
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Farming Recommendations</h4>
                  <div className="space-y-2">
                    {getFarmingAdvice(current).map((advice, index) => (
                      <div key={index} className="flex items-start p-2 rounded hover:bg-green-50 transition-colors">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 shrink-0"></div>
                        <p className="text-sm text-gray-700 flex-1">{advice}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Weather Impact</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg transition-all hover:bg-blue-100">
                      <span className="text-sm font-medium">Crop Water Stress</span>
                      <Badge variant={current.humidity < 40 ? "destructive" : current.humidity > 80 ? "secondary" : "default"}>
                        {current.humidity < 40 ? 'High' : current.humidity > 80 ? 'Low' : 'Normal'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg transition-all hover:bg-green-100">
                      <span className="text-sm font-medium">Disease Risk</span>
                      <Badge variant={current.humidity > 80 && current.temp > 25 ? "destructive" : "default"}>
                        {current.humidity > 80 && current.temp > 25 ? 'High' : 'Low'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg transition-all hover:bg-yellow-100">
                      <span className="text-sm font-medium">Pest Activity</span>
                      <Badge variant={current.temp > 30 ? "destructive" : current.temp < 15 ? "secondary" : "default"}>
                        {current.temp > 30 ? 'High' : current.temp < 15 ? 'Low' : 'Moderate'}
                      </Badge>
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