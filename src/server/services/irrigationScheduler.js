/**
 * Irrigation Scheduler Service
 * Generates 7-day irrigation schedules based on weather, crop, and soil data
 * Integrates ET0, crop coefficients, and soil water balance
 */

import { calculateET0FromForecast } from './et0Calculator.js';
import { calculateEffectiveRainfall, calculateIrrigationNeed } from './soilWaterBalance.js';

/**
 * Generate 7-day irrigation schedule
 * @param {Object} params - Scheduling parameters
 * @param {number} params.et0 - Reference evapotranspiration for current day (mm/day)
 * @param {Object} params.cropData - Crop coefficient data from getCropCoefficient
 * @param {Array} params.forecast - 7-day weather forecast array
 * @param {string} params.soilType - Soil type
 * @param {number} params.soilCapacity - Soil water holding capacity (mm)
 * @param {number} params.currentMoisture - Current soil moisture (%)
 * @param {number} params.latitude - Latitude for ET0 calculations
 * @returns {Array} Array of 7 daily irrigation schedule objects
 */
export function generateSchedule(params) {
  const {
    et0,
    cropData,
    forecast,
    soilType,
    soilCapacity,
    currentMoisture,
    latitude
  } = params;

  const schedule = [];
  let moistureTracker = (currentMoisture / 100) * soilCapacity; // Convert to mm

  // Irrigation rate assumption: 5mm per hour
  const IRRIGATION_RATE = 5; // mm/hour

  // Get crop coefficient and critical depletion
  const kc = cropData.kc;
  const criticalDepletion = cropData.criticalDepletion;

  // Calculate readily available water threshold
  const RAW = soilCapacity * criticalDepletion;

  for (let i = 0; i < Math.min(7, forecast.length); i++) {
    const day = forecast[i];
    const date = new Date(day.date);

    // Calculate ET0 for this forecast day
    const dailyET0 = calculateET0FromForecast(day, latitude, date);

    // Calculate crop water requirement (ETc = ET0 × Kc)
    const dailyETc = dailyET0 * kc;

    // Calculate effective rainfall for this day
    const effectiveRain = calculateEffectiveRainfall(day.precipitation, soilType);

    // Update soil moisture: add rainfall, subtract ET
    let projectedMoisture = moistureTracker + effectiveRain - dailyETc;

    // Determine if irrigation is needed
    let waterAmount = 0;
    let priority = 'none';
    let method = 'No irrigation needed';

    // Check if moisture will fall below critical threshold
    if (projectedMoisture < RAW) {
      // Irrigation needed - refill to 90% field capacity
      const targetMoisture = soilCapacity * 0.90;
      waterAmount = Math.max(0, targetMoisture - projectedMoisture);

      // Set priority based on severity
      const moisturePercent = (projectedMoisture / soilCapacity) * 100;

      if (moisturePercent < 30) {
        priority = 'high';
      } else if (moisturePercent < 50) {
        priority = 'medium';
      } else {
        priority = 'low';
      }

      method = 'Based on field conditions and equipment availability';

      // Update moisture after irrigation
      moistureTracker = projectedMoisture + waterAmount;
    } else if (day.precipitation < 5 && projectedMoisture < soilCapacity * 0.80) {
      // Preventative irrigation if no rain expected and moisture declining
      waterAmount = dailyETc * 1.2; // Slightly more than daily need
      priority = 'low';
      method = 'Light preventative irrigation';

      // Update moisture
      moistureTracker = Math.min(projectedMoisture + waterAmount, soilCapacity);
    } else {
      // No irrigation needed
      moistureTracker = Math.min(projectedMoisture, soilCapacity);
    }

    // Skip irrigation if heavy rain is forecasted
    if (day.precipitation > 10) {
      waterAmount = 0;
      priority = 'none';
      method = 'Skip - rainfall forecasted';
      moistureTracker = Math.min(moistureTracker + effectiveRain, soilCapacity);
    }

    // Ensure moisture doesn't go negative
    moistureTracker = Math.max(0, moistureTracker);

    // Calculate irrigation duration in minutes
    const duration = waterAmount > 0 ? Math.round((waterAmount / IRRIGATION_RATE) * 60) : 0;

    // Format weather condition
    const weatherCondition = formatWeatherCondition(day);

    // Get day name
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Build schedule entry
    schedule.push({
      date: day.date,
      day: dayName,
      waterAmount: Math.round(waterAmount * 10) / 10,
      duration: duration,
      method: method,
      priority: priority,
      weatherCondition: weatherCondition,
      soilMoisture: Math.round((moistureTracker / soilCapacity) * 100),
      evapotranspiration: Math.round(dailyETc * 10) / 10,
      rainfall: Math.round(day.precipitation * 10) / 10,
      effectiveRainfall: Math.round(effectiveRain * 10) / 10
    });
  }

  return schedule;
}

/**
 * Format weather condition string
 * @param {Object} forecastDay - Forecast data for a day
 * @returns {string} Formatted weather description
 */
function formatWeatherCondition(forecastDay) {
  const condition = forecastDay.condition || 'Clear';
  const temp = Math.round(forecastDay.high);
  const precipitation = forecastDay.precipitation;

  let description = `${condition}, ${temp}°C`;

  if (precipitation > 20) {
    description += ', heavy rain expected';
  } else if (precipitation > 10) {
    description += ', moderate rain expected';
  } else if (precipitation > 2) {
    description += ', light rain possible';
  }

  return description;
}

/**
 * Generate irrigation recommendations based on conditions
 * @param {Object} params - Parameters for recommendations
 * @returns {Array<string>} Array of recommendation strings
 */
export function generateRecommendations(params) {
  const {
    soilType,
    cropData,
    weatherConditions,
    schedule
  } = params;

  const recommendations = [];

  // General timing recommendation
  recommendations.push('Irrigate early morning (6-8 AM) or evening (6-8 PM) to minimize evaporation');

  // Soil-specific recommendations
  if (soilType === 'sandy') {
    recommendations.push('Sandy soil: Irrigate more frequently with smaller amounts to reduce drainage losses');
    recommendations.push('Consider applying mulch to improve water retention');
  } else if (soilType === 'clay') {
    recommendations.push('Clay soil: Allow adequate time between irrigations for water infiltration');
    recommendations.push('Avoid over-irrigation to prevent waterlogging and runoff');
  } else if (soilType === 'loamy') {
    recommendations.push('Loamy soil: Good water retention balance - maintain consistent moisture levels');
  }

  // Crop-specific recommendations
  if (cropData.stage === 'initial') {
    recommendations.push(`${cropData.stageName}: Use light, frequent irrigation to support establishment`);
  } else if (cropData.stage === 'midSeason') {
    recommendations.push(`${cropData.stageName}: Critical growth stage - maintain consistent soil moisture`);
  }

  if (cropData.sensitivity) {
    recommendations.push(`Water sensitivity: ${cropData.sensitivity}`);
  }

  // Weather-based recommendations
  if (weatherConditions.avgTemp > 30) {
    recommendations.push('High temperatures expected - monitor crops closely for water stress signs');
  }

  if (weatherConditions.avgHumidity < 40) {
    recommendations.push('Low humidity conditions - consider increasing irrigation frequency');
  }

  if (weatherConditions.avgWind > 4) {
    recommendations.push('Windy conditions - adjust sprinkler irrigation to minimize drift and evaporation');
  }

  // Schedule-based recommendations
  const totalRainfall = schedule.reduce((sum, day) => sum + day.rainfall, 0);
  if (totalRainfall < 10) {
    recommendations.push('Limited rainfall forecasted - follow irrigation schedule consistently');
  }

  // General best practices
  recommendations.push('Check soil moisture before irrigating - adjust schedule based on actual conditions');
  recommendations.push('Monitor crop appearance for signs of water stress (wilting, leaf curling)');
  recommendations.push('Consider installing soil moisture sensors for precise irrigation management');

  return recommendations;
}

/**
 * Generate warnings based on concerning conditions
 * @param {Object} params - Parameters for warning generation
 * @returns {Array<string>} Array of warning strings
 */
export function generateWarnings(params) {
  const {
    weatherConditions,
    schedule,
    currentMoisture
  } = params;

  const warnings = [];

  // Temperature warnings
  if (weatherConditions.maxTemp > 35) {
    warnings.push('High temperature alert: Extreme heat expected - increase monitoring and be prepared to irrigate more frequently');
  } else if (weatherConditions.maxTemp > 32) {
    warnings.push('Elevated temperatures expected - crops may require additional water');
  }

  if (weatherConditions.minTemp < 10) {
    warnings.push('Cool temperatures expected - reduce irrigation to prevent waterlogging and disease');
  }

  // Humidity warnings
  if (weatherConditions.avgHumidity < 30) {
    warnings.push('Very low humidity alert - high evaporation rates expected, monitor soil moisture closely');
  } else if (weatherConditions.avgHumidity > 90) {
    warnings.push('Very high humidity - disease risk elevated, ensure good drainage and air circulation');
  }

  // Wind warnings
  if (weatherConditions.avgWind > 6) {
    warnings.push('High wind conditions - sprinkler irrigation efficiency may be reduced, consider drip or surface methods');
  }

  // Rainfall warnings
  const totalRainfall = schedule.reduce((sum, day) => sum + day.rainfall, 0);
  if (totalRainfall > 80) {
    warnings.push('Heavy rainfall expected - monitor for waterlogging and adjust drainage if needed');
  } else if (totalRainfall < 5) {
    warnings.push('Extended dry period - consistent irrigation critical for crop health');
  }

  // Moisture warnings
  if (currentMoisture < 30) {
    warnings.push('Critical soil moisture level - immediate irrigation required to prevent crop stress');
  } else if (currentMoisture < 50) {
    warnings.push('Low soil moisture - prioritize irrigation to maintain crop productivity');
  }

  // Check for consecutive high-priority irrigation days
  const highPriorityDays = schedule.filter(day => day.priority === 'high').length;
  if (highPriorityDays >= 3) {
    warnings.push('Multiple high-priority irrigation days detected - ensure water supply is adequate');
  }

  return warnings;
}

export default {
  generateSchedule,
  generateRecommendations,
  generateWarnings
};
