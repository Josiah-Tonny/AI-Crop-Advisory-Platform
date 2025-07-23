import React, { useState } from 'react';
import { Brain, Lightbulb, TrendingUp, Users, Sprout, CloudRain, TestTube, Bug, Droplets } from 'lucide-react';
import SearchInterface from './SearchInterface';
import ResultsDisplay from './ResultsDisplay';
import { SearchQuery, SearchResponse } from '../../types/search';
import { getCurrentWeather, getForecast } from '../../services/weatherService';
import { getCropRecommendations } from '../../services/aiService';
import toast from 'react-hot-toast';

const AIAdvisoryPage: React.FC = () => {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<SearchQuery | null>(null);

  const handleSearch = async (query: SearchQuery) => {
    setLoading(true);
    setError(null);
    setCurrentQuery(query);
    setResults(null);

    try {
      switch (query.queryType) {
        case 'weather':
          const [current, forecast] = await Promise.all([
            getCurrentWeather(query.location),
            getForecast(query.location)
          ]);
          setResults({ weather: { current, forecast } });
          break;

        case 'crop-recommendation':
          const recommendations = await getCropRecommendations({
            location: query.location,
            soilType: query.soilType || 'loam',
            previousCrops: []
          });
          setResults({ recommendations });
          break;

        default:
          setError('Unsupported query type');
      }

      toast.success('AI advisory generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white bg-opacity-20 p-4 rounded-2xl">
                <Brain className="h-12 w-12 text-green-200" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              AI Agricultural Advisory
            </h1>
            <p className="text-lg sm:text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              Get instant, personalized farming advice powered by artificial intelligence and real-time weather data. 
              Increase your crop yields with smart agricultural insights.
            </p>
            
            {/* Feature Icons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl inline-block mb-2">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-sm">AI-Powered</h3>
                <p className="text-xs text-green-200">Smart recommendations</p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl inline-block mb-2">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-sm">Expert Insights</h3>
                <p className="text-xs text-green-200">Professional advice</p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl inline-block mb-2">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-sm">Increase Yields</h3>
                <p className="text-xs text-green-200">Proven results</p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl inline-block mb-2">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-sm">Trusted</h3>
                <p className="text-xs text-green-200">By farmers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Search Interface */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <SearchInterface onSearch={handleSearch} loading={loading} />
            </div>
          </div>

          {/* Results Display */}
          <div className="xl:col-span-2">
            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating AI Advisory</h3>
                <p className="text-gray-600">
                  Our AI is analyzing weather data and agricultural patterns to provide you with personalized recommendations...
                </p>
                <div className="mt-6 flex justify-center space-x-4 text-sm text-gray-500">
                  <span>• Fetching weather data</span>
                  <span>• Analyzing conditions</span>
                  <span>• Generating recommendations</span>
                </div>
              </div>
            ) : results && currentQuery ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <ResultsDisplay 
                  queryType={currentQuery.queryType} 
                  results={results} 
                  location={currentQuery.location}
                />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12 text-center">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Help You Grow</h3>
                <p className="text-gray-600 mb-8">
                  Select what you need help with and enter your location to get started with AI-powered agricultural advice.
                </p>
                
                {/* Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                    <div className="bg-green-100 p-2 rounded-lg inline-block mb-3">
                      <Sprout className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-800 mb-1">Crop Recommendations</h4>
                    <p className="text-sm text-green-600">Get AI suggestions for the best crops to plant based on your location and conditions</p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                    <div className="bg-blue-100 p-2 rounded-lg inline-block mb-3">
                      <CloudRain className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-800 mb-1">Weather Insights</h4>
                    <p className="text-sm text-blue-600">5-day forecast with farming recommendations and agricultural insights</p>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <div className="bg-amber-100 p-2 rounded-lg inline-block mb-3">
                      <TestTube className="h-6 w-6 text-amber-600" />
                    </div>
                    <h4 className="font-semibold text-amber-800 mb-1">Soil Analysis</h4>
                    <p className="text-sm text-amber-600">Understand your soil health and get nutrient management advice</p>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                    <div className="bg-red-100 p-2 rounded-lg inline-block mb-3">
                      <Bug className="h-6 w-6 text-red-600" />
                    </div>
                    <h4 className="font-semibold text-red-800 mb-1">Pest Control</h4>
                    <p className="text-sm text-red-600">Identify and manage crop pests with integrated pest management</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Why Choose Our AI Advisory?</h2>
            <p className="text-lg text-gray-600">Advanced technology meets traditional farming wisdom</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 p-6 rounded-2xl inline-block mb-4">
                <Brain className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Real-Time AI Analysis</h3>
              <p className="text-gray-600 text-sm">
                Our AI processes current weather conditions, soil data, and crop patterns to provide instant, 
                accurate recommendations tailored to your specific location and farming needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 p-6 rounded-2xl inline-block mb-4">
                <TrendingUp className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Proven Results</h3>
              <p className="text-gray-600 text-sm">
                Farmers using our AI advisory have seen significant improvements in crop yields and resource 
                optimization through data-driven farming practices and timely interventions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-6 rounded-2xl inline-block mb-4">
                <Lightbulb className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Expert Knowledge</h3>
              <p className="text-gray-600 text-sm">
                Our AI is trained on decades of agricultural research and local farming expertise, 
                ensuring recommendations are both scientifically sound and practically applicable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisoryPage;