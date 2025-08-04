const axios = require('axios');

async function testAssignmentAPI() {
  try {
    console.log('🔍 Testing assignment API...');
    
    // First, login to get a token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@company.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Test the assignment list endpoint
    console.log('📋 Testing assignment list endpoint...');
    const assignmentResponse = await axios.get('http://localhost:4000/api/users/assignment/list', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Assignment API response:');
    console.log('Status:', assignmentResponse.status);
    console.log('Users found:', assignmentResponse.data.users?.length || 0);
    
    if (assignmentResponse.data.users) {
      assignmentResponse.data.users.forEach(user => {
        console.log(`- ${user.firstName} ${user.lastName} (${user.role}) - ${user.department}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAssignmentAPI(); 