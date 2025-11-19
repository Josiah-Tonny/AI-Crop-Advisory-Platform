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
  Info,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { weatherService } from '../../services/api';
import { aimlService } from '../../services/aimlService';
import ErrorFallback from '../ui/ErrorFallback';
import { WeatherData } from '../../types';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
// import CropImageAnalysis from './CropImageAnalysis';

// Enhanced UI Components
import { PageTransition } from '../ui/page-transition';
import { PullToRefresh } from '../ui/pull-to-refresh';
import { AnimatedCard, InteractiveCard } from '../ui/animated-card';
import { SkeletonCard, Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

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
  const [error, setError] = useState<string | null>(null);
  const [soilType] = useState('loam'); // Default soil type
  const [showHelp, setShowHelp] = useState(false);
  
  // Mock data for crop recommendations
  const mockRecommendations: CropRecommendation[] = [
    {
      name: 'Maize',
      suitability: 85,
      waterRequirement: 'Medium',
      growthPeriod: '90-120 days',
      expectedYield: '4-6 tons/hectare',
      tips: [
        'Plant during the onset of rains',
        'Apply nitrogen fertilizer at 30 days after planting',
        'Control stem borers with appropriate pesticides'
      ],
      profitability: 'High',
      challenges: [
        'Susceptible to drought stress',
        'Pests like stem borer and fall armyworm'
      ]
    },
    {
      name: 'Beans',
      suitability: 78,
      waterRequirement: 'Low',
      growthPeriod: '70-90 days',
      expectedYield: '1-2 tons/hectare',
      tips: [
        'Inoculate seeds with rhizobium for nitrogen fixation',
        'Plant in well-drained soils',
        'Harvest pods when dry for better storage'
      ],
      profitability: 'Medium',
      challenges: [
        'Sensitive to waterlogging',
        'Diseases like rust and anthracnose'
      ]
    },
    {
      name: 'Tomatoes',
      suitability: 72,
      waterRequirement: 'High',
      growthPeriod: '60-90 days',
      expectedYield: '15-25 tons/hectare',
      tips: [
        'Provide support with stakes or cages',
        'Apply mulch to retain soil moisture',
        'Prune suckers to improve fruit quality'
      ],
      profitability: 'High',
      challenges: [
        'Requires consistent watering',
        'Pests like tomato hornworm and whiteflies'
      ]
    },
    {
      name: 'Cassava',
      suitability: 88,
      waterRequirement: 'Low',
      growthPeriod: '8-12 months',
      expectedYield: '10-20 tons/hectare',
      tips: [
        'Plant stem cuttings at the beginning of rains',
        'Select disease-free planting material',
        'Harvest after 10-12 months for maximum yield'
      ],
      profitability: 'Medium',
      challenges: [
        'Long growth period',
        'Diseases like cassava mosaic and brown streak'
      ]
    }
  ];
  
  // Mock weather data
  const mockWeatherData: WeatherData = {
    temperature: 24.5,
    humidity: 65,
    windSpeed: 3.2,
    name: 'Nairobi, Kenya',
    location: 'Nairobi, Kenya',
    weather: [{ description: 'Partly cloudy' }],
    forecast: [
      {
        date: '2023-11-20',
        temperature: 25,
        humidity: 68,
        precipitation: 0.2
      },
      {
        date: '2023-11-21',
        temperature: 26,
        humidity: 62,
        precipitation: 0
      }
    ]
  };

  const loadCropRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use mock data instead of API calls
      setTimeout(() => {
        setWeatherData(mockWeatherData);
        setRecommendations(mockRecommendations);
        setLoading(false);
      }, 800);
    } catch (_error) {
      setError('Unable to load crop recommendations. Please check your connection and try again.');
      setRecommendations([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCropRecommendations();
  }, [loadCropRecommendations]);

  const handleRefresh = async () => {
    await loadCropRecommendations();
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

  const filteredRecommendations = recommendations.filter(crop => {
    // Simple category matching based on crop name
    let matchesCategory = selectedCategory === 'all';
    
    if (!matchesCategory) {
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

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" shimmer />
            <Skeleton className="h-4 w-96" shimmer />
          </div>

          <SkeletonCard shimmer />
          <SkeletonCard shimmer />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} shimmer />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }
  
  if (error) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-md">
            <ErrorFallback 
              title="Crop Recommendations Unavailable"
              message={error}
              retry={loadCropRecommendations}
              isNetworkError={true}
            />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Header */}
          <div className="animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Crop Recommendations</h1>
            <p className="text-sm md:text-base text-gray-600">AI-powered crop selection based on current conditions</p>
          </div>

          {/* Weather Summary */}
          {weatherData && (
            <AnimatedCard animation="slide" delay={50} className="overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-5 h-5 text-red-500 shrink-0" />
                      <span className="text-base md:text-lg font-semibold">{Math.round(weatherData.temperature)}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-blue-500 shrink-0" />
                      <span className="text-base md:text-lg font-semibold">{weatherData.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{weatherData.name || weatherData.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowHelp(!showHelp)} variant="outline" size="sm" className="touch-target">
                      <HelpCircle className="w-4 h-4" />
                      <span className="hidden sm:inline ml-2">Help</span>
                    </Button>
                    <Button onClick={loadCropRecommendations} variant="outline" size="sm" className="touch-target">
                      <RefreshCw className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Help Panel */}
          {showHelp && (
            <AnimatedCard animation="slide" className="overflow-hidden bg-blue-50 border border-blue-200">
              <div className="p-4">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Crop Recommendations Help
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
                  <li>Crop suitability is calculated based on current weather, soil type, and location</li>
                  <li>Higher suitability scores indicate better growing conditions</li>
                  <li>Water requirements are categorized as Low, Medium, or High</li>
                  <li>Use filters to find crops in specific categories</li>
                  <li>Search for specific crops by name</li>
                  <li>Check growing tips for best practices</li>
                  <li>Be aware of potential challenges for each crop</li>
                </ul>
                <p className="mt-2 text-blue-700 text-sm">
                  These recommendations are based on current conditions and may change with weather patterns.
                </p>
              </div>
            </AnimatedCard>
          )}

          {/* Filters */}
          <AnimatedCard animation="slide" delay={100} className="overflow-hidden">
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search crops..."
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg",
                      "focus:ring-2 focus:ring-green-500 focus:border-transparent",
                      "transition-all touch-target"
                    )}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500 shrink-0" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={cn(
                      "flex-1 md:flex-none px-4 py-2.5 border border-gray-300 rounded-lg",
                      "focus:ring-2 focus:ring-green-500 focus:border-transparent",
                      "transition-all touch-target"
                    )}
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
            </div>
          </AnimatedCard>

          {/* Crop Recommendations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredRecommendations.map((crop, index) => {
              const suitabilityColor = getSuitabilityColor(crop.suitability);
              const suitabilityLabel = getSuitabilityLabel(crop.suitability);

              return (
                <InteractiveCard
                  key={index}
                  animation="fade"
                  delay={150 + index * 50}
                  ripple={true}
                  className="overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="flex items-center text-lg font-semibold">
                        <Sprout className="w-5 h-5 mr-2 text-green-600 shrink-0" />
                        <span className="truncate">{crop.name}</span>
                      </h3>
                      <Badge className={cn(suitabilityColor, "shrink-0")}>
                        {suitabilityLabel}
                      </Badge>
                    </div>

                    {/* Suitability Score */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Suitability</span>
                        <span className="text-sm font-bold">{crop.suitability}%</span>
                      </div>
                      <Progress value={crop.suitability} className="h-2" />
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg transition-all hover:bg-blue-100">
                        <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Duration</div>
                        <div className="text-sm font-semibold truncate">{crop.growthPeriod}</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg transition-all hover:bg-green-100">
                        <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Yield</div>
                        <div className="text-sm font-semibold truncate">{crop.expectedYield}</div>
                      </div>
                    </div>

                    {/* Water Requirement */}
                    <div className="flex items-center justify-between mb-4 p-2 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <Droplets className="w-4 h-4 text-blue-600 mr-2 shrink-0" />
                        <span className="text-sm font-medium">Water Need</span>
                      </div>
                      <Badge variant={crop.waterRequirement === 'Low' ? 'secondary' : 'default'}>
                        {crop.waterRequirement}
                      </Badge>
                    </div>

                    {/* Tips */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-1 shrink-0" />
                        Growing Tips
                      </h4>
                      <ul className="space-y-1">
                        {crop.tips.slice(0, 2).map((tip, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start">
                            <div className="w-1 h-1 bg-green-500 rounded-full mt-2 mr-2 shrink-0"></div>
                            <span className="flex-1">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Challenges */}
                    {crop.challenges && crop.challenges.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                          <AlertCircle className="w-4 h-4 text-orange-600 mr-1 shrink-0" />
                          Challenges
                        </h4>
                        <ul className="space-y-1">
                          {crop.challenges.slice(0, 2).map((challenge, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start">
                              <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 mr-2 shrink-0"></div>
                              <span className="flex-1">{challenge}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weather Conditions */}
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                        <Info className="w-4 h-4 text-blue-600 mr-1 shrink-0" />
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
                              <div className="font-medium truncate">{weatherData.name}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Condition:</span>
                              <div className="font-medium truncate">{weatherData.weather?.[0]?.description || 'N/A'}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              );
            })}
          </div>

          {filteredRecommendations.length === 0 && (
            <AnimatedCard animation="scale" className="text-center py-12">
              <div className="p-6">
                <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Crops Found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            </AnimatedCard>
          )}
        </div>
      </PullToRefresh>
    </PageTransition>
  );
};

export default CropsPage;