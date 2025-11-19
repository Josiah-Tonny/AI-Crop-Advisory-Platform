import React from 'react';
import { 
  Sprout, 
  CloudRain, 
  TestTube, 
  Bug, 
  Droplets, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  MapPin,
  Calendar,
  Thermometer,
  Eye,
  Wind,
  Gauge,
  Sun,
  Cloud,
  CloudSnow,
  Star,
  Info,
  ChevronDown,
  Activity
} from 'lucide-react';
import { CropRecommendation, WeatherData, WeatherForecast, SoilAnalysis } from '../../types';

interface ResultsDisplayProps {
  queryType: string;
  results: CropRecommendation[] | WeatherData | SoilAnalysis | any;
  location: string;
}

interface SoilAnalysis {
  location: string;
  overallHealth: string;
  results: {
    [key: string]: {
      value: string;
      status: string;
      recommendation: string;
    };
  };
  recommendations: string[];
}

interface PestControlAdvice {
  cropType: string;
  location: string;
  weatherConditions: {
    temperature: number;
    humidity: number;
    riskLevel: 'high' | 'moderate' | 'low';
  };
  identifiedPests: Array<{
    name: string;
    symptoms: string[];
    treatment: string;
    prevention: string;
  }>;
  generalAdvice: string[];
  weatherBasedAdvice: string;
}

interface IrrigationAdvice {
  cropType: string;
  location: string;
  dailyForecast: {
    expectedRainfall: number;
    irrigationNeeded: number;
    recommendation: string;
  };
  irrigationSchedule: Array<{
    date: string;
    rainExpected: string;
    irrigationNeeded: boolean;
    amount: string;
    timing: string;
  }>;
  methods: Array<{
    name: string;
    efficiency: string;
    suitability: string;
    cost: string;
  }>;
  tips: string[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ queryType, results, location }) => {
  if (!results) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
        <p className="text-gray-600">Please try your search again with different parameters.</p>
      </div>
    );
  }

  const renderCropRecommendations = (crops: CropRecommendation[] | undefined) => {
    // Ensure crops is an array
    const validCrops = Array.isArray(crops) ? crops : [];
    
    if (validCrops.length === 0) {
      return (
        <div className="text-center py-12">
          <Sprout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Crop Recommendations</h3>
          <p className="text-gray-600">Unable to generate recommendations for this location. Please try a different location or check your input parameters.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{validCrops.length}</div>
            <div className="text-green-700 text-sm">Recommended Crops</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {Math.round(validCrops.reduce((sum, crop) => sum + (crop.suitability || 0), 0) / validCrops.length)}%
            </div>
            <div className="text-blue-700 text-sm">Avg. Suitability</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {validCrops.filter(crop => (crop.suitability || 0) >= 80).length}
            </div>
            <div className="text-purple-700 text-sm">High Potential</div>
          </div>
        </div>

        {/* Crop Cards - Optimized for scrolling */}
        <div className="space-y-4">
          {validCrops.map((crop, index) => (
            <div key={crop.id || index} className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
              {/* Crop Header */}
              <div className="bg-gradient-to-r from-gray-50 to-green-50 p-6 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <Sprout className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{crop.name}</h3>
                      {crop.variety && (
                        <p className="text-green-600 font-medium">Variety: {crop.variety}</p>
                      )}
                      <p className="text-gray-600">
                        {crop.category && `${crop.category} • `}
                        Recommended for your area
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Suitability Score */}
                    <div className="text-center">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${
                        (crop.suitability || 0) >= 80 ? 'bg-green-100 text-green-800' :
                        (crop.suitability || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        <Star className="h-5 w-5 mr-2" />
                        {crop.suitability || 0}% Match
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crop Details */}
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <Sprout className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{crop.name}</h3>
                      {crop.variety && (
                        <p className="text-green-600 font-medium">Variety: {crop.variety}</p>
                      )}
                      <p className="text-gray-600">
                        {crop.category && `${crop.category} • `}
                        Recommended for your area
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Suitability Score */}
                    <div className="text-center">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${
                        (crop.suitability || 0) >= 80 ? 'bg-green-100 text-green-800' :
                        (crop.suitability || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        <Star className="h-5 w-5 mr-2" />
                        {crop.suitability || 0}% Match
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compact details grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left Column - Key Information */}
                  <div className="space-y-6">
                    {/* Planting & Harvest Info */}
                    <div className="bg-blue-50 rounded-xl p-5">
                      <h4 className="font-bold text-blue-900 mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Planting Schedule
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700 font-medium">Best Planting Time:</span>
                          <span className="text-blue-900 font-bold">{crop.plantingDate || crop.plantingTime || 'March-April'}</span>
                        </div>
                        {crop.harvestTime && (
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Harvest Period:</span>
                            <span className="text-blue-900 font-bold">{crop.harvestTime}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700 font-medium">Expected Yield:</span>
                          <span className="text-green-600 font-bold">{crop.expectedYield}</span>
                        </div>
                      </div>
                    </div>

                    {/* Requirements */}
                    {crop.requirements && (
                      <div className="bg-amber-50 rounded-xl p-5">
                        <h4 className="font-bold text-amber-900 mb-4">Growing Requirements</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {crop.requirements.rainfall && (
                            <div className="text-center p-3 bg-white rounded-lg">
                              <CloudRain className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                              <p className="text-xs text-gray-600">Rainfall</p>
                              <p className="font-bold text-gray-900">{crop.requirements.rainfall}</p>
                            </div>
                          )}
                          {crop.requirements.temperature && (
                            <div className="text-center p-3 bg-white rounded-lg">
                              <Thermometer className="h-6 w-6 text-red-500 mx-auto mb-2" />
                              <p className="text-xs text-gray-600">Temperature</p>
                              <p className="font-bold text-gray-900">{crop.requirements.temperature}</p>
                            </div>
                          )}
                          {crop.requirements.soilPH && (
                            <div className="text-center p-3 bg-white rounded-lg">
                              <TestTube className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                              <p className="text-xs text-gray-600">Soil pH</p>
                              <p className="font-bold text-gray-900">{crop.requirements.soilPH}</p>
                            </div>
                          )}
                          {crop.requirements.fertilizer && (
                            <div className="text-center p-3 bg-white rounded-lg">
                              <Activity className="h-6 w-6 text-green-500 mx-auto mb-2" />
                              <p className="text-xs text-gray-600">Fertilizer</p>
                              <p className="font-bold text-gray-900 text-xs">{crop.requirements.fertilizer}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Market Information */}
                    {crop.marketPrice && (
                      <div className="bg-green-50 rounded-xl p-5">
                        <h4 className="font-bold text-green-900 mb-4 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Market Information
                        </h4>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Current Price:</span>
                          <div className="text-right">
                            <span className="text-green-900 font-bold text-lg">
                              {crop.marketPrice.currency} {crop.marketPrice.current}
                            </span>
                            <div className={`text-xs flex items-center ${
                              crop.marketPrice.trend === 'up' ? 'text-green-600' :
                              crop.marketPrice.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {crop.marketPrice.trend}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Tips and Reasons */}
                  <div className="space-y-6">
                    {/* Why This Crop */}
                    {crop.reasons && crop.reasons.length > 0 && (
                      <div className="bg-purple-50 rounded-xl p-5">
                        <h4 className="font-bold text-purple-900 mb-4 flex items-center">
                          <Info className="h-5 w-5 mr-2" />
                          Why This Crop is Recommended
                        </h4>
                        <ul className="space-y-2">
                          {crop.reasons.map((reason, reasonIndex) => (
                            <li key={reasonIndex} className="flex items-start space-x-3">
                              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                              <span className="text-purple-800 text-sm">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Expert Tips */}
                    {crop.tips && crop.tips.length > 0 && (
                      <div className="bg-indigo-50 rounded-xl p-5">
                        <h4 className="font-bold text-indigo-900 mb-4 flex items-center">
                          <Sprout className="h-5 w-5 mr-2" />
                          Expert Growing Tips
                        </h4>
                        <ul className="space-y-3">
                          {crop.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-indigo-800 text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-4">
                      {crop.waterRequirement && (
                        <div className="bg-cyan-50 p-4 rounded-lg text-center">
                          <Droplets className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                          <p className="text-xs text-cyan-700 mb-1">Water Needs</p>
                          <p className="font-bold text-cyan-900">{crop.waterRequirement}</p>
                        </div>
                      )}
                      {crop.profitability && (
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                          <TrendingUp className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                          <p className="text-xs text-yellow-700 mb-1">Profitability</p>
                          <p className="font-bold text-yellow-900">{crop.profitability}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeatherForecast = (weather: WeatherData, forecast?: { list: WeatherForecast[] }) => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <CloudRain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Weather Forecast</h2>
            <p className="text-blue-100 text-sm flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{weather.name}, {weather.sys?.country}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Current Weather */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h3 className="text-lg font-semibold mb-2">Current Conditions</h3>
            <div className="flex items-center justify-center sm:justify-start space-x-4">
              <div className="text-4xl font-bold">{Math.round(weather.main.temp)}°C</div>
              <div>
                <p className="text-blue-100 capitalize">{weather.weather[0].description}</p>
                <p className="text-sm text-blue-200">Feels like {Math.round(weather.main.feels_like)}°C</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <img 
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
              alt={weather.weather[0].description}
              className="h-16 w-16 mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-1">Humidity</p>
          <p className="text-lg font-bold text-gray-900">{weather.main.humidity}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <Wind className="h-6 w-6 text-gray-500 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-1">Wind Speed</p>
          <p className="text-lg font-bold text-gray-900">{Math.round(weather.wind?.speed || 0)} m/s</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <Eye className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-1">Visibility</p>
          <p className="text-lg font-bold text-gray-900">{Math.round((weather.visibility || 10000) / 1000)} km</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <Gauge className="h-6 w-6 text-orange-500 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-1">Pressure</p>
          <p className="text-lg font-bold text-gray-900">{weather.main.pressure} hPa</p>
        </div>
      </div>

      {/* 5-Day Forecast */}
      {forecast && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">5-Day Forecast</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {forecast.list.filter((_: WeatherForecast, index: number) => index % 8 === 0).slice(0, 5).map((day: WeatherForecast, index: number) => (
              <div key={index} className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {index === 0 ? 'Today' : new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <img 
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} 
                  alt={day.weather[0].description}
                  className="h-10 w-10 mx-auto mb-2"
                />
                <p className="text-lg font-bold text-gray-900">{Math.round(day.main.temp_max)}°</p>
                <p className="text-sm text-gray-600">{Math.round(day.main.temp_min)}°</p>
                <p className="text-xs text-blue-600 mt-1">{Math.round((day.pop || 0) * 100)}% rain</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agricultural Insights */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4">Agricultural Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Irrigation Advice</h4>
            <p className="text-sm text-green-700">
              {weather.main.humidity > 70 
                ? "High humidity detected. Reduce irrigation to prevent fungal diseases."
                : weather.main.humidity < 40
                ? "Low humidity may stress plants. Consider light irrigation."
                : "Current humidity levels are favorable for most crops."}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Field Work Conditions</h4>
            <p className="text-sm text-green-700">
              {weather.main.temp > 30 
                ? "High temperatures. Work during early morning or evening hours."
                : weather.main.temp < 10
                ? "Cool temperatures. Protect sensitive crops from cold stress."
                : "Good conditions for field work and crop management."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSoilAnalysis = (analysis: SoilAnalysis) => {
    if (!analysis || !analysis.results) {
      return (
        <div className="text-center py-12">
          <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Soil Analysis Unavailable</h3>
          <p className="text-gray-600">Unable to generate soil analysis for this location.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <TestTube className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Soil Analysis</h2>
              <p className="text-amber-100 text-sm">Comprehensive soil health assessment for {analysis.location}</p>
            </div>
          </div>
        </div>

        {/* Overall Health */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Soil Health</h3>
          <div className={`inline-block px-6 py-3 rounded-full text-xl font-bold ${
            analysis.overallHealth === 'Excellent' ? 'bg-green-100 text-green-800' :
            analysis.overallHealth === 'Good' ? 'bg-blue-100 text-blue-800' :
            analysis.overallHealth === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {analysis.overallHealth}
          </div>
        </div>

        {/* Nutrient Analysis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analysis.results || {}).map(([nutrient, data]) => (
            <div key={nutrient} className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3 capitalize text-center">{nutrient}</h4>
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-gray-900">{data.value}</div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                  data.status === 'optimal' || data.status === 'adequate' ? 'bg-green-100 text-green-800' :
                  data.status === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {data.status}
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center">{data.recommendation}</p>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Soil Improvement Recommendations</h3>
          <ul className="space-y-3">
            {(analysis.recommendations || []).map((rec, index) => (
              <li key={index} className="flex items-start space-x-3 text-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderPestControl = (pestAdvice: PestControlAdvice) => {
    if (!pestAdvice || !pestAdvice.weatherConditions) {
      return (
        <div className="text-center py-12">
          <Bug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pest Control Data Unavailable</h3>
          <p className="text-gray-600">Unable to generate pest control advice for this location.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Bug className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Pest Control Advisory</h2>
              <p className="text-red-100 text-sm">Integrated pest management for {pestAdvice.cropType} in {pestAdvice.location}</p>
            </div>
          </div>
        </div>

        {/* Current Conditions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Risk Assessment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Thermometer className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Temperature</p>
              <p className="text-xl font-bold text-gray-900">{Math.round(pestAdvice.weatherConditions.temperature)}°C</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Humidity</p>
              <p className="text-xl font-bold text-gray-900">{pestAdvice.weatherConditions.humidity}%</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className={`h-8 w-8 mx-auto mb-2 ${
                pestAdvice.weatherConditions.riskLevel === 'high' ? 'text-red-500' : 
                pestAdvice.weatherConditions.riskLevel === 'moderate' ? 'text-yellow-500' : 'text-green-500'
              }`} />
              <p className="text-sm text-gray-600">Risk Level</p>
              <p className={`text-xl font-bold capitalize ${
                pestAdvice.weatherConditions.riskLevel === 'high' ? 'text-red-600' : 
                pestAdvice.weatherConditions.riskLevel === 'moderate' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {pestAdvice.weatherConditions.riskLevel}
              </p>
            </div>
          </div>
        </div>

        {/* Identified Pests */}
        {pestAdvice.identifiedPests.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Common Pests for {pestAdvice.cropType}</h3>
            {pestAdvice.identifiedPests.map((pest, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Bug className="h-5 w-5 text-red-600" />
                  <span>{pest.name}</span>
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-3">Symptoms to Look For</h5>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {pest.symptoms.map((symptom, sIndex) => (
                        <li key={sIndex} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Treatment</h5>
                      <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg">{pest.treatment}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Prevention</h5>
                      <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">{pest.prevention}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* General Advice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">General IPM Recommendations</h3>
          <ul className="space-y-3 mb-4">
            {pestAdvice.generalAdvice.map((advice, index) => (
              <li key={index} className="flex items-start space-x-3 text-blue-800">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{advice}</span>
              </li>
            ))}
          </ul>
          <div className="bg-blue-100 rounded-lg p-4">
            <p className="text-blue-800 font-medium text-sm mb-1">Weather-Based Advice:</p>
            <p className="text-blue-700 text-sm">{pestAdvice.weatherBasedAdvice}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderIrrigationAdvice = (irrigation: IrrigationAdvice) => {
    if (!irrigation || !irrigation.dailyForecast) {
      return (
        <div className="text-center py-12">
          <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Irrigation Data Unavailable</h3>
          <p className="text-gray-600">Unable to generate irrigation advice for this location.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* ...existing header code... */}

        {/* Daily Forecast */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Water Management</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <CloudRain className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Expected Rainfall</p>
              <p className="text-xl font-bold text-gray-900">{irrigation.dailyForecast.expectedRainfall.toFixed(1)}mm</p>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <Droplets className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Irrigation Needed</p>
              <p className="text-xl font-bold text-gray-900">{irrigation.dailyForecast.irrigationNeeded.toFixed(1)}mm</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Recommendation</p>
              <p className="text-sm font-medium text-gray-900 mt-2">{irrigation.dailyForecast.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Irrigation Schedule */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">5-Day Irrigation Schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Expected Rain</th>
                  <th className="text-left py-3 px-2">Irrigation</th>
                  <th className="text-left py-3 px-2">Amount</th>
                  <th className="text-left py-3 px-2">Best Time</th>
                </tr>
              </thead>
              <tbody>
                {irrigation.irrigationSchedule.map((day, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-2 font-medium">{new Date(day.date).toLocaleDateString()}</td>
                    <td className="py-3 px-2">{day.rainExpected}mm</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        day.irrigationNeeded ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {day.irrigationNeeded ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium">{day.amount}</td>
                    <td className="py-3 px-2 text-gray-600">{day.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Irrigation Methods */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Irrigation Methods</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {irrigation.methods.map((method, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-3">{method.name}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Efficiency:</span>
                    <span className="font-medium">{method.efficiency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Suitability:</span>
                    <span className="font-medium">{method.suitability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="font-medium">{method.cost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyan-900 mb-4">Water Conservation Tips</h3>
          <ul className="space-y-3">
            {irrigation.tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-3 text-cyan-800">
                <CheckCircle className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  switch (queryType) {
    case 'crop-recommendation':
      return renderCropRecommendations(results.recommendations || results);
    case 'weather':
      return renderWeatherForecast(results.current || results.weather?.current, results.forecast || results.weather?.forecast);
    case 'soil-analysis':
      return renderSoilAnalysis(results.soilAnalysis || results);
    case 'pest-control':
      return renderPestControl(results.pestControl || results);
    case 'irrigation':
      return renderIrrigationAdvice(results.irrigation || results);
    default:
      return (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unknown Query Type</h3>
          <p className="text-gray-600">The query type "{queryType}" is not supported.</p>
        </div>
      );
  }
};

export default ResultsDisplay;