import React, { useState, useEffect } from 'react';
import { 
  TestTube, 
  Plus, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { soilService } from '../../services/api';
import { aimlService } from '../../services/aimlService';
import { weatherService } from '../../services/weatherService';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ErrorFallback from '../ui/ErrorFallback';

const SoilPage: React.FC = () => {
  const { user } = useAuth();
  const [soilAnalyses, setSoilAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAnalysis, setShowAddAnalysis] = useState(false);
  const [location, setLocation] = useState({ lat: -1.2921, lon: 36.8219 }); // Default to Nairobi
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [loadingRealTime, setLoadingRealTime] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSoilData = async () => {
      try {
        // Fetch historical soil data
        const response = await soilService.getSoilHistory();
        setSoilAnalyses(response.data);
        
        // Get user location if available
        if (user?.location) {
          // Parse location string to get coordinates
          // This is a simplified example - in a real app, you'd use proper geocoding
          const userLocation = user.location.split(',').map(coord => parseFloat(coord.trim()));
          if (userLocation.length === 2) {
            setLocation({ lat: userLocation[0], lon: userLocation[1] });
          }
        }
        
        // Fetch real-time soil analysis
        await fetchRealTimeSoilData();
      } catch (error) {
        console.error('Error fetching soil data:', error);
        setError('Failed to load soil data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSoilData();
  }, [user]);
  
  const fetchRealTimeSoilData = async () => {
    try {
      setLoadingRealTime(true);
      setError(null);
      
      // Use OpenWeather API data as input for soil analysis
      const weatherData = await weatherService.getCurrentWeather(location.lat, location.lon);
      
      // Create soil analysis parameters with weather data
      const soilParams = {
        location,
        soilType: 'loam', // Default soil type
        weatherData: {
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          rainfall: weatherData.forecast?.[0]?.precipitation || 0
        }
      };
      
      // Get real-time soil analysis from API
      const soilAnalysis = await aimlService.getSoilAnalysis(location, soilParams);
      setRealTimeData(soilAnalysis);
    } catch (error) {
      console.error('Error fetching real-time soil data:', error);
      setError('Failed to load real-time soil data. Please try again later.');
      // No fallback to mock data - let the UI show the error state
      setRealTimeData(null);
    } finally {
      setLoadingRealTime(false);
    }
  };

  // No mock data - we'll use real data from APIs

  const getNutrientStatus = (value: number, type: string) => {
    const ranges = {
      nitrogen: { low: 30, high: 50 },
      phosphorus: { low: 20, high: 40 },
      potassium: { low: 150, high: 250 }
    };

    const range = ranges[type as keyof typeof ranges];
    if (!range) return 'normal';

    if (value < range.low) return 'low';
    if (value > range.high) return 'high';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading soil analysis data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Soil Health Analysis</h1>
            <p className="text-amber-100">Monitor and optimize your soil conditions for maximum crop yield</p>
          </div>
          <button
            onClick={() => setShowAddAnalysis(true)}
            className="bg-white text-amber-700 px-4 py-2 rounded-lg font-semibold hover:bg-amber-50 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Error Handling */}
      {error && !loadingRealTime && (
        <div className="mb-6">
          <ErrorFallback
            title="Soil Analysis Unavailable"
            message={error}
            retry={fetchRealTimeSoilData}
            isNetworkError={true}
          />
        </div>
      )}

      {/* Real-time Soil Analysis */}
      {realTimeData && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <span>Real-Time Soil Analysis</span>
                <Badge className="ml-2 bg-green-100 text-green-800">LIVE</Badge>
              </h3>
              <p className="text-sm text-gray-600">Updated {new Date().toLocaleString()}</p>
            </div>
            <div className="flex items-center">
              <button 
                onClick={fetchRealTimeSoilData} 
                className="p-2 rounded-full hover:bg-gray-100"
                disabled={loadingRealTime}
              >
                <RefreshCw className={`h-5 w-5 text-gray-500 ${loadingRealTime ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* pH Level */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">pH Level</span>
              <span className="text-lg font-bold text-gray-900">{realTimeData.pH}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  realTimeData.pH >= 6.5 && realTimeData.pH <= 7.5 ? 'bg-green-500' :
                  realTimeData.pH < 6.0 || realTimeData.pH > 8.0 ? 'bg-red-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${(realTimeData.pH / 14) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Acidic (0)</span>
              <span>Neutral (7)</span>
              <span>Alkaline (14)</span>
            </div>
          </div>

          {/* Nutrients */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Nitrogen (N)</p>
              <p className="text-lg font-bold text-gray-900">{realTimeData.nutrients.nitrogen}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getNutrientStatus(realTimeData.nutrients.nitrogen, 'nitrogen'))}`}>
                {getNutrientStatus(realTimeData.nutrients.nitrogen, 'nitrogen')}
              </span>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Phosphorus (P)</p>
              <p className="text-lg font-bold text-gray-900">{realTimeData.nutrients.phosphorus}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getNutrientStatus(realTimeData.nutrients.phosphorus, 'phosphorus'))}`}>
                {getNutrientStatus(realTimeData.nutrients.phosphorus, 'phosphorus')}
              </span>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Potassium (K)</p>
              <p className="text-lg font-bold text-gray-900">{realTimeData.nutrients.potassium}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getNutrientStatus(realTimeData.nutrients.potassium, 'potassium'))}`}>
                {getNutrientStatus(realTimeData.nutrients.potassium, 'potassium')}
              </span>
            </div>
          </div>

          {/* Organic Matter */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Organic Matter</span>
              <span className="text-lg font-bold text-gray-900">{realTimeData.nutrients.organicMatter}%</span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Recommendations</h4>
            <ul className="space-y-1">
              {realTimeData.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Historical Soil Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {soilAnalyses.length > 0 ? soilAnalyses.map((analysis) => (
          <div key={analysis.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span>{analysis.location}</span>
                </h3>
                <p className="text-sm text-gray-600">Analyzed on {new Date(analysis.date).toLocaleDateString()}</p>
              </div>
              <TestTube className="h-6 w-6 text-amber-600" />
            </div>

            {/* pH Level */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">pH Level</span>
                <span className="text-lg font-bold text-gray-900">{analysis.pH}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    analysis.pH >= 6.5 && analysis.pH <= 7.5 ? 'bg-green-500' :
                    analysis.pH < 6.0 || analysis.pH > 8.0 ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${(analysis.pH / 14) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Acidic (0)</span>
                <span>Neutral (7)</span>
                <span>Alkaline (14)</span>
              </div>
            </div>

            {/* Nutrients */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Nitrogen (N)</p>
                <p className="text-lg font-bold text-gray-900">{analysis.nutrients?.nitrogen || analysis.nitrogen}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getNutrientStatus(analysis.nutrients?.nitrogen || analysis.nitrogen, 'nitrogen'))}`}>
                  {getNutrientStatus(analysis.nutrients?.nitrogen || analysis.nitrogen, 'nitrogen')}
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Phosphorus (P)</p>
                <p className="text-lg font-bold text-gray-900">{analysis.nutrients?.phosphorus || analysis.phosphorus}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getNutrientStatus(analysis.nutrients?.phosphorus || analysis.phosphorus, 'phosphorus'))}`}>
                  {getNutrientStatus(analysis.nutrients?.phosphorus || analysis.phosphorus, 'phosphorus')}
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Potassium (K)</p>
                <p className="text-lg font-bold text-gray-900">{analysis.nutrients?.potassium || analysis.potassium}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getNutrientStatus(analysis.nutrients?.potassium || analysis.potassium, 'potassium'))}`}>
                  {getNutrientStatus(analysis.nutrients?.potassium || analysis.potassium, 'potassium')}
                </span>
              </div>
            </div>

            {/* Organic Matter */}
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Organic Matter</span>
                <span className="text-lg font-bold text-gray-900">{analysis.nutrients?.organicMatter || analysis.organicMatter}%</span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )) : (
          <div className="col-span-2 bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600 mb-4">No historical soil analysis data available</p>
            <Button onClick={() => setShowAddAnalysis(true)} className="inline-flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Analysis
            </Button>
          </div>
        )}
      </div>

      {/* Soil Health Trends - Updated with real-time data */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Soil Health Trends</h2>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        
        {soilAnalyses.length > 0 || realTimeData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full inline-block mb-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Average pH</p>
              <p className="text-2xl font-bold text-gray-900">
                {realTimeData?.pH || 
                  (soilAnalyses.length > 0 ? 
                  (soilAnalyses.reduce((sum, item) => sum + item.pH, 0) / soilAnalyses.length).toFixed(1) : 
                  'N/A')}
              </p>
              {realTimeData && soilAnalyses.length > 0 && (
                <p className={`text-xs ${realTimeData.pH > soilAnalyses[0].pH ? 'text-green-600' : 'text-red-600'}`}>
                  {realTimeData.pH > soilAnalyses[0].pH ? '+' : ''}{(realTimeData.pH - soilAnalyses[0].pH).toFixed(1)} from previous
                </p>
              )}
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full inline-block mb-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Nitrogen Avg</p>
              <p className="text-2xl font-bold text-gray-900">
                {realTimeData?.nutrients?.nitrogen || 
                  (soilAnalyses.length > 0 ? 
                  (soilAnalyses.reduce((sum, item) => sum + (item.nutrients?.nitrogen || item.nitrogen || 0), 0) / soilAnalyses.length).toFixed(1) : 
                  'N/A')}
              </p>
              {realTimeData && soilAnalyses.length > 0 && (
                <p className={`text-xs ${(realTimeData.nutrients?.nitrogen || 0) > (soilAnalyses[0].nutrients?.nitrogen || soilAnalyses[0].nitrogen || 0) ? 'text-green-600' : 'text-red-600'}`}>
                  {(realTimeData.nutrients?.nitrogen || 0) > (soilAnalyses[0].nutrients?.nitrogen || soilAnalyses[0].nitrogen || 0) ? '+' : ''}
                  {((realTimeData.nutrients?.nitrogen || 0) - (soilAnalyses[0].nutrients?.nitrogen || soilAnalyses[0].nitrogen || 0)).toFixed(1)} from previous
                </p>
              )}
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full inline-block mb-3">
                <TestTube className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Phosphorus Avg</p>
              <p className="text-2xl font-bold text-gray-900">
                {realTimeData?.nutrients?.phosphorus || 
                  (soilAnalyses.length > 0 ? 
                  (soilAnalyses.reduce((sum, item) => sum + (item.nutrients?.phosphorus || item.phosphorus || 0), 0) / soilAnalyses.length).toFixed(1) : 
                  'N/A')}
              </p>
              {realTimeData && soilAnalyses.length > 0 && (
                <p className={`text-xs ${(realTimeData.nutrients?.phosphorus || 0) > (soilAnalyses[0].nutrients?.phosphorus || soilAnalyses[0].phosphorus || 0) ? 'text-green-600' : 'text-red-600'}`}>
                  {(realTimeData.nutrients?.phosphorus || 0) > (soilAnalyses[0].nutrients?.phosphorus || soilAnalyses[0].phosphorus || 0) ? '+' : ''}
                  {((realTimeData.nutrients?.phosphorus || 0) - (soilAnalyses[0].nutrients?.phosphorus || soilAnalyses[0].phosphorus || 0)).toFixed(1)} from previous
                </p>
              )}
            </div>
            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-full inline-block mb-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600">Organic Matter</p>
              <p className="text-2xl font-bold text-gray-900">
                {realTimeData?.nutrients?.organicMatter || 
                  (soilAnalyses.length > 0 ? 
                  (soilAnalyses.reduce((sum, item) => sum + (item.nutrients?.organicMatter || item.organicMatter || 0), 0) / soilAnalyses.length).toFixed(1) : 
                  'N/A')}%
              </p>
              {realTimeData && soilAnalyses.length > 0 && (
                <p className={`text-xs ${(realTimeData.nutrients?.organicMatter || 0) > (soilAnalyses[0].nutrients?.organicMatter || soilAnalyses[0].organicMatter || 0) ? 'text-green-600' : 'text-red-600'}`}>
                  {(realTimeData.nutrients?.organicMatter || 0) > (soilAnalyses[0].nutrients?.organicMatter || soilAnalyses[0].organicMatter || 0) ? '+' : ''}
                  {((realTimeData.nutrients?.organicMatter || 0) - (soilAnalyses[0].nutrients?.organicMatter || soilAnalyses[0].organicMatter || 0)).toFixed(1)} from previous
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No soil analysis data available to display trends</p>
            <Button 
              onClick={fetchRealTimeSoilData}
              className="inline-flex items-center"
              disabled={loadingRealTime}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingRealTime ? 'animate-spin' : ''}`} />
              Get Soil Analysis
            </Button>
          </div>
        )}
      </div>

      {/* Soil Improvement Tips */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h2 className="text-xl font-semibold text-green-900 mb-4">Soil Improvement Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Organic Matter Enhancement</h3>
            <p className="text-sm text-green-700">
              Add compost, manure, or cover crops to improve soil structure and water retention.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">pH Management</h3>
            <p className="text-sm text-green-700">
              Use lime to raise pH or sulfur to lower pH. Test regularly to maintain optimal levels.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Nutrient Balance</h3>
            <p className="text-sm text-green-700">
              Apply fertilizers based on soil test results to avoid over-fertilization and nutrient imbalances.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Soil Conservation</h3>
            <p className="text-sm text-green-700">
              Practice crop rotation, contour farming, and minimal tillage to prevent soil erosion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilPage;