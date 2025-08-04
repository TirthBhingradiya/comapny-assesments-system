const axios = require('axios');

async function testCORS() {
  try {
    console.log('Testing CORS with localhost:3005...');
    
    const response = await axios.post('http://localhost:4000/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      employeeId: 'EMP001',
      department: 'IT',
      role: 'employee'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3005'
      }
    });
    

  } catch (error) {
    console.log('❌ CORS test failed!');
    console.log('Error:', error.message);
    if (error.response) {

  }
}

testCORS(); 