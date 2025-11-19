import { Handler } from '@netlify/functions';
import mongoose from 'mongoose';

// MongoDB connection cache
let isConnected: boolean = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/agri_advisor_dev';
  await mongoose.connect(mongoUrl);
  isConnected = true;
}

// Weather endpoint handler
export const weather: Handler = async (event) => {
  const { lat, lon } = event.queryStringParameters || {};
  
  if (!lat || !lon) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing coordinates' })
    };
  }

  try {
    const axios = require('axios');
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch weather data' })
    };
  }
};

// Pest detection handler
export const pest: Handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { cropType, location, symptoms, imageUrl, imageData } = JSON.parse(event.body || '{}');
    
    try {
      const axios = require('axios');
      
      // Call your actual AI API here
      const response = await axios.post('https://api.aimlapi.com/v1/pest/detect', {
        cropType,
        location,
        symptoms,
        imageUrl,
        imageData
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.VITE_AIMLAPI_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Optionally store in MongoDB
      try {
        await connectToDatabase();
        const db = mongoose.connection.db;
        if (db) {
          const collection = db.collection('pest_detections');
          await collection.insertOne({
          cropType,
          location,
          symptoms,
          imageUrl,
          imageData,
          detection: response.data,
          createdAt: new Date()
        });
        }
      } catch (dbError) {
        console.warn('Failed to store in MongoDB:', dbError);
      }

      return {
        statusCode: 200,
        body: JSON.stringify(response.data)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to detect pests', details: errorMessage })
      };
    }
  }

  // Handle common pests endpoint
  if (event.httpMethod === 'GET') {
    const { cropType, lat, lon } = event.queryStringParameters || {};
    
    try {
      const axios = require('axios');
      
      // Get weather data first
      let weatherData = null;
      if (lat && lon) {
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
          params: {
            lat,
            lon,
            appid: process.env.OPENWEATHER_API_KEY,
            units: 'metric'
          }
        });
        weatherData = weatherResponse.data;
      }
      
      // Call AI API
      const response = await axios.post('https://api.aimlapi.com/v1/pest/detect', {
        cropType: cropType || 'general',
        location: lat && lon ? { lat: parseFloat(lat), lon: parseFloat(lon) } : null,
        weatherContext: weatherData ? {
          temperature: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          conditions: weatherData.weather[0].main
        } : null
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.VITE_AIMLAPI_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          pests: response.data.detectedPests || [],
          count: response.data.detectedPests?.length || 0,
          weatherContext: weatherData ? {
            temperature: weatherData.main.temp,
            humidity: weatherData.main.humidity,
            conditions: weatherData.weather[0].main
          } : null
        })
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch pest data', details: errorMessage })
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

// Soil analysis handler
export const soil: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { location, cropType, soilType, previousCrops, fieldSize } = JSON.parse(event.body || '{}');
  
  try {
    const axios = require('axios');
    
    const response = await axios.post('https://api.aimlapi.com/v1/soil/analysis', {
      location,
      cropType,
      soilType,
      previousCrops,
      fieldSize
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.VITE_AIMLAPI_AI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Optionally store in MongoDB
    try {
      await connectToDatabase();
      const db = mongoose.connection.db;
      if (db) {
        const collection = db.collection('soil_analysis');
        await collection.insertOne({
        location,
        cropType,
        soilType,
        previousCrops,
        fieldSize,
        analysis: response.data,
        createdAt: new Date()
      });
      }
    } catch (dbError) {
      console.warn('Failed to store in MongoDB:', dbError);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to analyze soil', details: errorMessage })
    };
  }
};

// Irrigation recommendations handler
export const irrigation: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { location, cropType, soilType, fieldSize, weatherData } = JSON.parse(event.body || '{}');
  
  try {
    const axios = require('axios');
    
    const response = await axios.post('https://api.aimlapi.com/v1/irrigation/recommend', {
      location,
      cropType,
      soilType,
      fieldSize,
      weatherData
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.VITE_AIMLAPI_AI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Optionally store in MongoDB
    try {
      await connectToDatabase();
      const db = mongoose.connection.db;
      if (db) {
        const collection = db.collection('irrigation_recommendations');
        await collection.insertOne({
        location,
        cropType,
        soilType,
        fieldSize,
        weatherData,
        recommendation: response.data,
        createdAt: new Date()
      });
      }
    } catch (dbError) {
      console.warn('Failed to store in MongoDB:', dbError);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get irrigation recommendations', details: errorMessage })
    };
  }
};

// Crop recommendations handler
export const crop: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { location, soilType, previousCrops, weatherData } = JSON.parse(event.body || '{}');
  
  try {
    const axios = require('axios');
    
    const response = await axios.post('https://api.aimlapi.com/v1/crop/recommend', {
      location,
      soilType,
      previousCrops,
      weatherData
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.VITE_AIMLAPI_AI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Optionally store in MongoDB
    try {
      await connectToDatabase();
      const db = mongoose.connection.db;
      if (db && db.collection) {
        const collection = db.collection('crop_recommendations');
        await collection.insertOne({
        location,
        soilType,
        previousCrops,
        weatherData,
        recommendation: response.data,
        createdAt: new Date()
      });
      }
    } catch (dbError) {
      console.warn('Failed to store in MongoDB:', dbError);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get crop recommendations', details: errorMessage })
    };
  }
};
