import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Droplets,
  Thermometer,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cropAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CropsPage: React.FC = () => {
  const { user } = useAuth();
  const [crops, setCrops] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCrop, setShowAddCrop] = useState(false);

  useEffect(() => {
    const fetchCropData = async () => {
      try {
        const response = await cropAPI.getCropHistory();
        setRecommendations(response.data);
      } catch (error) {
        console.error('Error fetching crop data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCropData();
  }, []);

  const cropTypes = [
    'Maize', 'Beans', 'Coffee', 'Tea', 'Rice', 'Wheat', 'Sorghum', 
    'Millet', 'Cassava', 'Sweet Potato', 'Irish Potato', 'Banana',
    'Tomato', 'Onion', 'Cabbage', 'Kale', 'Spinach'
  ];

  const mockCrops = [
    {
      id: 1,
      name: 'Maize Field A',
      type: 'Maize',
      plantingDate: '2024-03-15',
      expectedHarvest: '2024-07-15',
      area: 2.5,
      status: 'Growing',
      health: 85,
      stage: 'Flowering'
    },
    {
      id: 2,
      name: 'Bean Plot B',
      type: 'Beans',
      plantingDate: '2024-04-01',
      expectedHarvest: '2024-06-30',
      area: 1.2,
      status: 'Growing',
      health: 92,
      stage: 'Pod Formation'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading crop data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Crop Management</h1>
            <p className="text-green-100">Monitor and manage your crops with AI-powered insights</p>
          </div>
          <button
            onClick={() => setShowAddCrop(true)}
            className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Crop</span>
          </button>
        </div>
      </div>

      {/* Current Crops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockCrops.map((crop) => (
          <div key={crop.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
                <p className="text-sm text-gray-600">{crop.type} • {crop.area} hectares</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                crop.status === 'Growing' ? 'bg-green-100 text-green-800' :
                crop.status === 'Harvesting' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {crop.status}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Health Score</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        crop.health >= 80 ? 'bg-green-500' :
                        crop.health >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${crop.health}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{crop.health}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Planted</p>
                  <p className="font-medium">{new Date(crop.plantingDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Expected Harvest</p>
                  <p className="font-medium">{new Date(crop.expectedHarvest).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Current Stage</p>
                <p className="font-medium text-green-700">{crop.stage}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Crop Recommendations</h2>
        
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900">{rec.cropType}</h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {rec.aiConfidence}% confidence
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Planting Date</p>
                    <p className="font-medium">{rec.recommendations.plantingDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expected Yield</p>
                    <p className="font-medium">{rec.recommendations.expectedYield} tons/ha</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Irrigation</p>
                    <p className="font-medium">{rec.recommendations.irrigation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sprout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No crop recommendations yet. Add your first crop to get started!</p>
          </div>
        )}
      </div>

      {/* Crop Calendar */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Seasonal Crop Calendar</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['March-May', 'June-August', 'September-November', 'December-February'].map((season, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{season}</h3>
              <div className="space-y-2">
                {cropTypes.slice(index * 4, (index + 1) * 4).map((crop) => (
                  <div key={crop} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{crop}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CropsPage;