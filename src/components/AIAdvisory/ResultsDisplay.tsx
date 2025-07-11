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
  CloudSnow
} from 'lucide-react';
import { CropRecommendation, SoilAnalysis, PestControlAdvice, IrrigationAdvice } from '../../types';

interface ResultsDisplayProps {
  queryType: string;
  results: any;
  location: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ queryType, results, location }) => {
  if (!results) return null;

  const renderCropRecommendations = (crops: CropRecommendation[]) => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Crop Recommendations</h2>
            <p className="text-green-100 text-sm">AI-powered crop suggestions for {location}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {crops.map((crop, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
              <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Sprout className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{crop.name}</h3>
                  <p className="text-sm text-gray-600">Recommended for your location</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full ${
                    crop.suitability >= 80 ? 'bg-green-500' :
                    crop.suitability >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-semibold text-gray-700">{crop.suitability}% suitable</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Planting Information</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Best planting time:</span>
                      <span className="font-medium text-gray-900">{crop.plantingDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected yield:</span>
                      <span className="font-medium text-green-600">{crop.expectedYield}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Growing Requirements</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-600 block">Rainfall:</span>
                      <span className="font-medium text-gray-900">{crop.requirements.rainfall}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Temperature:</span>
                      <span className="font-medium text-gray-900">{crop.requirements.temperature}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Soil pH:</span>
                      <span className="font-medium text-gray-900">{crop.requirements.soilPH}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Fertilizer:</span>
                      <span className="font-medium text-gray-900">{crop.requirements.fertilizer}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Expert Farming Tips</span>
                </h4>
                <ul className="space-y-2">
                  {crop.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="text-sm text-gray-700 flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWeatherForecast = (weather: any, forecast?: any) => (
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
            {forecast.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 5).map((day: any, index: number) => (
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

  const renderSoilAnalysis = (analysis: SoilAnalysis) => (
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
        {Object.entries(analysis.results).map(([nutrient, data]) => (
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
          {analysis.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start space-x-3 text-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderPestControl = (pestAdvice: PestControlAdvice) => (
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

  const renderIrrigationAdvice = (irrigation: IrrigationAdvice) => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Irrigation Advisory</h2>
            <p className="text-cyan-100 text-sm">Smart irrigation recommendations for {irrigation.cropType} in {irrigation.location}</p>
          </div>
        </div>
      </div>

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

  switch (queryType) {
    case 'crop-recommendation':
      return renderCropRecommendations(results);
    case 'weather':
      return renderWeatherForecast(results.current, results.forecast);
    case 'soil-analysis':
      return renderSoilAnalysis(results);
    case 'pest-control':
      return renderPestControl(results);
    case 'irrigation':
      return renderIrrigationAdvice(results);
    default:
      return <div>Unknown query type</div>;
  }
};

export default ResultsDisplay;