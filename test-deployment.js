// Test script to verify Netlify function deployment
async function testDeployment() {
  try {
    // Test the health endpoint
    const healthResponse = await fetch('/.netlify/functions/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test the auth function
    const authResponse = await fetch('/.netlify/functions/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const authData = await authResponse.json();
    console.log('Auth function test:', authData);
    
    // Test the API function
    const apiResponse = await fetch('/.netlify/functions/api');
    const apiData = await apiResponse.json();
    console.log('API function test:', apiData);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testDeployment();