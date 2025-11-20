// Test script to verify API endpoints
async function testApiEndpoints() {
  try {
    console.log('Testing API endpoints...');
    
    // Test the health endpoint
    const healthResponse = await fetch('/.netlify/functions/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test the auth function root endpoint
    const authRootResponse = await fetch('/.netlify/functions/auth');
    const authRootData = await authRootResponse.json();
    console.log('Auth function root:', authRootData);
    
    // Test the API function root endpoint
    const apiRootResponse = await fetch('/.netlify/functions/api');
    const apiRootData = await apiRootResponse.json();
    console.log('API function root:', apiRootData);
    
    console.log('API endpoint tests completed successfully');
  } catch (error) {
    console.error('API endpoint test failed:', error);
  }
}

// Run the test
testApiEndpoints();