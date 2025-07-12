import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Droplet, CloudRain, Sun, Thermometer, Wind } from 'lucide-react';

type IrrigationSchedule = {
  id: string;
  crop: string;
  frequency: string;
  duration: string;
  nextIrrigation: string;
  status: 'scheduled' | 'completed' | 'missed';
};

const IrrigationPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState({
    temperature: 0,
    humidity: 0,
    rainfall: 0,
    windSpeed: 0,
    lastRain: '2 days ago',
  });
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get weather data and schedules
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await irrigationAPI.getSchedules();
        
        // Mock data
        const mockSchedules: IrrigationSchedule[] = [
          {
            id: '1',
            crop: 'Maize',
            frequency: 'Every 3 days',
            duration: '30 minutes',
            nextIrrigation: 'Tomorrow, 6:00 AM',
            status: 'scheduled'
          },
          {
            id: '2',
            crop: 'Tomatoes',
            frequency: 'Daily',
            duration: '15 minutes',
            nextIrrigation: 'Today, 5:00 PM',
            status: 'scheduled'
          },
          {
            id: '3',
            crop: 'Beans',
            frequency: 'Every 2 days',
            duration: '20 minutes',
            nextIrrigation: 'Completed',
            status: 'completed'
          }
        ];

        setSchedules(mockSchedules);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching irrigation data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSchedules = schedules.filter(schedule =>
    schedule.crop.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Irrigation Advisory</h1>
        <p className="text-gray-600">Manage and optimize your farm's irrigation schedule</p>
      </div>

      {/* Weather Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Weather Conditions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Thermometer className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="text-2xl font-semibold text-gray-900">{weatherData.temperature}°C</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <Droplet className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Humidity</p>
              <p className="text-2xl font-semibold text-gray-900">{weatherData.humidity}%</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-purple-50 rounded-lg">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <CloudRain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rainfall</p>
              <p className="text-2xl font-semibold text-gray-900">{weatherData.rainfall}mm</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <div className="p-3 bg-yellow-100 rounded-full mr-4">
              <Wind className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Wind Speed</p>
              <p className="text-2xl font-semibold text-gray-900">{weatherData.windSpeed} km/h</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Sun className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-sm text-gray-600">
              Last rainfall: <span className="font-medium">{weatherData.lastRain}</span>
            </p>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Based on current conditions, your next irrigation is recommended in <span className="font-medium">2 days</span>.
          </p>
        </div>
      </div>

      {/* Irrigation Schedules */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium text-gray-900">Irrigation Schedules</h2>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                placeholder="Search by crop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden">
          {filteredSchedules.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredSchedules.map((schedule) => (
                <li key={schedule.id} className="hover:bg-gray-50">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-600 truncate">
                          {schedule.crop}
                        </p>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="font-medium">Frequency:</span>
                            <span className="ml-1">{schedule.frequency}</span>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="font-medium">Duration:</span>
                            <span className="ml-1">{schedule.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                        <p className={`text-sm font-medium ${
                          schedule.status === 'scheduled' ? 'text-blue-600' : 
                          schedule.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {schedule.nextIrrigation}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          schedule.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <Droplet className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No irrigation schedules</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'No schedules match your search.' : 'Get started by adding a new irrigation schedule.'}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <span>Add Schedule</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Water Conservation Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h2 className="text-lg font-medium text-blue-800 mb-4">Water Conservation Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Droplet className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-blue-900">Drip Irrigation</h3>
              <p className="mt-1 text-sm text-blue-700">
                Consider using drip irrigation systems to deliver water directly to plant roots, reducing evaporation and runoff.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CloudRain className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-blue-900">Rainwater Harvesting</h3>
              <p className="mt-1 text-sm text-blue-700">
                Collect and store rainwater for irrigation during dry periods to reduce dependence on other water sources.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Sun className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-blue-900">Time Your Watering</h3>
              <p className="mt-1 text-sm text-blue-700">
                Water early in the morning or late in the evening to minimize water loss due to evaporation.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-blue-900">Mulching</h3>
              <p className="mt-1 text-sm text-blue-700">
                Apply mulch around plants to retain soil moisture and reduce the need for frequent watering.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationPage;
