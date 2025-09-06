import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sprout, 
  MapPin, 
  TrendingUp, 
  Droplets, 
  Thermometer,
  Clock,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { weatherService } from '../../services/api';
import { aimlService } from '../../services/aimlService';
import ErrorFallback from '../ui/ErrorFallback';
import { WeatherData } from '../../types';

interface CropRecommendation {
  name: string;
  suitability: number;
  waterRequirement: string;
  growthPeriod: string;
  expectedYield: string;
  tips: string[];
  profitability?: string;
  challenges?: string[];
}

const CropsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location] = useState({ lat: -1.2921, lon: 36.8219 }); // Nairobi default

  useEffect(() => {
    loadCropRecommendations();
  }, [loadCropRecommendations]);
  
  const [soilType] = useState('loam'); // Default soil type

  const loadCropRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current weather data using the improved weather service
      const weather = await weatherService.getCurrentWeather(location.lat, location.lon);
      setWeatherData(weather);

      // Format weather data for AI API
      const weatherDataForAI = {
        temperature: weather.temperature || weather.main?.temp,
        humidity: weather.humidity || weather.main?.humidity,
        windSpeed: weather.windSpeed || weather.wind?.speed || 0,
        rainfall: weather.forecast && weather.forecast.length > 0 ? weather.forecast[0].precipitation : 0
      };
      
      // Use aimlService to get crop recommendations
      const response = await aimlService.getCropRecommendations({
        location: location,
        soilType: soilType,
        weatherData: weatherDataForAI
      });
      
      // Transform the response to match our component's expected format
      const transformedRecommendations = response.recommendations.map(crop => ({
        name: crop.name,
        suitability: crop.suitability,
        waterRequirement: crop.waterRequirement,
        growthPeriod: crop.growthPeriod,
        expectedYield: crop.expectedYield,
        tips: crop.tips || [],
        challenges: []
      }));
      
      setRecommendations(transformedRecommendations);
    } catch (error) {
      console.error('Failed to load crop recommendations:', error);
      setError('Unable to load crop recommendations. Please check your connection and try again.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [location, soilType]);
  
  // These functions remain useful for UI purposes
  

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSuitabilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const filteredRecommendations = recommendations.filter(crop => {
    // Simple category matching based on crop name
    let matchesCategory = selectedCategory === 'all';
    
    if (!matchesCategory) {
      // Map crop names to likely categories based on common types
      const cropNameLower = crop.name.toLowerCase();
      if (selectedCategory === 'cereals' && 
          ['maize', 'rice', 'wheat', 'sorghum', 'millet', 'corn', 'barley', 'oat'].some(c => cropNameLower.includes(c))) {
        matchesCategory = true;
      } else if (selectedCategory === 'legumes' && 
          ['bean', 'pea', 'lentil', 'soybean', 'groundnut', 'peanut'].some(c => cropNameLower.includes(c))) {
        matchesCategory = true;
      } else if (selectedCategory === 'vegetables' && 
          ['tomato', 'onion', 'cabbage', 'pepper', 'carrot', 'lettuce', 'spinach'].some(c => cropNameLower.includes(c))) {
        matchesCategory = true;
      } else if (selectedCategory === 'rootCrops' && 
          ['cassava', 'potato', 'yam', 'sweet potato', 'taro'].some(c => cropNameLower.includes(c))) {
        matchesCategory = true;
      } else if (selectedCategory === 'cashCrops' && 
          ['coffee', 'tea', 'cotton', 'sugarcane', 'tobacco'].some(c => cropNameLower.includes(c))) {
        matchesCategory = true;
      } else if (selectedCategory === 'fruits' && 
          ['banana', 'mango', 'apple', 'orange', 'avocado', 'citrus', 'pineapple'].some(c => cropNameLower.includes(c))) {
        matchesCategory = true;
      }
    }
    
    // Search matching
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [error, setError] = useState<string | null>(null);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing crop suitability...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <ErrorFallback 
            title="Crop Recommendations Unavailable"
            message={error}
            retry={loadCropRecommendations}
            isNetworkError={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Crop Recommendations</h1>
          <p className="text-gray-600">AI-powered crop selection based on current conditions</p>
        </div>

        {/* Weather Summary */}
        {weatherData && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Thermometer className="w-6 h-6 text-red-500" />
                  <span className="text-lg font-semibold">{Math.round(weatherData.temperature)}°C</span>
                  <Droplets className="w-6 h-6 text-blue-500" />
                  <span className="text-lg font-semibold">{weatherData.humidity}%</span>
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{weatherData.name || weatherData.location}</span>
                </div>
                <Button onClick={loadCropRecommendations} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search crops..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  aria-label="Filter crops by category"
                >
                  <option value="all">All Categories</option>
                  <option value="cereals">Cereals</option>
                  <option value="legumes">Legumes</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="rootCrops">Root Crops</option>
                  <option value="cashCrops">Cash Crops</option>
                  <option value="fruits">Fruits</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crop Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((crop, index) => {
            const suitabilityColor = getSuitabilityColor(crop.suitability);
            const suitabilityLabel = getSuitabilityLabel(crop.suitability);

            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Sprout className="w-5 h-5 mr-2 text-green-600" />
                      {crop.name}
                    </CardTitle>
                    <Badge className={suitabilityColor}>
                      {suitabilityLabel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Suitability Score */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Suitability</span>
                      <span className="text-sm font-bold">{crop.suitability}%</span>
                    </div>
                    <Progress value={crop.suitability} className="h-2" />
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <div className="text-xs text-gray-600">Duration</div>
                      <div className="text-sm font-semibold">{crop.growthPeriod}</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <div className="text-xs text-gray-600">Yield</div>
                      <div className="text-sm font-semibold">{crop.expectedYield}</div>
                    </div>
                  </div>

                  {/* Water Requirement */}
                  <div className="flex items-center justify-between mb-4 p-2 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Droplets className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Water Need</span>
                    </div>
                    <Badge variant={crop.waterRequirement === 'Low' ? 'secondary' : 'default'}>
                      {crop.waterRequirement}
                    </Badge>
                  </div>

                  {/* Tips */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                      Growing Tips
                    </h4>
                    <ul className="space-y-1">
                      {crop.tips.slice(0, 2).map((tip, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start">
                          <div className="w-1 h-1 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenges */}
                  {crop.challenges && crop.challenges.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 text-orange-600 mr-1" />
                        Challenges
                      </h4>
                      <ul className="space-y-1">
                        {crop.challenges.slice(0, 2).map((challenge, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start">
                            <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weather Conditions */}
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <Info className="w-4 h-4 text-blue-600 mr-1" />
                      Current Weather Impact
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {weatherData && (
                        <>
                          <div>
                            <span className="text-gray-600">Temperature:</span>
                            <div className="font-medium">{weatherData.temperature}°C</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Humidity:</span>
                            <div className="font-medium">{weatherData.humidity}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <div className="font-medium">{weatherData.name}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Condition:</span>
                            <div className="font-medium">{weatherData.weather?.[0]?.description || 'N/A'}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredRecommendations.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Crops Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CropsPage;