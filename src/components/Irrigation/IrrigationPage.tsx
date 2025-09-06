import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Calendar, 
  TrendingUp, 
  Thermometer, 
  Cloud, 
  Sun,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw
} from 'lucide-react';
import { aimlService } from '../../services/aimlService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { weatherService } from '../../services/weatherService';


// Use the actual interfaces from our types file
import { WeatherData as WeatherDataType, IrrigationSchedule as IrrigationScheduleType } from '../../types';

interface WaterConservationTip {
  title: string;
  description: string;
  savings?: string;
  icon?: React.ReactNode;
}

interface IrrigationMethodType {
  name: string;
  efficiency: number;
  waterSaving: number;
  cost: string;
  suitability: string | string[];
  pros: string[];
  cons: string[];
}

const IrrigationPage: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: -1.2921, lon: 36.8219, name: 'Nairobi' });
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropType, setCropType] = useState('maize');
  const [soilType, setSoilType] = useState('loam');
  const [aiRecommendations, setAiRecommendations] = useState<{
    recommendedWaterAmount?: number;
    schedule?: IrrigationScheduleType[];
    recommendations?: string[];
    warnings?: string[];
    waterRequirements?: string;
    irrigationMethods?: IrrigationMethodType[];
    conservationTips?: WaterConservationTip[];
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const getWeatherData = async () => {
      await fetchWeatherData();
    };
    getWeatherData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
  
  // Get user's current location
  const getUserLocation = async () => {
    try {
      setLocationLoading(true);
      const currentLocation = await weatherService.getCurrentLocation();
      
      // Get location name using reverse geocoding
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${currentLocation.lat}&lon=${currentLocation.lon}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setLocation({
          lat: currentLocation.lat,
          lon: currentLocation.lon,
          name: data[0].name
        });
      } else {
        setLocation({
          lat: currentLocation.lat,
          lon: currentLocation.lon,
          name: 'Your Location'
        });
      }
    } catch (error) {
      console.error('Error getting user location:', error);
      setError('Could not access your location. Using default location instead.');
    } finally {
      setLocationLoading(false);
    }
  };
  
  useEffect(() => {
    const getAiRecommendations = async () => {
      if (weatherData) {
        await fetchAiRecommendations();
      }
    };
    getAiRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherData, cropType, soilType]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use the weather service for real-time data
      const weather = await weatherService.getCurrentWeather(location.lat, location.lon);
      setWeatherData(weather);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to load weather data. Please try again later.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAiRecommendations = async () => {
    try {
      setLoadingAi(true);
      setError(null);
      
      if (!weatherData) return;
      
      const params = {
        location: { 
          lat: location.lat, 
          lon: location.lon 
        },
        cropType,
        soilType,
        fieldSize: 1, // Default to 1 hectare if not specified
        weatherData: {
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          precipitation: weatherData.forecast && weatherData.forecast.length > 0 ? 
            weatherData.forecast[0].precipitation : 0,
          windSpeed: weatherData.windSpeed
        }
      };
      
      const recommendations = await aimlService.getIrrigationRecommendations(params);
      setAiRecommendations(recommendations);
      
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      setError('Failed to load AI recommendations. Please try again later.');
      setAiRecommendations(null);
    } finally {
      setLoadingAi(false);
    }
  };

  // Convert API schedule to display schedule format
  const getIrrigationSchedule = () => {
    if (!aiRecommendations || !aiRecommendations.schedule || aiRecommendations.schedule.length === 0) {
      // If no recommendations are available yet, return an empty array
      return [];
    }
    
    // Use the schedule from AI recommendations
    return aiRecommendations.schedule.map(item => ({
      day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' }),
      date: item.date,
      waterAmount: item.waterAmount,
      duration: item.duration,
      method: item.method,
      priority: item.priority,
      weather: item.weatherCondition
    }));
  };

  const irrigationSchedule = getIrrigationSchedule();

  // Use irrigation methods from AI recommendations or default methods
  const getIrrigationMethods = () => {
    if (!aiRecommendations || !aiRecommendations.irrigationMethods) {
      // Return default methods if not available from API
      return [
        {
          name: 'Drip Irrigation',
          efficiency: 95,
          waterSaving: 40,
          cost: 'Medium',
          suitability: ['Vegetables', 'Fruits'],
          pros: ['90-95% water efficiency', 'Reduces weed growth', 'Precise water delivery'],
          cons: ['Higher initial cost', 'Requires maintenance', 'Can clog easily']
        },
        {
          name: 'Sprinkler System',
          efficiency: 75,
          waterSaving: 25,
          cost: 'Low',
          suitability: ['Cereals', 'Pasture'],
          pros: ['Lower installation cost', 'Good for large areas', 'Easy to operate'],
          cons: ['Water loss to evaporation', 'Wind affects distribution', 'Can promote diseases']
        }
      ];
    }
    
    return aiRecommendations.irrigationMethods;
  };

  const irrigationMethods = getIrrigationMethods();

  // Get water conservation tips from AI recommendations or use defaults
  const getWaterConservationTips = () => {
    if (!aiRecommendations || !aiRecommendations.conservationTips) {
      // Return default tips if not available from API
      return [
        {
          title: 'Mulching',
          description: 'Apply organic mulch to reduce evaporation by up to 70%',
          savings: '30-50%',
          icon: <Sun className="w-5 h-5" />
        },
        {
          title: 'Soil Improvement',
          description: 'Add compost to improve water retention capacity',
          savings: '20-30%',
          icon: <TrendingUp className="w-5 h-5" />
        },
        {
          title: 'Timing Optimization',
          description: 'Water early morning or evening to reduce evaporation',
          savings: '15-25%',
          icon: <Clock className="w-5 h-5" />
        },
        {
          title: 'Rainwater Harvesting',
          description: 'Collect and store rainwater for dry periods',
          savings: '40-60%',
          icon: <Cloud className="w-5 h-5" />
        }
      ];
    }
    
    // Map API data to component format with appropriate icons
    return aiRecommendations.conservationTips.map(tip => {
      let icon;
      if (tip.title.toLowerCase().includes('soil')) {
        icon = <TrendingUp className="w-5 h-5" />;
      } else if (tip.title.toLowerCase().includes('time') || tip.title.toLowerCase().includes('schedule')) {
        icon = <Clock className="w-5 h-5" />;
      } else if (tip.title.toLowerCase().includes('rain') || tip.title.toLowerCase().includes('water')) {
        icon = <Droplets className="w-5 h-5" />;
      } else {
        icon = <Sun className="w-5 h-5" />;
      }
      
      return {
        ...tip,
        icon
      };
    });
  };

  const waterConservationTips = getWaterConservationTips();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <Droplets className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading irrigation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Droplets className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Smart Irrigation Advisory</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Optimize your water usage with AI-powered irrigation scheduling based on real-time weather data and crop requirements.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Current location: {location.name} ({location.lat.toFixed(4)}, {location.lon.toFixed(4)})
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <Button onClick={() => {
              fetchWeatherData();
              fetchAiRecommendations();
            }} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading || loadingAi ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            <Button 
              variant="outline" 
              onClick={getUserLocation} 
              disabled={locationLoading}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <span className={`mr-2 ${locationLoading ? 'animate-ping' : ''}`}>📍</span>
              {locationLoading ? 'Getting Location...' : 'Use My Location'}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Current Weather & Water Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Temperature</p>
                  <p className="text-2xl font-bold">{weatherData?.temperature}°C</p>
                </div>
                <Thermometer className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100">Humidity</p>
                  <p className="text-2xl font-bold">{weatherData?.humidity}%</p>
                </div>
                <Droplets className="w-8 h-8 text-cyan-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100">Precipitation</p>
                  <p className="text-2xl font-bold">
                    {weatherData?.forecast && weatherData.forecast.length > 0 
                      ? weatherData.forecast[0].precipitation 
                      : 0}mm
                  </p>
                </div>
                <Cloud className="w-8 h-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100">Wind Speed</p>
                  <p className="text-2xl font-bold">{weatherData?.windSpeed} m/s</p>
                </div>
                <Zap className="w-8 h-8 text-teal-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crop & Soil Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
              Crop & Soil Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="crop-type" className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                <select
                  id="crop-type"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="maize">Maize (Corn)</option>
                  <option value="beans">Beans</option>
                  <option value="tomatoes">Tomatoes</option>
                  <option value="wheat">Wheat</option>
                  <option value="rice">Rice</option>
                  <option value="potatoes">Potatoes</option>
                  <option value="coffee">Coffee</option>
                  <option value="tea">Tea</option>
                </select>
              </div>
              <div>
                <label htmlFor="soil-type" className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                <select
                  id="soil-type"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="loam">Loam</option>
                  <option value="clay">Clay</option>
                  <option value="sandy">Sandy</option>
                  <option value="silt">Silt</option>
                  <option value="clay-loam">Clay Loam</option>
                  <option value="sandy-loam">Sandy Loam</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* AI Irrigation Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-6 h-6 mr-2 text-amber-500" />
              AI-Powered Irrigation Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAi ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading AI recommendations...</p>
              </div>
            ) : aiRecommendations ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Water Requirements</h3>
                  <p className="text-gray-700">{aiRecommendations.waterRequirements || "Based on current conditions, optimal irrigation is recommended."}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Recommendations</h3>
                  <ul className="space-y-2 pl-5 list-disc text-gray-700">
                    {(aiRecommendations.recommendations || ["Adjust irrigation schedule based on current weather forecast"]).map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
                
                {aiRecommendations.warnings && aiRecommendations.warnings.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Warnings
                    </h3>
                    <ul className="space-y-2 pl-5 list-disc text-gray-700">
                      {aiRecommendations.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">Select your crop and soil type to get AI-powered irrigation recommendations</p>
            )}
          </CardContent>
        </Card>
        
        {/* Irrigation Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-blue-600" />
              Irrigation Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {irrigationSchedule.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {irrigationSchedule.map((schedule, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{schedule.day}</h3>
                          <p className="text-sm text-gray-600">{schedule.date}</p>
                        </div>
                        <Badge 
                          variant={schedule.priority === 'high' ? 'destructive' : 
                                  schedule.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {schedule.priority}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Water Amount:</span>
                          <span className="font-medium">{schedule.waterAmount}L/m²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Duration:</span>
                          <span className="font-medium">{schedule.duration} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Method:</span>
                          <span className="font-medium text-blue-600">{schedule.method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Weather:</span>
                          <span className="font-medium">{schedule.weather}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                <p className="text-gray-500">No irrigation schedule available yet.</p>
                <p className="text-sm text-gray-400">Select your crop and soil type to get personalized recommendations.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Irrigation Methods Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
              Irrigation Methods Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {irrigationMethods.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {irrigationMethods.map((method: IrrigationMethodType, index: number) => (
                  <Card key={index} className="border-2 hover:border-blue-300 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-700">{method.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Efficiency</span>
                            <span className="text-sm font-medium">{method.efficiency}%</span>
                          </div>
                          <Progress value={method.efficiency} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Water Saving</span>
                            <span className="text-sm font-medium">{method.waterSaving}%</span>
                          </div>
                          <Progress value={method.waterSaving} className="h-2" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Cost:</span>
                          <Badge variant="outline">{method.cost}</Badge>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Best for:</span>
                          <p className="text-sm font-medium text-blue-600">
                            {Array.isArray(method.suitability) ? method.suitability.join(', ') : method.suitability}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <h4 className="text-sm font-semibold text-green-700 mb-1">Advantages:</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {method.pros.map((pro: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <CheckCircle className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-red-700 mb-1">Considerations:</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {method.cons.map((con: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <AlertTriangle className="w-3 h-3 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-green-300 mx-auto mb-2" />
                <p className="text-gray-500">No irrigation methods data available.</p>
                <p className="text-sm text-gray-400">Get recommendations based on your crop and soil conditions.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Water Conservation Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="w-6 h-6 mr-2 text-cyan-600" />
              Water Conservation Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            {waterConservationTips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {waterConservationTips.map((tip: WaterConservationTip, index: number) => (
                  <Card key={index} className="border-l-4 border-l-cyan-500">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                          {tip.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{tip.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{tip.description}</p>
                          {tip.savings && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Save {tip.savings} water
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Droplets className="w-12 h-12 text-cyan-300 mx-auto mb-2" />
                <p className="text-gray-500">No conservation tips available yet.</p>
                <p className="text-sm text-gray-400">Get personalized water-saving recommendations for your crops.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={() => {
              fetchWeatherData();
            }} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            <Droplets className="w-4 h-4 mr-2" />
            {loading ? 'Refreshing...' : 'Refresh Weather Data'}
          </Button>
          
          {irrigationSchedule.length > 0 && (
            <Button 
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => {
                // This would normally call a function to download the schedule
                // For now, we'll just log it
                console.log('Download schedule functionality would go here');
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Download Schedule
            </Button>
          )}
          
          {aiRecommendations && (
            <Button 
              variant="outline" 
              className="border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => {
                // This would normally call a function to generate a water usage report
                // For now, we'll just log it
                console.log('Water usage report functionality would go here');
              }}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Water Usage Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IrrigationPage;