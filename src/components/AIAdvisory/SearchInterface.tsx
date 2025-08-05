import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Sprout, Droplets, Bug, TestTube, CloudRain, Loader2, ChevronDown, X, Clock, TrendingUp } from 'lucide-react';
import { SearchQuery } from '../../types/search';
import { cropCategories } from '../../services/api';
import { weatherService } from '../../services/weatherService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface SearchInterfaceProps {
  onSearch: (query: SearchQuery) => void;
  loading: boolean;
}

interface LocationSuggestion {
  lat: number;
  lon: number;
  name: string;
  country: string;
  state?: string;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearch, loading }) => {
  const [query, setQuery] = useState<SearchQuery>({
    location: '',
    queryType: 'crop-recommendation'
  });

  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedCropCategory, setSelectedCropCategory] = useState<string>('');
  const [showCropDropdown, setShowCropDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationTimeoutRef = useRef<NodeJS.Timeout>();

  const queryTypes = [
    { 
      id: 'crop-recommendation', 
      name: 'Crop Recommendations', 
      icon: Sprout, 
      color: 'green', 
      description: 'Get AI suggestions for the best crops to plant based on your location and soil conditions',
      features: ['Weather-based analysis', 'Soil compatibility', 'Market demand', 'Seasonal timing']
    },
    { 
      id: 'weather', 
      name: 'Weather Forecast', 
      icon: CloudRain, 
      color: 'blue', 
      description: '7-day forecast with detailed farming insights and agricultural recommendations',
      features: ['Temperature trends', 'Rainfall predictions', 'Humidity levels', 'Farming advice']
    },
    { 
      id: 'soil-analysis', 
      name: 'Soil Analysis', 
      icon: TestTube, 
      color: 'amber', 
      description: 'Comprehensive soil health assessment and nutrient management recommendations',
      features: ['pH analysis', 'Nutrient levels', 'Improvement tips', 'Fertilizer advice']
    },
    { 
      id: 'pest-control', 
      name: 'Pest Control', 
      icon: Bug, 
      color: 'red', 
      description: 'Identify potential pests and get integrated pest management strategies',
      features: ['Risk assessment', 'Prevention methods', 'Treatment options', 'Monitoring tips']
    },
    { 
      id: 'irrigation', 
      name: 'Irrigation Advice', 
      icon: Droplets, 
      color: 'cyan', 
      description: 'Smart watering schedules and water management recommendations',
      features: ['Water requirements', 'Scheduling', 'Conservation tips', 'Method selection']
    }
  ];

  const soilTypes = [
    { value: 'Clay', description: 'Heavy, water-retaining soil' },
    { value: 'Loam', description: 'Balanced, fertile soil (recommended)' },
    { value: 'Sand', description: 'Light, well-draining soil' },
    { value: 'Silt', description: 'Smooth, moisture-retaining soil' },
    { value: 'Clay Loam', description: 'Rich, moderately draining soil' },
    { value: 'Sandy Loam', description: 'Well-draining, easy to work soil' }
  ];

  const seasons = [
    { value: 'Long Rains (March-May)', description: 'Main growing season', icon: CloudRain },
    { value: 'Short Rains (October-December)', description: 'Secondary season', icon: Droplets },
    { value: 'Dry Season', description: 'Irrigation required', icon: TestTube }
  ];

  // Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Location search with debouncing
  useEffect(() => {
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }

    if (query.location.length >= 2) {
      locationTimeoutRef.current = setTimeout(async () => {
        setLocationLoading(true);
        try {
          const suggestions = await weatherService.searchLocation(query.location);
          setLocationSuggestions(suggestions.slice(0, 5));
          setShowLocationDropdown(true);
        } catch (error) {
          console.error('Location search error:', error);
          setLocationSuggestions([]);
        } finally {
          setLocationLoading(false);
        }
      }, 300);
    } else {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
    }

    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, [query.location]);

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    const locationName = `${suggestion.name}, ${suggestion.country}`;
    setQuery(prev => ({ ...prev, location: locationName }));
    setShowLocationDropdown(false);
    
    // Add to recent searches
    const updated = [locationName, ...recentSearches.filter(s => s !== locationName)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.location.trim()) {
      onSearch(query);
      
      // Add to recent searches
      const updated = [query.location, ...recentSearches.filter(s => s !== query.location)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  };

  const selectedQueryType = queryTypes.find(type => type.id === query.queryType);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Advisory Type Selection - Compact Cards */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-4">
              Choose Your Advisory Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {queryTypes.map((type) => (
                <div
                  key={type.id}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    query.queryType === type.id
                      ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                  onClick={() => setQuery(prev => ({ ...prev, queryType: type.id as any }))}
                >
                  <div className="text-center">
                    <div className={`p-3 rounded-xl inline-block mb-3 ${
                      query.queryType === type.id ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <type.icon className={`h-6 w-6 ${
                        query.queryType === type.id ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{type.name}</h3>
                    <p className="text-xs text-gray-600">{type.description.substring(0, 50)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location Input - Enhanced */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2 relative">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Farm Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder="Enter your city and country (e.g., Kigali, Rwanda)"
                  value={query.location}
                  onChange={(e) => setQuery(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800 placeholder-gray-500"
                  required
                />
                {locationLoading && (
                  <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                )}
              </div>
              
              {/* Location Dropdown */}
              {showLocationDropdown && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      onClick={() => handleLocationSelect(suggestion)}
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{suggestion.name}</div>
                          <div className="text-sm text-gray-500">
                            {suggestion.state && `${suggestion.state}, `}{suggestion.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && !showLocationDropdown && query.location === '' && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Recent searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setQuery(prev => ({ ...prev, location: search }))}
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conditional Fields - More Compact */}
          {(query.queryType === 'crop-recommendation' || query.queryType === 'pest-control' || query.queryType === 'irrigation') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Crop Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Crop Type
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCropDropdown(!showCropDropdown)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-left flex items-center justify-between hover:border-green-300"
                  >
                    <span className={query.cropType ? 'text-gray-900' : 'text-gray-500'}>
                      {query.cropType ? query.cropType.charAt(0).toUpperCase() + query.cropType.slice(1) : 'Select crop'}
                    </span>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </button>
                  
                  {showCropDropdown && (
                    <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                      {Object.entries(cropCategories).map(([category, crops]) => (
                        <div key={category} className="p-4 border-b border-gray-100 last:border-b-0">
                          <h4 className="font-medium text-gray-900 mb-3 text-sm">
                            {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {crops.map((crop: string) => (
                              <button
                                key={crop}
                                type="button"
                                onClick={() => {
                                  setQuery(prev => ({ ...prev, cropType: crop }));
                                  setShowCropDropdown(false);
                                }}
                                className="text-left p-2 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors text-sm"
                              >
                                {crop.charAt(0).toUpperCase() + crop.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Soil Type */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Soil Type
                </label>
                <select
                  value={query.soilType || ''}
                  onChange={(e) => setQuery(prev => ({ ...prev, soilType: e.target.value }))}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800"
                >
                  <option value="">Select soil type</option>
                  {soilTypes.map(soil => (
                    <option key={soil.value} value={soil.value}>
                      {soil.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Additional Fields for Crop Recommendations */}
          {query.queryType === 'crop-recommendation' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Planting Season
                </label>
                <select
                  value={query.season || ''}
                  onChange={(e) => setQuery(prev => ({ ...prev, season: e.target.value }))}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800"
                >
                  <option value="">Select season</option>
                  {seasons.map(season => (
                    <option key={season.value} value={season.value}>
                      {season.value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Farm Size (hectares)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 2.5"
                  value={query.farmSize?.toString() || ''}
                  onChange={(e) => setQuery(prev => ({ ...prev, farmSize: parseFloat(e.target.value) || undefined }))}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading || !query.location.trim()}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin mr-3" />
                  <span>Generating AI Advisory...</span>
                </>
              ) : (
                <>
                  {selectedQueryType && <selectedQueryType.icon className="h-6 w-6 mr-3" />}
                  <span>Get AI Recommendations</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchInterface;