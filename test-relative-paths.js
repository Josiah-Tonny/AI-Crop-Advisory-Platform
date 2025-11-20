// Test script to verify relative paths are working correctly
async function testRelativePaths() {
  console.log('Testing relative paths...');
  
  try {
    // Test 1: Check if the API config is correct
    const apiConfig = await import('./src/config/apiConfig');
    console.log('API Config BASE_URL:', apiConfig.API_CONFIG.BASE_URL);
    console.log('API Config AUTH endpoints:', apiConfig.API_CONFIG.ENDPOINTS.AUTH);
    
    // Test 2: Simulate how axios would combine the baseURL and endpoint
    const baseURL = apiConfig.API_CONFIG.BASE_URL || '';
    const endpoint = apiConfig.API_CONFIG.ENDPOINTS.AUTH.LOGIN;
    console.log('Base URL:', baseURL);
    console.log('Endpoint:', endpoint);
    
    // Simulate how axios would combine the baseURL and endpoint
    let fullUrl;
    if (endpoint.startsWith('/')) {
      // Absolute path - replace the baseURL entirely
      fullUrl = endpoint;
    } else {
      // Relative path - combine with baseURL
      if (baseURL === '' || baseURL === '.') {
        fullUrl = endpoint;
      } else {
        fullUrl = baseURL + (baseURL.endsWith('/') ? '' : '/') + endpoint;
      }
    }
    console.log('Simulated full URL:', fullUrl);
    
    console.log('Relative paths test complete');
  } catch (error) {
    console.error('Relative paths test failed:', error);
  }
}

// Run the test
testRelativePaths();