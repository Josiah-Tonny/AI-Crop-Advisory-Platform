// API Services Test Script
// This script tests the connection to all integrated APIs

import axios from 'axios';
import weatherService from '../src/services/weatherService.js';
import plantService from '../src/services/plantService.js';
import imageService from '../src/services/imageService.js';
import educationService from '../src/services/educationService.js';

console.log('🔍 Testing API Services for AI Advisory Platform');
console.log('===============================================\n');

const testAPIs = async () => {
  const results = {
    weather: { status: 'Pending', message: '' },
    plant: { status: 'Pending', message: '' },
    image: { status: 'Pending', message: '' },
    education: { status: 'Pending', message: '' }
  };

  // Test Weather API
  try {
    console.log('Testing OpenWeather API...');
    const weatherData = await weatherService.getCurrentWeather(40.7128, -74.0060); // New York
    results.weather.status = 'Success ✅';
    results.weather.message = `Got weather data: ${weatherData.condition}, ${weatherData.temperature}°C`;
  } catch (error) {
    results.weather.status = 'Failed ❌';
    results.weather.message = `Error: ${error.message}`;
  }

  // Test Plant API
  try {
    console.log('Testing Trefle Plant API...');
    const plantSearchResult = await plantService.searchPlants('tomato');
    results.plant.status = 'Success ✅';
    results.plant.message = `Found ${plantSearchResult.data?.length || 0} plants matching "tomato"`;
  } catch (error) {
    results.plant.status = 'Failed ❌';
    results.plant.message = `Error: ${error.message}`;
  }

  // Test Image Service (Cloudinary)
  try {
    console.log('Testing Cloudinary API...');
    // Just check if we can access the Cloudinary configuration
    const config = imageService.cloudinaryConfig ? 'Available' : 'Not available';
    results.image.status = config === 'Available' ? 'Success ✅' : 'Warning ⚠️';
    results.image.message = `Cloudinary configuration: ${config}`;
  } catch (error) {
    results.image.status = 'Failed ❌';
    results.image.message = `Error: ${error.message}`;
  }

  // Test YouTube API
  try {
    console.log('Testing YouTube API...');
    const videoResults = await educationService.searchVideos('sustainable farming', 1);
    results.education.status = 'Success ✅';
    results.education.message = `Found ${videoResults.items?.length || 0} videos about sustainable farming`;
  } catch (error) {
    results.education.status = 'Failed ❌';
    results.education.message = `Error: ${error.message}`;
  }

  // Display results
  console.log('\n📊 API Integration Test Results');
  console.log('============================\n');
  
  Object.entries(results).forEach(([api, result]) => {
    console.log(`${api.toUpperCase()} API: ${result.status}`);
    console.log(`  ${result.message}\n`);
  });

  // Check if all APIs are working
  const allSuccessful = Object.values(results).every(r => r.status.includes('Success'));
  
  if (allSuccessful) {
    console.log('🎉 All API integrations are working correctly!');
  } else {
    console.log('⚠️ Some API integrations have issues. Please check the results above.');
  }

  console.log('\n📝 Next Steps:');
  console.log('1. Verify your API keys in the .env file if any tests failed');
  console.log('2. Check network connectivity if all tests failed');
  console.log('3. Refer to API_INTEGRATION.md for implementation details');
};

testAPIs().catch(error => {
  console.error('❌ Error running tests:', error);
});
