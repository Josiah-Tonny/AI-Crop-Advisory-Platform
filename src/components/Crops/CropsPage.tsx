import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Droplets, 
  Thermometer,
  DollarSign,
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
import { weatherService, cropDatabase, cropCategories } from '../../services/api';

interface CropRecommendation {
  crop: string;
  suitability: number;
  yield: string;
  profitability: string;
  growthDuration: string;
  reasons: string[];
  challenges: string[];
}

const CropsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [location, setLocation] = useState({ lat: -1.2921, lon: 36.8219 }); // Nairobi default

  useEffect(() => {
    loadCropRecommendations();
  }, [location]);

  const loadCropRecommendations = async () => {
    setLoading(true);
    try {
      // Get current weather data
      const weather = await weatherService.getCurrentWeather(location.lat, location.lon);
      setWeatherData(weather);

      // Generate crop recommendations based on weather and location
      const cropRecommendations = await generateCropRecommendations(weather, location);
      setRecommendations(cropRecommendations);
    } catch (error) {
      console.error('Failed to load crop recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCropRecommendations = async (weather: any, location: any): Promise<CropRecommendation[]> => {
    const recommendations: CropRecommendation[] = [];
    
    // Get current season (simplified for demo)
    const month = new Date().getMonth();
    const isRainySeason = month >= 2 && month <= 5; // March to June
    const isDrySeason = month >= 6 && month <= 9; // July to October

    Object.entries(cropDatabase).forEach(([key, crop]) => {
      const suitability = calculateCropSuitability(crop, weather, isRainySeason);
      const reasons = getSuitabilityReasons(crop, weather, suitability);
      const challenges = getCropChallenges(crop, weather);

      recommendations.push({
        crop: key,
        suitability,
        yield: crop.yield,
        profitability: crop.profitability,
        growthDuration: crop.growthDuration,
        reasons,
        challenges
      });
    });

    // Sort by suitability score
    return recommendations.sort((a, b) => b.suitability - a.suitability);
  };

  const calculateCropSuitability = (crop: any, weather: any, isRainySeason: boolean): number => {
    let score = 50; // Base score

    // Temperature suitability
    const temp = weather.main.temp;
    const [minTemp, maxTemp] = crop.optimalTemp.split('-').map((t: string) => parseInt(t));
    if (temp >= minTemp && temp <= maxTemp) {
      score += 25;
    } else if (Math.abs(temp - (minTemp + maxTemp) / 2) <= 5) {
      score += 15;
    } else {
      score -= 10;
    }

    // Humidity and rainfall
    const humidity = weather.main.humidity;
    if (crop.name.includes('Rice') && humidity > 70) score += 20;
    if (crop.name.includes('Cassava') && humidity < 60) score += 15;
    if (crop.name.includes('Tomato') && humidity > 80) score -= 15;

    // Seasonal factors
    if (isRainySeason) {
      if (['maize', 'beans', 'rice'].includes(crop.name.toLowerCase())) score += 15;
    } else {
      if (['cassava', 'coffee'].includes(crop.name.toLowerCase())) score += 10;
    }

    // Market demand factor
    if (crop.marketDemand === 'Very High') score += 10;
    if (crop.marketDemand === 'High') score += 5;

    return Math.min(100, Math.max(0, score));
  };

  const getSuitabilityReasons = (crop: any, weather: any, suitability: number): string[] => {
    const reasons = [];
    
    if (suitability > 80) {
      reasons.push('Excellent weather conditions for growth');
      reasons.push(`High market demand (${crop.marketDemand})`);
    } else if (suitability > 60) {
      reasons.push('Good growing conditions');
      reasons.push('Suitable temperature range');
    } else {
      reasons.push('Challenging but possible to grow');
    }

    if (crop.profitability === 'Very High') {
      reasons.push('High profit potential');
    }

    if (weather.main.temp >= 20 && weather.main.temp <= 30) {
      reasons.push('Optimal temperature range');
    }

    return reasons;
  };

  const getCropChallenges = (crop: any, weather: any): string[] => {
    const challenges = [];
    
    if (weather.main.temp > 35) {
      challenges.push('High temperature stress risk');
    }
    
    if (weather.main.humidity > 80) {
      challenges.push('High disease pressure from humidity');
    }
    
    if (crop.diseases && crop.diseases.length > 0) {
      challenges.push(`Common diseases: ${crop.diseases.slice(0, 2).join(', ')}`);
    }
    
    if (crop.pests && crop.pests.length > 0) {
      challenges.push(`Pest management needed: ${crop.pests.slice(0, 2).join(', ')}`);
    }

    return challenges;
  };

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

  const filteredRecommendations = recommendations.filter(rec => {
    const crop = cropDatabase[rec.crop as keyof typeof cropDatabase];
    const matchesCategory = selectedCategory === 'all' || 
      Object.entries(cropCategories).some(([category, crops]) => 
        category === selectedCategory && crops.includes(rec.crop)
      );
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                  <span className="text-lg font-semibold">{Math.round(weatherData.main.temp)}°C</span>
                  <Droplets className="w-6 h-6 text-blue-500" />
                  <span className="text-lg font-semibold">{weatherData.main.humidity}%</span>
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{weatherData.name}</span>
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
          {filteredRecommendations.map((recommendation, index) => {
            const crop = cropDatabase[recommendation.crop as keyof typeof cropDatabase];
            const suitabilityColor = getSuitabilityColor(recommendation.suitability);
            const suitabilityLabel = getSuitabilityLabel(recommendation.suitability);

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
                      <span className="text-sm font-bold">{recommendation.suitability}%</span>
                    </div>
                    <Progress value={recommendation.suitability} className="h-2" />
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <div className="text-xs text-gray-600">Duration</div>
                      <div className="text-sm font-semibold">{crop.growthDuration}</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <div className="text-xs text-gray-600">Yield</div>
                      <div className="text-sm font-semibold">{crop.yield}</div>
                    </div>
                  </div>

                  {/* Profitability */}
                  <div className="flex items-center justify-between mb-4 p-2 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium">Profitability</span>
                    </div>
                    <Badge variant={crop.profitability === 'Very High' ? 'default' : 'secondary'}>
                      {crop.profitability}
                    </Badge>
                  </div>

                  {/* Reasons */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                      Why This Crop?
                    </h4>
                    <ul className="space-y-1">
                      {recommendation.reasons.slice(0, 2).map((reason, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start">
                          <div className="w-1 h-1 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenges */}
                  {recommendation.challenges.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 text-orange-600 mr-1" />
                        Challenges
                      </h4>
                      <ul className="space-y-1">
                        {recommendation.challenges.slice(0, 2).map((challenge, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start">
                            <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Growing Conditions */}
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <Info className="w-4 h-4 text-blue-600 mr-1" />
                      Growing Conditions
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Temperature:</span>
                        <div className="font-medium">{crop.optimalTemp}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Soil pH:</span>
                        <div className="font-medium">{crop.soilPH}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Rainfall:</span>
                        <div className="font-medium">{crop.rainfall}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Spacing:</span>
                        <div className="font-medium">{crop.spacing}</div>
                      </div>
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