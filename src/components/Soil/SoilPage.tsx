import React, { useState, useEffect } from 'react';
import { 
  TestTube, 
  Plus, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  MapPin
} from 'lucide-react';
import { soilAPI } from '../../services/api';

const SoilPage: React.FC = () => {
  const [soilAnalyses, setSoilAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAnalysis, setShowAddAnalysis] = useState(false);

  useEffect(() => {
    const fetchSoilData = async () => {
      try {
        const response = await soilAPI.getSoilHistory();
        setSoilAnalyses(response.data);
      } catch (error) {
        console.error('Error fetching soil data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSoilData();
  }, []);

  const mockSoilData = [
    {
      id: 1,
      location: 'Field A - North Section',
      date: '2024-01-10',
      pH: 6.5,
      nitrogen: 45,
      phosphorus: 25,
      potassium: 180,
      organicMatter: 3.2,
      recommendations: [
        'Add lime to increase pH to optimal range (6.8-7.2)',
        'Apply nitrogen fertilizer before planting',
        'Maintain current phosphorus levels'
      ]
    },
    {
      id: 2,
      location: 'Field B - South Section',
      date: '2024-01-08',
      pH: 7.1,
      nitrogen: 38,
      phosphorus: 15,
      potassium: 220,
      organicMatter: 2.8,
      recommendations: [
        'pH levels are optimal',
        'Increase phosphorus with bone meal or rock phosphate',
        'Add compost to improve organic matter content'
      ]
    }
  ];

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

      {/* Soil Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockSoilData.map((analysis) => (
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
                <p className="text-lg font-bold text-gray-900">{analysis.nitrogen}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getNutrientStatus(analysis.nitrogen, 'nitrogen'))}`}>
                  {getNutrientStatus(analysis.nitrogen, 'nitrogen')}
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Phosphorus (P)</p>
                <p className="text-lg font-bold text-gray-900">{analysis.phosphorus}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getNutrientStatus(analysis.phosphorus, 'phosphorus'))}`}>
                  {getNutrientStatus(analysis.phosphorus, 'phosphorus')}
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Potassium (K)</p>
                <p className="text-lg font-bold text-gray-900">{analysis.potassium}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getNutrientStatus(analysis.potassium, 'potassium'))}`}>
                  {getNutrientStatus(analysis.potassium, 'potassium')}
                </span>
              </div>
            </div>

            {/* Organic Matter */}
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Organic Matter</span>
                <span className="text-lg font-bold text-gray-900">{analysis.organicMatter}%</span>
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
        ))}
      </div>

      {/* Soil Health Trends */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Soil Health Trends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full inline-block mb-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Average pH</p>
            <p className="text-2xl font-bold text-gray-900">6.8</p>
            <p className="text-xs text-green-600">+0.2 from last month</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full inline-block mb-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Nitrogen Avg</p>
            <p className="text-2xl font-bold text-gray-900">41.5</p>
            <p className="text-xs text-green-600">+3.2 from last month</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-full inline-block mb-3">
              <TestTube className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Phosphorus Avg</p>
            <p className="text-2xl font-bold text-gray-900">20</p>
            <p className="text-xs text-red-600">-2.1 from last month</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 p-4 rounded-full inline-block mb-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Organic Matter</p>
            <p className="text-2xl font-bold text-gray-900">3.0%</p>
            <p className="text-xs text-green-600">+0.1 from last month</p>
          </div>
        </div>
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