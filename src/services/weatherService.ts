import axios from 'axios';
import { WeatherData, WeatherForecast } from '../types';

// Use backend proxy endpoints to avoid exposing API keys in the client bundle
const WEATHER_API_BASE = '/api/external';

// Cache for weather data to reduce API calls
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

class WeatherService {
  private api = axios.create({
    baseURL: WEATHER_API_BASE,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const cacheKey = `${lat},${lon}`;
      const cached = weatherCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await this.api.get('/weather/current', {
        params: { lat, lon }
      });

      const weather = response.data;
      const forecast = await this.getForecast(lat, lon, 7);

      const weatherData: WeatherData = {
        location: `${weather.name}, ${weather.sys?.country || ''}`.trim(),
        temperature: Math.round(weather.main.temp),
        humidity: weather.main.humidity,
        windSpeed: weather.wind?.speed || 0,
        windDirection: this.getWindDirection(weather.wind?.deg || 0),
        pressure: weather.main.pressure,
        visibility: (weather.visibility || 10000) / 1000,
        uvIndex: Math.round(weather.uvi || 0),
        condition: weather.weather?.[0]?.description || '',
        icon: weather.weather?.[0]?.icon || '',
        airQuality: {
          aqi: weather.air_pollution?.list?.[0]?.main?.aqi || 1,
          level: this.getAQILevel(weather.air_pollution?.list?.[0]?.main?.aqi || 1),
          pollutants: {
            pm25: weather.air_pollution?.list?.[0]?.components?.pm2_5 || 0,
            pm10: weather.air_pollution?.list?.[0]?.components?.pm10 || 0,
            o3: weather.air_pollution?.list?.[0]?.components?.o3 || 0,
            no2: weather.air_pollution?.list?.[0]?.components?.no2 || 0,
            so2: weather.air_pollution?.list?.[0]?.components?.so2 || 0,
            co: weather.air_pollution?.list?.[0]?.components?.co || 0
          }
        },
        forecast,
        main: {
          temp: weather.main.temp,
          humidity: weather.main.humidity,
          pressure: weather.main.pressure,
          feels_like: weather.main.feels_like
        },
        wind: {
          speed: weather.wind?.speed || 0,
          deg: weather.wind?.deg || 0
        },
        weather: weather.weather || [],
        name: weather.name
      };

      weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
      return weatherData;
    } catch (error) {
      // Error handling for current weather
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Weather API error: ${error.response.status} - ${error.response.statusText}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch weather data. Please try again.');
    }
  }

  async getForecast(lat: number, lon: number, days: number = 7): Promise<WeatherForecast[]> {
    try {
      const response = await this.api.get('/weather/forecast', {
        params: {
          lat,
          lon
        }
      });

      const forecasts: WeatherForecast[] = [];
      const dailyData: { [key: string]: { temperatures: number[]; humidity: number[]; descriptions: string[]; icons: string[]; windSpeeds: number[]; precipitation: number[] } } = {};

      response.data.list.forEach((item: { dt_txt: string; main: { temp: number; humidity: number }; weather: Array<{ description: string; icon: string }>; wind?: { speed: number }; rain?: { '3h': number }; snow?: { '3h': number } }) => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
          dailyData[date] = {
            temperatures: [],
            humidity: [],
            descriptions: [],
            icons: [],
            windSpeeds: [],
            precipitation: []
          };
        }

        dailyData[date].temperatures.push(item.main.temp);
        dailyData[date].humidity.push(item.main.humidity);
        dailyData[date].descriptions.push(item.weather[0].description);
        dailyData[date].icons.push(item.weather[0].icon);
        dailyData[date].windSpeeds.push(item.wind?.speed || 0);
        dailyData[date].precipitation.push(item.rain?.['3h'] || item.snow?.['3h'] || 0);
      });

      Object.keys(dailyData).slice(0, days).forEach(date => {
        const dayData = dailyData[date];
        const temps = dayData.temperatures;

        forecasts.push({
          date,
          day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
          high: Math.round(Math.max(...temps)),
          low: Math.round(Math.min(...temps)),
          condition: dayData.descriptions[0],
          icon: dayData.icons[0],
          humidity: Math.round(dayData.humidity.reduce((a: number, b: number) => a + b, 0) / dayData.humidity.length),
          windSpeed: Math.round(dayData.windSpeeds.reduce((a: number, b: number) => a + b, 0) / dayData.windSpeeds.length),
          precipitation: Math.round(dayData.precipitation.reduce((a: number, b: number) => a + b, 0) * 10) / 10,
          precipitationChance: Math.min(100, Math.round(dayData.precipitation.filter((p: number) => p > 0).length / dayData.precipitation.length * 100))
        });
      });

      return forecasts;
    } catch (error) {
      throw new Error('Failed to fetch forecast data');
    }
  }

  private getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  private getAQILevel(aqi: number): string {
    if (aqi === 1) return 'Good';
    if (aqi === 2) return 'Fair';
    if (aqi === 3) return 'Moderate';
    if (aqi === 4) return 'Poor';
    return 'Very Poor';
  }

  // Get user's current location
  async getCurrentLocation(): Promise<{lat: number, lon: number}> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (error) => {
          reject(new Error('Failed to get current location'));
        }
      );
    });
  }

  async searchLocation(locationName: string): Promise<Array<{lat: number, lon: number, name: string, country: string, state?: string}>> {
    try {
      const response = await this.api.get('/geo/search', {
        params: {
          q: locationName
        }
      });
      
      const data = response.data;
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`No locations found for "${locationName}". Please try a different search term.`);
      }

      const locations = data.map((location: { lat: number, lon: number, name: string, country: string, state?: string }) => ({
        lat: location.lat,
        lon: location.lon,
        name: location.name,
        country: location.country,
        state: location.state
      }));

      return locations;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Location API error: ${error.response.status} - ${error.response.statusText}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to search location. Please try again.');
    }
  }
}

export const weatherService = new WeatherService();
export default weatherService;
