#!/usr/bin/env node

// This script installs all the necessary dependencies for the AI Advisory platform

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the packages to install
const packages = [
  // API client
  'axios',
  
  // Weather API SDK
  'openweather-api-node',
  
  // Image processing
  'cloudinary',
  
  // YouTube API
  'googleapis',
  
  // Utility libraries
  'lodash',
  'date-fns',
  
  // Types
  '@types/lodash',
  '@types/node'
];

// Define dev dependencies
const devPackages = [
  // Testing libraries
  'jest',
  '@testing-library/react',
  '@testing-library/jest-dom',
  
  // Mock service worker for testing
  'msw'
];

console.log('🌱 Installing API integration dependencies for AI Advisory platform...');

try {
  // Install production dependencies
  console.log('\n📦 Installing production dependencies...');
  execSync(`npm install ${packages.join(' ')} --save`, { stdio: 'inherit' });
  
  // Install dev dependencies
  console.log('\n🔧 Installing development dependencies...');
  execSync(`npm install ${devPackages.join(' ')} --save-dev`, { stdio: 'inherit' });
  
  // Create an .env template file if it doesn't exist
  const envTemplatePath = path.resolve(path.dirname(__dirname), '.env.template');
  if (!fs.existsSync(envTemplatePath)) {
    console.log('\n📝 Creating .env template file...');
    
    const envContent = `# API Keys for AI Advisory Platform
# Make a copy of this file as .env and fill in your API keys

# Weather APIs
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_AGROMONITORING_API_KEY=your_agromonitoring_api_key
VITE_LOCATIONIQ_API_KEY=your_locationiq_api_key

# Plant APIs
VITE_TREFLE_API_KEY=your_trefle_api_key
VITE_PLANT_ID_API_KEY=your_plant_id_api_key

# Image Storage and Analysis
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
VITE_CLOUDINARY_API_SECRET=your_cloudinary_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset

# YouTube API
VITE_YOUTUBE_API_KEY=your_youtube_api_key

# AI Advisory API
VITE_AIMLAPI_AI_API_KEY=your_aiml_api_key
VITE_API_BASE_URL=http://localhost:5000/api
`;
    
    fs.writeFileSync(envTemplatePath, envContent);
    console.log('✅ Created .env.template file');
    console.log('📋 Make a copy named .env and add your actual API keys');
  }
  
  console.log('\n✅ All dependencies installed successfully!');
  console.log('\n🚀 Next steps:');
  console.log('1. Set up your API keys in the .env file');
  console.log('2. Import services in your components');
  console.log('3. Start using the integrated API services\n');
  
} catch (error) {
  console.error('\n❌ Error installing dependencies:');
  console.error(error.message);
  process.exit(1);
}
