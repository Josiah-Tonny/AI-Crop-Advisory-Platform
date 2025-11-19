import axios from 'axios';

/**
 * Weather Fetcher Service
 * Fetches real-time weather data from OpenWeather API
 * Used for irrigation recommendation calculations
 */

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * Fetch current weather conditions for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Current weather data
 */
export async function fetchCurrentWeather(lat, lon) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY not configured');
    }

    const url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url, {
      timeout: REQUEST_TIMEOUT
    });

    const data = response.data;

    // Parse and return clean weather data
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg || 0,
      cloudiness: data.clouds.all,
      weatherCondition: data.weather[0].main,
      weatherDescription: data.weather[0].description,
      visibility: data.visibility || 10000,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      timestamp: data.dt
    };
  } catch (error) {
    if (error.response) {
      // API responded with error
      if (error.response.status === 401) {
        throw new Error('Invalid OpenWeather API key');
      } else if (error.response.status === 429) {
        throw new Error('OpenWeather API rate limit exceeded');
      } else if (error.response.status === 404) {
        throw new Error('Location not found');
      }
      throw new Error(`OpenWeather API error: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response
      throw new Error('OpenWeather API is unavailable');
    } else {
      // Other errors
      throw new Error(`Weather fetch error: ${error.message}`);
    }
  }
}

/**
 * Fetch 7-day weather forecast for a location
 * Aggregates 3-hour forecast data into daily forecasts
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} Array of 7 daily forecast objects
 */
export async function fetchForecast(lat, lon) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY not configured');
    }

    const url = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url, {
      timeout: REQUEST_TIMEOUT
    });

    const data = response.data;

    // OpenWeather 5-day forecast returns 3-hour intervals (40 data points)
    // Aggregate into daily forecasts
    const dailyForecasts = aggregateToDailyForecasts(data.list);

    return dailyForecasts;
  } catch (error) {
    if (error.response) {
      // API responded with error
      if (error.response.status === 401) {
        throw new Error('Invalid OpenWeather API key');
      } else if (error.response.status === 429) {
        throw new Error('OpenWeather API rate limit exceeded');
      } else if (error.response.status === 404) {
        throw new Error('Location not found');
      }
      throw new Error(`OpenWeather API error: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response
      throw new Error('OpenWeather API is unavailable');
    } else {
      // Other errors
      throw new Error(`Forecast fetch error: ${error.message}`);
    }
  }
}

/**
 * Aggregate 3-hour forecast intervals into daily forecasts
 * @param {Array} forecastList - Array of 3-hour forecast data points
 * @returns {Array} Array of daily forecast objects (7 days)
 */
function aggregateToDailyForecasts(forecastList) {
  const dailyData = {};

  // Group forecast data by date
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: dateKey,
        temps: [],
        humidity: [],
        windSpeed: [],
        precipitation: 0,
        precipitationChance: 0,
        conditions: [],
        pressure: []
      };
    }

    dailyData[dateKey].temps.push(item.main.temp);
    dailyData[dateKey].humidity.push(item.main.humidity);
    dailyData[dateKey].windSpeed.push(item.wind.speed);
    dailyData[dateKey].pressure.push(item.main.pressure);
    dailyData[dateKey].conditions.push(item.weather[0].main);

    // Add precipitation (rain or snow)
    if (item.rain && item.rain['3h']) {
      dailyData[dateKey].precipitation += item.rain['3h'];
    }
    if (item.snow && item.snow['3h']) {
      dailyData[dateKey].precipitation += item.snow['3h'];
    }

    // Track precipitation probability
    if (item.pop) {
      dailyData[dateKey].precipitationChance = Math.max(
        dailyData[dateKey].precipitationChance,
        item.pop * 100
      );
    }
  });

  // Convert to array and calculate daily statistics
  const dailyForecasts = Object.keys(dailyData)
    .sort()
    .slice(0, 7) // Take first 7 days
    .map(dateKey => {
      const day = dailyData[dateKey];

      return {
        date: day.date,
        high: Math.max(...day.temps),
        low: Math.min(...day.temps),
        avgTemp: day.temps.reduce((a, b) => a + b, 0) / day.temps.length,
        avgHumidity: day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length,
        avgWindSpeed: day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length,
        avgPressure: day.pressure.reduce((a, b) => a + b, 0) / day.pressure.length,
        precipitation: day.precipitation,
        precipitationChance: Math.round(day.precipitationChance),
        condition: getMostCommonCondition(day.conditions)
      };
    });

  return dailyForecasts;
}

/**
 * Get the most common weather condition for a day
 * @param {Array} conditions - Array of weather condition strings
 * @returns {string} Most common condition
 */
function getMostCommonCondition(conditions) {
  const counts = {};
  conditions.forEach(condition => {
    counts[condition] = (counts[condition] || 0) + 1;
  });

  return Object.keys(counts).reduce((a, b) =>
    counts[a] > counts[b] ? a : b
  );
}

export default {
  fetchCurrentWeather,
  fetchForecast
};
