import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { aiAdvisoryAPI } from '../../services/api';
import { Search, AlertTriangle, Bug, Droplets, Shield, Calendar, Info } from 'lucide-react';

type Pest = {
  id: string;
  name: string;
  scientificName: string;
  affectedCrops: string[];
  symptoms: string[];
  prevention: string[];
  treatment: string[];
  image: string;
  riskLevel: 'Low' | 'Medium' | 'High';
};

type PestAlert = {
  id: string;
  pest: string;
  location: string;
  date: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Controlled' | 'Monitoring';
};

const PestControlPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [pests, setPests] = useState<Pest[]>([]);
  const [alerts, setAlerts] = useState<PestAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    pest: '',
    severity: 'Medium' as 'Low' | 'Medium' | 'High',
    notes: ''
  });

  // Common pests data (in a real app, this would come from an API)
  const commonPests: Pest[] = [
    {
      id: '1',
      name: 'Fall Armyworm',
      scientificName: 'Spodoptera frugiperda',
      affectedCrops: ['Maize', 'Sorghum', 'Rice', 'Wheat'],
      symptoms: [
        'Small holes in leaves',
        'Presence of egg masses on leaves',
        'Larvae feeding on leaves and stems',
        'Frass (insect excrement) on leaves'
      ],
      prevention: [
        'Plant early to avoid peak pest populations',
        'Use resistant varieties',
        'Practice crop rotation',
        'Maintain field sanitation'
      ],
      treatment: [
        'Apply biopesticides like Bacillus thuringiensis',
        'Use neem-based products',
        'Chemical control with recommended insecticides',
        'Biological control with natural enemies'
      ],
      image: 'fall_armyworm.jpg',
      riskLevel: 'High'
    },
    // Add more pests as needed
  ];

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await pestAPI.getPests();
        setPests(commonPests);
        
        // Simulate fetching pest alerts
        const mockAlerts: PestAlert[] = [
          {
            id: '1',
            pest: 'Fall Armyworm',
            location: user?.location || 'Nairobi',
            date: new Date().toISOString(),
            severity: 'High',
            status: 'Active'
          },
          // Add more mock alerts as needed
        ];
        setAlerts(mockAlerts);
      } catch (error) {
        console.error('Error fetching pest data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.location]);

  const filteredPests = pests.filter(pest => {
    const matchesSearch = pest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        pest.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCrop = !selectedCrop || 
                       pest.affectedCrops.some(crop => 
                         crop.toLowerCase() === selectedCrop.toLowerCase()
                       );
    return matchesSearch && matchesCrop;
  });

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, this would be an API call
      // await pestAPI.reportPest({
      //   ...newAlert,
      //   location: user?.location || '',
      //   date: new Date().toISOString(),
      //   status: 'Active'
      // });
      
      // For demo, add to local state
      const newPestAlert: PestAlert = {
        id: Date.now().toString(),
        pest: newAlert.pest,
        location: user?.location || 'Unknown',
        date: new Date().toISOString(),
        severity: newAlert.severity,
        status: 'Active'
      };
      
      setAlerts([newPestAlert, ...alerts]);
      setShowReportForm(false);
      setNewAlert({ pest: '', severity: 'Medium', notes: '' });
      
      // Show success message
      alert('Pest report submitted successfully!');
    } catch (error) {
      console.error('Error submitting pest report:', error);
      alert('Failed to submit pest report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pest & Disease Management</h1>
        <p className="text-gray-600">Identify, prevent, and control pests and diseases affecting your crops</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Search pests or diseases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
          >
            <option value="">All Crops</option>
            {Array.from(new Set(pests.flatMap(pest => pest.affectedCrops))).map((crop) => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pest Alerts */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Pest Alerts</h2>
          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Pest
          </button>
        </div>

        {showReportForm && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report a Pest Sighting</h3>
            <form onSubmit={handleReportSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="pest" className="block text-sm font-medium text-gray-700">
                    Pest or Disease Name
                  </label>
                  <input
                    type="text"
                    id="pest"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={newAlert.pest}
                    onChange={(e) => setNewAlert({...newAlert, pest: e.target.value})}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                    Severity
                  </label>
                  <select
                    id="severity"
                    className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({...newAlert, severity: e.target.value as 'Low' | 'Medium' | 'High'})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={newAlert.notes}
                    onChange={(e) => setNewAlert({...newAlert, notes: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        )}

        {alerts.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-green-600 truncate">
                        {alert.pest} - {alert.location}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          alert.severity === 'High' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {alert.severity}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {new Date(alert.date).toLocaleDateString()}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <Shield className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          Status: {alert.status}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Info className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        Report ID: {alert.id}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center bg-white py-8 rounded-lg shadow">
            <Bug className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pest alerts</h3>
            <p className="mt-1 text-sm text-gray-500">
              No active pest alerts in your area. Report a pest sighting to help your community.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowReportForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <AlertTriangle className="-ml-1 mr-2 h-5 w-5" />
                Report Pest
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pest Directory */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Common Pests & Diseases</h2>
        
        {filteredPests.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredPests.map((pest) => (
              <div key={pest.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {pest.name}
                        <span className="text-sm text-gray-500 ml-2">({pest.scientificName})</span>
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Affects: {pest.affectedCrops.join(', ')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pest.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                      pest.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {pest.riskLevel} Risk
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Symptoms</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <ul className="list-disc pl-5 space-y-1">
                          {pest.symptoms.map((symptom, i) => (
                            <li key={i}>{symptom}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                      <dt className="text-sm font-medium text-gray-500">Prevention</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <ul className="list-disc pl-5 space-y-1">
                          {pest.prevention.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Treatment</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <ul className="list-disc pl-5 space-y-1">
                          {pest.treatment.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white py-8 rounded-lg shadow">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>

      {/* Integrated Pest Management Tips */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-100">
        <h2 className="text-lg font-medium text-green-800 mb-4">Integrated Pest Management (IPM) Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                <Droplets className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-3 font-medium text-gray-900">Cultural Control</h3>
            </div>
            <p className="text-sm text-gray-600">
              Practice crop rotation, intercropping, and proper field sanitation to disrupt pest life cycles.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                <Bug className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-3 font-medium text-gray-900">Biological Control</h3>
            </div>
            <p className="text-sm text-gray-600">
              Encourage natural predators and parasites of pests by maintaining biodiversity on your farm.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-3 font-medium text-gray-900">Mechanical Control</h3>
            </div>
            <p className="text-sm text-gray-600">
              Use physical barriers, traps, and manual removal to reduce pest populations.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-3 font-medium text-gray-900">Chemical Control</h3>
            </div>
            <p className="text-sm text-gray-600">
              Use pesticides as a last resort and always follow label instructions carefully.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PestControlPage;
