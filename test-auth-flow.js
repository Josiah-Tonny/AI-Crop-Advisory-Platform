// Test script to verify authentication flow
async function testAuthFlow() {
  try {
    console.log('Testing authentication flow...');
    
    // Test login endpoint
    const loginResponse = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    // Test register endpoint
    const registerResponse = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    console.log('Register response status:', registerResponse.status);
    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);
    
    console.log('Authentication flow tests completed');
  } catch (error) {
    console.error('Authentication flow test failed:', error);
  }
}

// Run the test
testAuthFlow();