import React, { useState } from 'react';
import { Search, MapPin, Sprout, Droplets, Bug, TestTube, CloudRain, Loader2 } from 'lucide-react';
import { SearchQuery } from '../../types';
import { cropCategories, getAllCrops } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchInterfaceProps {
  onSearch: (query: SearchQuery) => void;
  loading: boolean;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearch, loading }) => {
  const [query, setQuery] = useState<SearchQuery>({
    location: '',
    queryType: 'crop-recommendation'
  });

  const queryTypes = [
    { id: 'crop-recommendation', name: 'Crop Recommendations', icon: Sprout, color: 'green', description: 'Get AI suggestions for the best crops to plant' },
    { id: 'weather', name: 'Weather Forecast', icon: CloudRain, color: 'blue', description: '5-day forecast with farming insights' },
    { id: 'soil-analysis', name: 'Soil Analysis', icon: TestTube, color: 'amber', description: 'Analyze soil health and nutrients' },
    { id: 'pest-control', name: 'Pest Control', icon: Bug, color: 'red', description: 'Identify and manage crop pests' },
    { id: 'irrigation', name: 'Irrigation Advice', icon: Droplets, color: 'cyan', description: 'Smart watering recommendations' }
  ];

  const soilTypes = ['Clay', 'Loam', 'Sand', 'Silt', 'Clay Loam', 'Sandy Loam'];
  const seasons = ['Long Rains (March-May)', 'Short Rains (October-December)', 'Dry Season'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.location.trim()) {
      onSearch(query);
    }
  };

  const getColorClasses = (color: string, selected: boolean = false) => {
    const colors = {
      green: selected ? 'bg-green-100 text-green-800 border-green-300 shadow-md' : 'border-gray-200 hover:border-green-300 hover:bg-green-50',
      blue: selected ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50',
      amber: selected ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-md' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50',
      red: selected ? 'bg-red-100 text-red-800 border-red-300 shadow-md' : 'border-gray-200 hover:border-red-300 hover:bg-red-50',
      cyan: selected ? 'bg-cyan-100 text-cyan-800 border-cyan-300 shadow-md' : 'border-gray-200 hover:border-cyan-300 hover:bg-cyan-50'
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  const selectedQueryType = queryTypes.find(type => type.id === query.queryType);

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-white">AI Agricultural Advisory</CardTitle>
            <p className="text-green-100 text-sm">Get personalized farming advice powered by AI</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Query Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              What do you need help with?
            </label>
            <div className="grid grid-cols-1 gap-3">
              {queryTypes.map((type) => (
                <Button
                  key={type.id}
                  type="button"
                  variant={query.queryType === type.id ? "default" : "outline"}
                  onClick={() => setQuery(prev => ({ ...prev, queryType: type.id as any }))}
                  className="h-auto p-4 justify-start"
                >
                  <div className="p-2 rounded-lg bg-gray-100 mr-3">
                    <type.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{type.name}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{type.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Your Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g., Nairobi, Kenya or Kampala, Uganda"
                value={query.location}
                onChange={(e) => setQuery(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800 placeholder-gray-500"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Enter your city and country for accurate weather data</p>
          </div>

          {/* Conditional Fields */}
          {(query.queryType === 'crop-recommendation' || query.queryType === 'pest-control' || query.queryType === 'irrigation') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Crop Category & Type
                </label>
                <div className="space-y-3">
                  {Object.entries(cropCategories).map(([key, crops]) => (
                    <div key={key}>
                      <Badge variant="outline" className="mb-2">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Badge>
                      <div className="grid grid-cols-2 gap-2">
                        {crops.slice(0, 4).map((crop: string) => (
                          <Button
                            key={crop}
                            type="button"
                            variant={query.cropType === crop ? "default" : "outline"}
                            size="sm"
                            onClick={() => setQuery(prev => ({ ...prev, cropType: crop }))}
                            className="text-xs h-8"
                          >
                            {crop.charAt(0).toUpperCase() + crop.slice(1).replace(/([A-Z])/g, ' $1')}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Soil Type
                </label>
                <select
                  value={query.soilType || ''}
                  onChange={(e) => setQuery(prev => ({ ...prev, soilType: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800"
                >
                  <option value="">Select soil type</option>
                  {soilTypes.map(soil => (
                    <option key={soil} value={soil}>{soil}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {query.queryType === 'crop-recommendation' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Season
                </label>
                <select
                  value={query.season || ''}
                  onChange={(e) => setQuery(prev => ({ ...prev, season: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800"
                >
                  <option value="">Select season</option>
                  {seasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Farm Size (hectares)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 2.5"
                  value={query.farmSize || ''}
                  onChange={(e) => setQuery(prev => ({ ...prev, farmSize: parseFloat(e.target.value) || undefined }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>
          )}

          {query.queryType === 'pest-control' && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Symptoms Observed
              </label>
              <textarea
                placeholder="Describe what you've observed (e.g., holes in leaves, yellowing, wilting, spots on fruits)"
                value={query.additionalParams?.symptoms || ''}
                onChange={(e) => setQuery(prev => ({ 
                  ...prev, 
                  additionalParams: { ...prev.additionalParams, symptoms: e.target.value }
                }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800 resize-none"
                rows={3}
              />
            </div>
          )}

          {query.queryType === 'soil-analysis' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Soil Test Results (Optional)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    pH Level
                  </label>
                  <input
                    type="number"
                    placeholder="6.5"
                    value={query.additionalParams?.pH || ''}
                    onChange={(e) => setQuery(prev => ({ 
                      ...prev, 
                      additionalParams: { ...prev.additionalParams, pH: parseFloat(e.target.value) || undefined }
                    }))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800 text-sm"
                    step="0.1"
                    min="0"
                    max="14"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nitrogen (ppm)
                  </label>
                  <input
                    type="number"
                    placeholder="40"
                    value={query.additionalParams?.nitrogen || ''}
                    onChange={(e) => setQuery(prev => ({ 
                      ...prev, 
                      additionalParams: { ...prev.additionalParams, nitrogen: parseFloat(e.target.value) || undefined }
                    }))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800 text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Phosphorus (ppm)
                  </label>
                  <input
                    type="number"
                    placeholder="20"
                    value={query.additionalParams?.phosphorus || ''}
                    onChange={(e) => setQuery(prev => ({ 
                      ...prev, 
                      additionalParams: { ...prev.additionalParams, phosphorus: parseFloat(e.target.value) || undefined }
                    }))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800 text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Potassium (ppm)
                  </label>
                  <input
                    type="number"
                    placeholder="200"
                    value={query.additionalParams?.potassium || ''}
                    onChange={(e) => setQuery(prev => ({ 
                      ...prev, 
                      additionalParams: { ...prev.additionalParams, potassium: parseFloat(e.target.value) || undefined }
                    }))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800 text-sm"
                    min="0"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Leave blank if you don't have soil test results - we'll provide general recommendations</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !query.location.trim()}
            className="w-full h-12"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Getting AI Advice...</span>
              </>
            ) : (
              <>
                {selectedQueryType && <selectedQueryType.icon className="h-5 w-5" />}
                <span>Get AI Advisory</span>
              </>
            )}
          </Button>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Powered by OpenWeatherMap API and AI algorithms trained on agricultural data
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchInterface;