// Test script to verify mock data implementation
const { aimlService } = require('./src/services/aimlService.ts');

// Test getPestControl with mock data
async function testPestControl() {
  try {
    console.log('Testing getPestControl with mock data...');
    const result = await aimlService.getPestControl({
      cropType: 'tomatoes',
      location: { lat: 40.7128, lon: -74.0060 },
      symptoms: ['yellowing leaves', 'spots']
    });
    
    console.log('✅ getPestControl mock data test passed!');
    console.log('Detected pests:', result.detectedPests.length);
    console.log('Recommendations:', result.recommendations.length);
    console.log('Educational videos:', result.educationalVideos.length);
  } catch (error) {
    console.error('❌ getPestControl test failed:', error.message);
  }
}

testPestControl();
