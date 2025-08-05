import axios from 'axios';
import { WeatherData, WeatherForecast } from '../types';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

class WeatherService {
  private api = axios.create({
    baseURL: OPENWEATHER_BASE_URL,
    timeout: 10000,
  });

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      if (!OPENWEATHER_API_KEY) {
        throw new Error('OpenWeather API key not configured');
      }

      const [weatherResponse, uvResponse, airQualityResponse] = await Promise.allSettled([
        this.api.get('/weather', {
          params: {
            lat,
            lon,
            appid: OPENWEATHER_API_KEY,
            units: 'metric'
          }
        }),
        this.api.get('/uvi', {
          params: {
            lat,
            lon,
            appid: OPENWEATHER_API_KEY
          }
        }).catch(() => ({ data: { value: 0 } })),
        this.api.get('/air_pollution', {
          params: {
            lat,
            lon,
            appid: OPENWEATHER_API_KEY
          }
        }).catch(() => ({ data: { list: [{ main: { aqi: 1 }, components: { pm2_5: 0, pm10: 0, o3: 0, no2: 0, so2: 0, co: 0 } }] } }))
      ]);

      if (weatherResponse.status === 'rejected') {
        throw new Error('Failed to fetch weather data');
      }

      const weather = weatherResponse.value.data;
      const uvData = uvResponse.status === 'fulfilled' ? uvResponse.value.data : { value: 0 };
      const airData = airQualityResponse.status === 'fulfilled' ? airQualityResponse.value.data : { list: [{ main: { aqi: 1 }, components: { pm2_5: 0, pm10: 0, o3: 0, no2: 0, so2: 0, co: 0 } }] };

      const forecast = await this.getForecast(lat, lon, 7);

      const weatherData: WeatherData = {
        location: `${weather.name}, ${weather.sys.country}`,
        temperature: Math.round(weather.main.temp),
        humidity: weather.main.humidity,
        windSpeed: weather.wind?.speed || 0,
        windDirection: this.getWindDirection(weather.wind?.deg || 0),
        pressure: weather.main.pressure,
        visibility: (weather.visibility || 10000) / 1000,
        uvIndex: Math.round(uvData.value || 0),
        condition: weather.weather[0].description,
        icon: weather.weather[0].icon,
        airQuality: {
          aqi: airData.list[0].main.aqi,
          level: this.getAQILevel(airData.list[0].main.aqi),
          pollutants: {
            pm25: airData.list[0].components.pm2_5,
            pm10: airData.list[0].components.pm10,
            o3: airData.list[0].components.o3,
            no2: airData.list[0].components.no2,
            so2: airData.list[0].components.so2,
            co: airData.list[0].components.co
          }
        },
        forecast,
        // Add compatibility fields for components expecting different structure
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
        weather: weather.weather,
        name: weather.name
      };

      return weatherData;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getForecast(lat: number, lon: number, days: number = 7): Promise<WeatherForecast[]> {
    try {
      const response = await this.api.get('/forecast', {
        params: {
          lat,
          lon,
          appid: OPENWEATHER_API_KEY,
          units: 'metric',
          cnt: days * 8
        }
      });

      const forecasts: WeatherForecast[] = [];
      const dailyData: { [key: string]: any } = {};

      response.data.list.forEach((item: any) => {
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
      console.error('Error fetching forecast:', error);
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
        (error) => {
          reject(new Error('Failed to get current location'));
        }
      );
    });
  }

  // Add missing searchLocation method
  async searchLocation(locationName: string): Promise<Array<{lat: number, lon: number, name: string, country: string, state?: string}>> {
    try {
      if (!OPENWEATHER_API_KEY) {
        throw new Error('Weather API key not found');
      }

      console.log(`Searching for location: ${locationName}`);
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationName)}&limit=5&appid=${OPENWEATHER_API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`No locations found for "${locationName}". Please try a different search term.`);
      }

      // Return locations with proper formatting
      const locations = data.map(location => ({
        lat: location.lat,
        lon: location.lon,
        name: location.name,
        country: location.country,
        state: location.state
      }));

      console.log(`Found ${locations.length} locations for "${locationName}"`);
      return locations;
    } catch (error) {
      console.error('Geocoding API Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to search location. Please try again.');
    }
  }
}

export const weatherService = new WeatherService();
export default weatherService;
