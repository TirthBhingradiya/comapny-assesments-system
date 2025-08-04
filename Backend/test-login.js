const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';

async function testLogin() {
  try {

    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    


    // Test getting profile with token
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('✅ Profile retrieved successfully:', profileResponse.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\nLogin failed - possible issues:');
      console.log('- Wrong password');
      console.log('- User not found');
      console.log('- Account deactivated');
    }
  }
}

testLogin(); 