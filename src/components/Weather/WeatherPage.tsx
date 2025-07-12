import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Sun, 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye,
  AlertTriangle,
  Calendar,
  MapPin
} from 'lucide-react';
import { weatherAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const WeatherPage: React.FC = () => {
  const { user } = useAuth();
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (user?.location) {
        try {
          const [currentResponse, forecastResponse] = await Promise.all([
            weatherAPI.getCurrentWeather(user.location),
            weatherAPI.getForecast(user.location, 7)
          ]);
          setCurrentWeather(currentResponse.data);
          setForecast(forecastResponse.data);
        } catch (error) {
          console.error('Error fetching weather data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWeatherData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <MapPin className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{user?.location}</h1>
        </div>
        <p className="text-blue-100">Real-time weather data and 7-day forecast</p>
      </div>

      {/* Current Weather */}
      {currentWeather && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Conditions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-full inline-block mb-3">
                <Thermometer className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600">Temperature</p>
              <p className="text-3xl font-bold text-gray-900">{currentWeather.current.temp_c}°C</p>
              <p className="text-xs text-gray-500">Feels like {currentWeather.current.feelslike_c}°C</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full inline-block mb-3">
                <Droplets className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Humidity</p>
              <p className="text-3xl font-bold text-gray-900">{currentWeather.current.humidity}%</p>
              <p className="text-xs text-gray-500">Dew point: {currentWeather.current.dewpoint_c}°C</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-full inline-block mb-3">
                <Wind className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-sm text-gray-600">Wind Speed</p>
              <p className="text-3xl font-bold text-gray-900">{currentWeather.current.wind_kph}</p>
              <p className="text-xs text-gray-500">km/h {currentWeather.current.wind_dir}</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-full inline-block mb-3">
                <Eye className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-600">Visibility</p>
              <p className="text-3xl font-bold text-gray-900">{currentWeather.current.vis_km}</p>
              <p className="text-xs text-gray-500">km</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {currentWeather.current.condition.text}
                </p>
                <p className="text-sm text-gray-600">
                  UV Index: {currentWeather.current.uv} | 
                  Pressure: {currentWeather.current.pressure_mb} mb
                </p>
              </div>
              <img 
                src={`https:${currentWeather.current.condition.icon}`} 
                alt={currentWeather.current.condition.text}
                className="h-16 w-16"
              />
            </div>
          </div>
        </div>
      )}

      {/* Weather Alerts */}
      {forecast?.alerts?.alert && forecast.alerts.alert.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-900">Weather Alerts</h2>
          </div>
          <div className="space-y-3">
            {forecast.alerts.alert.map((alert: any, index: number) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-900">{alert.headline}</h3>
                <p className="text-sm text-red-700 mt-2">{alert.desc}</p>
                <p className="text-xs text-red-600 mt-2">
                  Effective: {new Date(alert.effective).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      {forecast && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">7-Day Forecast</h2>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {forecast.forecast.forecastday.map((day: any, index: number) => (
              <div key={index} className="text-center p-4 rounded-lg hover:bg-gray-50">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <img 
                  src={`https:${day.day.condition.icon}`} 
                  alt={day.day.condition.text}
                  className="h-12 w-12 mx-auto mb-2"
                />
                <p className="text-lg font-bold text-gray-900">{Math.round(day.day.maxtemp_c)}°</p>
                <p className="text-sm text-gray-600">{Math.round(day.day.mintemp_c)}°</p>
                <p className="text-xs text-gray-500 mt-1">{day.day.daily_chance_of_rain}% rain</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agricultural Recommendations */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h2 className="text-xl font-semibold text-green-900 mb-4">Agricultural Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Irrigation Advice</h3>
            <p className="text-sm text-green-700">
              {currentWeather?.current.humidity > 70 
                ? "High humidity detected. Reduce irrigation to prevent fungal diseases."
                : "Consider irrigation if soil moisture is low."}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Pest Management</h3>
            <p className="text-sm text-green-700">
              {currentWeather?.current.temp_c > 25 
                ? "High temperatures may increase pest activity. Monitor crops closely."
                : "Cooler temperatures reduce pest pressure."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;