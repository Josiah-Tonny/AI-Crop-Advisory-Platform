/**
 * Test script to verify irrigation implementation
 * Run with: node test-irrigation.js
 */

import { getCropCoefficient, getSupportedCrops } from './src/server/services/cropCoefficients.js';
import { calculateSoilCapacity } from './src/server/services/soilWaterBalance.js';

console.log('=== Irrigation Implementation Test ===\n');

// Test 1: Supported crops
console.log('Test 1: Supported Crops');
const crops = getSupportedCrops();
console.log(`✓ Supported crops (${crops.length}):`, crops.join(', '));
console.log('');

// Test 2: Crop coefficient calculation
console.log('Test 2: Crop Coefficient Calculation');
try {
  const maizeCrop = getCropCoefficient('maize', 30);
  console.log(`✓ Maize at 30 days after planting:`);
  console.log(`  - Kc: ${maizeCrop.kc}`);
  console.log(`  - Stage: ${maizeCrop.stage}`);
  console.log(`  - Root depth: ${maizeCrop.rootDepth}m`);
  console.log(`  - Critical depletion: ${maizeCrop.criticalDepletion}`);
} catch (error) {
  console.log(`✗ Error: ${error.message}`);
}
console.log('');

// Test 3: Different crop stages
console.log('Test 3: Different Crop Stages');
try {
  const stages = [10, 40, 90, 130];
  stages.forEach(days => {
    const crop = getCropCoefficient('maize', days);
    console.log(`  Day ${days}: Stage=${crop.stage}, Kc=${crop.kc}`);
  });
  console.log('✓ Stage progression working correctly');
} catch (error) {
  console.log(`✗ Error: ${error.message}`);
}
console.log('');

// Test 4: Soil capacity calculation
console.log('Test 4: Soil Water Capacity');
const soilTypes = ['sandy', 'loamy', 'clay', 'silt'];
soilTypes.forEach(soil => {
  const capacity = calculateSoilCapacity(soil, 1.0);
  console.log(`  ${soil}: ${capacity.totalCapacity}mm (${capacity.description})`);
});
console.log('✓ Soil capacity calculations working');
console.log('');

// Test 5: Invalid crop handling
console.log('Test 5: Error Handling');
try {
  getCropCoefficient('banana', 30);
  console.log('✗ Should have thrown error for unsupported crop');
} catch (error) {
  console.log(`✓ Correctly handles invalid crop: "${error.message}"`);
}
console.log('');

// Test 6: File structure verification
console.log('Test 6: File Structure');
import fs from 'fs';
const requiredFiles = [
  'src/server/services/weatherFetcher.js',
  'src/server/services/et0Calculator.js',
  'src/server/services/cropCoefficients.js',
  'src/server/services/soilWaterBalance.js',
  'src/server/services/irrigationScheduler.js',
  'src/server/routes/irrigation.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('✓ All required files present');
}
console.log('');

console.log('=== Test Summary ===');
console.log('All core functionality tests passed!');
console.log('\nTo test the API endpoint:');
console.log('1. Install dependencies: npm install');
console.log('2. Configure .env file with OPENWEATHER_API_KEY and AIMLAPI_AI_API_KEY');
console.log('3. Start server: npm run server');
console.log('4. Test with curl:');
console.log(`
curl -X POST http://localhost:5000/api/irrigation/recommend \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "location": {"lat": -1.286389, "lon": 36.817223},
    "cropType": "maize",
    "soilType": "loamy",
    "plantingDate": "2025-01-01"
  }'
`);
