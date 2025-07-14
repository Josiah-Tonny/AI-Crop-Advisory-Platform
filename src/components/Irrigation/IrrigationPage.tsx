import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Calendar, 
  TrendingUp, 
  Thermometer, 
  Cloud, 
  Sun,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getWeatherData } from '../../services/api';

interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  description: string;
}

interface IrrigationSchedule {
  day: string;
  date: string;
  waterAmount: number;
  duration: number;
  method: string;
  priority: 'high' | 'medium' | 'low';
  weather: string;
}

const IrrigationPage: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Nairobi');

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const data = await getWeatherData(location);
      setWeatherData({
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        precipitation: data.rain?.['1h'] || 0,
        windSpeed: data.wind.speed,
        description: data.weather[0].description
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate irrigation schedule based on weather
  const generateIrrigationSchedule = (): IrrigationSchedule[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date();
    
    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      
      const temp = weatherData?.temperature || 25;
      const humidity = weatherData?.humidity || 60;
      const precipitation = weatherData?.precipitation || 0;
      
      // Calculate water needs based on weather
      let waterAmount = 15; // Base amount in liters per m²
      let priority: 'high' | 'medium' | 'low' = 'medium';
      
      if (temp > 30) waterAmount += 5;
      if (humidity < 40) waterAmount += 3;
      if (precipitation > 5) {
        waterAmount -= 8;
        priority = 'low';
      } else if (temp > 32 || humidity < 30) {
        priority = 'high';
      }
      
      return {
        day,
        date: date.toLocaleDateString(),
        waterAmount: Math.max(waterAmount, 5),
        duration: Math.round(waterAmount * 4), // 4 minutes per liter
        method: waterAmount > 20 ? 'Drip Irrigation' : 'Sprinkler',
        priority,
        weather: precipitation > 5 ? 'Rainy' : temp > 30 ? 'Hot' : 'Moderate'
      };
    });
  };

  const irrigationSchedule = generateIrrigationSchedule();

  const irrigationMethods = [
    {
      name: 'Drip Irrigation',
      efficiency: 95,
      waterSaving: 40,
      cost: 'Medium',
      suitability: 'Vegetables, Fruits',
      pros: ['90-95% water efficiency', 'Reduces weed growth', 'Precise water delivery'],
      cons: ['Higher initial cost', 'Requires maintenance', 'Can clog easily']
    },
    {
      name: 'Sprinkler System',
      efficiency: 75,
      waterSaving: 25,
      cost: 'Low',
      suitability: 'Cereals, Pasture',
      pros: ['Lower installation cost', 'Good for large areas', 'Easy to operate'],
      cons: ['Water loss to evaporation', 'Wind affects distribution', 'Can promote diseases']
    },
    {
      name: 'Furrow Irrigation',
      efficiency: 60,
      waterSaving: 10,
      cost: 'Very Low',
      suitability: 'Row Crops',
      pros: ['Very low cost', 'Simple technology', 'No power required'],
      cons: ['High water loss', 'Uneven distribution', 'Labor intensive']
    }
  ];

  const waterConservationTips = [
    {
      title: 'Mulching',
      description: 'Apply organic mulch to reduce evaporation by up to 70%',
      savings: '30-50%',
      icon: <Sun className="w-5 h-5" />
    },
    {
      title: 'Soil Improvement',
      description: 'Add compost to improve water retention capacity',
      savings: '20-30%',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      title: 'Timing Optimization',
      description: 'Water early morning or evening to reduce evaporation',
      savings: '15-25%',
      icon: <Clock className="w-5 h-5" />
    },
    {
      title: 'Rainwater Harvesting',
      description: 'Collect and store rainwater for dry periods',
      savings: '40-60%',
      icon: <Cloud className="w-5 h-5" />
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <Droplets className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading irrigation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Droplets className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Smart Irrigation Advisory</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Optimize your water usage with AI-powered irrigation scheduling based on real-time weather data and crop requirements.
          </p>
        </div>

        {/* Current Weather & Water Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Temperature</p>
                  <p className="text-2xl font-bold">{weatherData?.temperature}°C</p>
                </div>
                <Thermometer className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100">Humidity</p>
                  <p className="text-2xl font-bold">{weatherData?.humidity}%</p>
                </div>
                <Droplets className="w-8 h-8 text-cyan-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100">Precipitation</p>
                  <p className="text-2xl font-bold">{weatherData?.precipitation}mm</p>
                </div>
                <Cloud className="w-8 h-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100">Wind Speed</p>
                  <p className="text-2xl font-bold">{weatherData?.windSpeed} m/s</p>
                </div>
                <Zap className="w-8 h-8 text-teal-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 7-Day Irrigation Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-blue-600" />
              7-Day Irrigation Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {irrigationSchedule.map((schedule, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{schedule.day}</h3>
                        <p className="text-sm text-gray-600">{schedule.date}</p>
                      </div>
                      <Badge 
                        variant={schedule.priority === 'high' ? 'destructive' : 
                                schedule.priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {schedule.priority}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Water Amount:</span>
                        <span className="font-medium">{schedule.waterAmount}L/m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="font-medium">{schedule.duration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Method:</span>
                        <span className="font-medium text-blue-600">{schedule.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Weather:</span>
                        <span className="font-medium">{schedule.weather}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Irrigation Methods Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
              Irrigation Methods Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {irrigationMethods.map((method, index) => (
                <Card key={index} className="border-2 hover:border-blue-300 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-700">{method.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Efficiency</span>
                          <span className="text-sm font-medium">{method.efficiency}%</span>
                        </div>
                        <Progress value={method.efficiency} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Water Saving</span>
                          <span className="text-sm font-medium">{method.waterSaving}%</span>
                        </div>
                        <Progress value={method.waterSaving} className="h-2" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Cost:</span>
                        <Badge variant="outline">{method.cost}</Badge>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Best for:</span>
                        <p className="text-sm font-medium text-blue-600">{method.suitability}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-semibold text-green-700 mb-1">Advantages:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {method.pros.map((pro, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-1">Considerations:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {method.cons.map((con, i) => (
                            <li key={i} className="flex items-start">
                              <AlertTriangle className="w-3 h-3 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Water Conservation Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="w-6 h-6 mr-2 text-cyan-600" />
              Water Conservation Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {waterConservationTips.map((tip, index) => (
                <Card key={index} className="border-l-4 border-l-cyan-500">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        {tip.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{tip.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{tip.description}</p>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Save {tip.savings} water
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={fetchWeatherData} className="bg-blue-600 hover:bg-blue-700">
            <Droplets className="w-4 h-4 mr-2" />
            Refresh Weather Data
          </Button>
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            <Calendar className="w-4 h-4 mr-2" />
            Download Schedule
          </Button>
          <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            <TrendingUp className="w-4 h-4 mr-2" />
            Water Usage Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IrrigationPage;