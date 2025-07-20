import axios from 'axios';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
}

export interface ForecastData {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  precipitation: number;
}

class WeatherService {
  private api = axios.create({
    baseURL: OPENWEATHER_BASE_URL,
    timeout: 10000,
  });

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await this.api.get('/weather', {
        params: {
          lat,
          lon,
          appid: OPENWEATHER_API_KEY,
          units: 'metric'
        }
      });

      const data = response.data;
      return {
        location: `${data.name}, ${data.sys.country}`,
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: 0, // Would need separate UV API call
        feelsLike: Math.round(data.main.feels_like)
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getForecast(lat: number, lon: number, days: number = 5): Promise<ForecastData[]> {
    try {
      const response = await this.api.get('/forecast', {
        params: {
          lat,
          lon,
          appid: OPENWEATHER_API_KEY,
          units: 'metric',
          cnt: days * 8 // 8 forecasts per day (every 3 hours)
        }
      });

      const forecasts: ForecastData[] = [];
      const dailyData: { [key: string]: any } = {};

      // Group forecasts by date
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
        dailyData[date].windSpeeds.push(item.wind.speed);
        dailyData[date].precipitation.push(item.rain?.['3h'] || 0);
      });

      // Process daily data
      Object.keys(dailyData).forEach(date => {
        const dayData = dailyData[date];
        forecasts.push({
          date,
          temperature: {
            min: Math.round(Math.min(...dayData.temperatures)),
            max: Math.round(Math.max(...dayData.temperatures))
          },
          humidity: Math.round(dayData.humidity.reduce((a: number, b: number) => a + b, 0) / dayData.humidity.length),
          description: dayData.descriptions[0], // Use first description of the day
          icon: dayData.icons[0], // Use first icon of the day
          windSpeed: dayData.windSpeeds.reduce((a: number, b: number) => a + b, 0) / dayData.windSpeeds.length,
          precipitation: dayData.precipitation.reduce((a: number, b: number) => a + b, 0)
        });
      });

      return forecasts.slice(0, days);
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw new Error('Failed to fetch forecast data');
    }
  }

  async searchLocation(query: string): Promise<Array<{name: string, lat: number, lon: number, country: string}>> {
    try {
      const response = await this.api.get('/geo/1.0/direct', {
        params: {
          q: query,
          limit: 5,
          appid: OPENWEATHER_API_KEY
        }
      });

      return response.data.map((location: any) => ({
        name: location.name,
        lat: location.lat,
        lon: location.lon,
        country: location.country
      }));
    } catch (error) {
      console.error('Error searching location:', error);
      throw new Error('Failed to search location');
    }
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
}

export const weatherService = new WeatherService();
export default weatherService;
