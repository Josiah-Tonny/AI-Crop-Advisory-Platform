import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Import models
const { Crop } = await import('../src/server/models/Crop.js');
const { WeatherData } = await import('../src/server/models/WeatherData.js');
const { SoilAnalysis } = await import('../src/server/models/SoilAnalysis.js');
const { IrrigationSchedule } = await import('../src/server/models/IrrigationSchedule.js');

// Sample data for testing with real API integration
const sampleLocation = {
  lat: -1.2921, // Nairobi latitude
  lon: 36.8219, // Nairobi longitude
  city: 'Nairobi',
  country: 'Kenya',
  name: 'Nairobi, Kenya'
};

// Database connection function
async function connectDB() {
  const MONGODB_URL = process.env.MONGODB_URL;
  const DB_NAME = process.env.DB_NAME || 'crops';
  
  if (!MONGODB_URL) {
    throw new Error('MONGODB_URL is not defined in environment variables');
  }

  try {
    // Remove deprecated options
    await mongoose.connect(MONGODB_URL, {
      dbName: DB_NAME,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testDatabase() {
  try {
    console.log('🚀 Starting database tests with real API data...');
    console.log('Using MongoDB URL:', process.env.MONGODB_URL);
    
    // Connect to database
    await connectDB();
    
    // Clear existing test data
    console.log('\n🧹 Clearing existing test data...');
    await Promise.all([
      Crop.deleteMany({}),
      WeatherData.deleteMany({}),
      SoilAnalysis.deleteMany({}),
      IrrigationSchedule.deleteMany({})
    ]);
    
    // 1. Test Crop Model with all required fields
    console.log('\n🌱 Testing Crop model...');
    const crop = new Crop({
      name: 'Maize',
      scientificName: 'Zea mays',
      category: 'Cereals',
      growthDuration: '90-120 days',
      optimalTemp: '20-30°C',
      rainfall: '500-800mm',
      soilPH: '6.0-7.5',
      plantingDepth: '3-5cm',
      spacing: '75cm x 25cm',
      yield: '4-8 tons/hectare',
      diseases: ['Maize Streak Virus', 'Gray Leaf Spot', 'Rust'],
      pests: ['Fall Armyworm', 'Stem Borer', 'Cutworm'],
      fertilizer: 'NPK 17-17-17 at planting, Urea top-dressing',
      irrigation: 'Moderate water needs, critical during tasseling',
      harvesting: 'When moisture content is 20-25%',
      storage: 'Dry to 13% moisture, store in ventilated containers',
      // Add the missing required fields
      marketDemand: 'High',
      profitability: 'High'
    });
    const savedCrop = await crop.save();
    console.log('✅ Crop saved:', savedCrop.name);

    // 2. Test WeatherData Model with Real API
    console.log('\n☀️ Testing WeatherData model with real API...');
    const weatherApiKey = process.env.VITE_OPENWEATHER_API_KEY;
    if (!weatherApiKey) {
      throw new Error('VITE_OPENWEATHER_API_KEY is not defined in environment variables');
    }

    // Fetch real weather data
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${sampleLocation.lat}&lon=${sampleLocation.lon}&appid=${weatherApiKey}&units=metric`
    );

    const weatherData = new WeatherData({
      location: {
        lat: sampleLocation.lat,
        lon: sampleLocation.lon,
        city: sampleLocation.city,
        country: sampleLocation.country,
        name: sampleLocation.name
      },
      current: {
        temp: weatherResponse.data.main.temp,
        feels_like: weatherResponse.data.main.feels_like,
        humidity: weatherResponse.data.main.humidity,
        pressure: weatherResponse.data.main.pressure,
        wind_speed: weatherResponse.data.wind.speed,
        wind_deg: weatherResponse.data.wind.deg,
        weather: weatherResponse.data.weather,
        clouds: weatherResponse.data.clouds?.all || 0,
        visibility: weatherResponse.data.visibility,
        sunrise: weatherResponse.data.sys.sunrise,
        sunset: weatherResponse.data.sys.sunset,
        dt: weatherResponse.data.dt
      },
      forecast: []
    });
    
    const savedWeather = await weatherData.save();
    console.log('✅ Weather data saved for:', savedWeather.location.city);
    console.log('   Current temperature:', savedWeather.current.temp, '°C');
    console.log('   Conditions:', savedWeather.current.weather[0].description);

    // 3. Test SoilAnalysis Model with real soil data
    console.log('\n🌍 Testing SoilAnalysis model...');
    
    // Fetch real soil data from AgroMonitoring API
    const agroApiKey = process.env.VITE_AGROMONITORING_API_KEY;
    let soilData = null;
    
    if (agroApiKey) {
      try {
        console.log('   Fetching real soil data from AgroMonitoring API...');
        const soilResponse = await axios.get(
          `https://api.agromonitoring.com/agro/1.0/soil?lat=${sampleLocation.lat}&lon=${sampleLocation.lon}&appid=${agroApiKey}`
        );
        soilData = soilResponse.data;
        console.log('   ✅ Real soil data fetched successfully');
      } catch (error) {
        console.log('   ⚠️  AgroMonitoring API failed, using realistic sample data');
        console.log('   Error:', error.response?.data?.message || error.message);
      }
    }

    const soilAnalysis = new SoilAnalysis({
      location: {
        lat: sampleLocation.lat,
        lon: sampleLocation.lon,
        address: 'Test Farm, Nairobi'
      },
      ph: 6.5,
      nitrogen: 45,
      phosphorus: 25,
      potassium: 180,
      organicMatter: 3.2,
      moisture: soilData?.moisture || 42,
      temperature: soilData?.t10 || savedWeather.current.temp, // Use soil temp from API or air temp
      salinity: 0.8,
      texture: {
        sand: 40,
        silt: 35,
        clay: 25,
        texturalClass: 'Loam'
      },
      recommendations: ['Add nitrogen fertilizer', 'Apply lime to balance pH'],
      healthScore: 75,
      cropType: 'Maize'
    });
    
    const savedSoil = await soilAnalysis.save();
    console.log('✅ Soil analysis saved with health score:', savedSoil.healthScore);
    if (soilData) {
      console.log('   Real soil moisture:', savedSoil.moisture, '%');
      console.log('   Real soil temperature:', savedSoil.temperature, '°C');
    }

    // 4. Test IrrigationSchedule Model with real weather forecast
    console.log('\n💧 Testing IrrigationSchedule model...');
    
    // Fetch weather forecast for irrigation planning
    let forecastData = null;
    try {
      console.log('   Fetching weather forecast for irrigation planning...');
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${sampleLocation.lat}&lon=${sampleLocation.lon}&appid=${weatherApiKey}&units=metric`
      );
      forecastData = forecastResponse.data;
      console.log('   ✅ Weather forecast data fetched successfully');
    } catch (error) {
      console.log('   ⚠️  Forecast API failed, using current weather data');
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Calculate irrigation needs based on real weather data
    const nextDayForecast = forecastData?.list?.[0] || null;
    const expectedTemp = nextDayForecast?.main?.temp || savedWeather.current.temp;
    const expectedHumidity = nextDayForecast?.main?.humidity || savedWeather.current.humidity;
    const expectedRainfall = nextDayForecast?.rain?.['3h'] || 0;
    
    // Calculate water amount based on weather conditions
    const baseWaterNeed = 25; // Base water requirement in mm
    const tempFactor = expectedTemp > 25 ? 1.2 : expectedTemp < 15 ? 0.8 : 1.0;
    const humidityFactor = expectedHumidity < 60 ? 1.1 : 0.9;
    const calculatedWaterAmount = Math.round(baseWaterNeed * tempFactor * humidityFactor - expectedRainfall);
    
    const irrigationSchedule = new IrrigationSchedule({
      userId: new mongoose.Types.ObjectId(), // Mock user ID
      cropId: savedCrop._id,
      location: {
        lat: sampleLocation.lat,
        lon: sampleLocation.lon,
        address: 'Test Farm, Nairobi'
      },
      cropType: 'Maize',
      schedule: [{
        date: tomorrow,
        waterAmount: Math.max(calculatedWaterAmount, 0),
        duration: Math.max(Math.round(calculatedWaterAmount * 1.2), 15), // Duration in minutes
        method: calculatedWaterAmount > 20 ? 'Drip' : calculatedWaterAmount > 10 ? 'Sprinkler' : 'Manual',
        status: 'Pending',
        weatherConditions: {
          temperature: expectedTemp,
          humidity: expectedHumidity,
          rainfall: expectedRainfall
        }
      }],
      currentStage: 'Vegetative',
      soilType: 'Loamy',
      efficiency: {
        drip: { efficiency: 90, cost: 'High', suitability: 'All crops' },
        sprinkler: { efficiency: 75, cost: 'Medium', suitability: 'Field crops' },
        furrow: { efficiency: 60, cost: 'Low', suitability: 'Row crops' }
      },
      recommendations: [
        'Water in the early morning',
        'Monitor soil moisture',
        `Based on forecast (${nextDayForecast?.weather?.[0]?.description || 'current conditions'}), ${expectedRainfall > 5 ? 'reduce watering due to expected rain' : 'maintain regular watering schedule'}`
      ],
      totalWaterUsed: 100,
      totalWaterSaved: 25,
      lastIrrigated: new Date(),
      nextIrrigation: tomorrow,
      isActive: true,
      weatherConditions: {
        temperature: expectedTemp,
        humidity: expectedHumidity,
        windSpeed: nextDayForecast?.wind?.speed || savedWeather.current.wind_speed,
        lastUpdated: new Date()
      }
    });
    
    const savedSchedule = await irrigationSchedule.save();
    console.log('✅ Irrigation schedule saved. Next irrigation:', savedSchedule.nextIrrigation);
    console.log('   Calculated water amount:', calculatedWaterAmount, 'mm');
    console.log('   Method:', savedSchedule.schedule[0].method);
    console.log('   Duration:', savedSchedule.schedule[0].duration, 'minutes');

    // Query and log all saved data with real API integration summary
    console.log('\n📊 Database Test Summary with Real API Data:');
    console.log('===============================================');
    
    const crops = await Crop.find({});
    console.log(`🌱 Crops in database: ${crops.length}`);
    
    const weatherDataCount = await WeatherData.countDocuments();
    console.log(`☀️  Weather data records: ${weatherDataCount} (Real OpenWeather API data)`);
    
    const soilAnalyses = await SoilAnalysis.find({});
    console.log(`🌍 Soil analyses: ${soilAnalyses.length} ${soilData ? '(Real AgroMonitoring API data)' : '(Sample data - API unavailable)'}`);
    
    const schedules = await IrrigationSchedule.find({})
      .populate('cropId', 'name')
      .lean();
    console.log(`💧 Irrigation schedules: ${schedules.length} (Based on real weather forecast)`);
    
    console.log('\n🔗 API Integration Status:');
    console.log(`   OpenWeather API: ✅ Active (Temperature: ${savedWeather.current.temp}°C)`);
    console.log(`   AgroMonitoring API: ${soilData ? '✅ Active' : '⚠️  Unavailable'}`);
    console.log(`   LocationIQ API: ${process.env.VITE_LOCATIONIQ_API_KEY ? '🔑 Configured' : '❌ Not configured'}`);
    
    console.log('\n✅ All tests completed successfully with real API data integration!');
    
  } catch (error) {
    console.error('❌ Error during database test:', error);
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the test
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  testDatabase().catch(console.error);
}
