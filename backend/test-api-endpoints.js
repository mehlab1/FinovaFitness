import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const testApiEndpoints = async () => {
  try {
    console.log('🧪 Testing Backend API Endpoints...\n');

    // Test 1: Member Search API
    console.log('1. Testing Member Search API...');
    try {
      const searchResponse = await axios.get(`${API_BASE_URL}/checkin/search?q=john`);
      console.log('✅ Member Search API Response:', {
        status: searchResponse.status,
        dataLength: searchResponse.data?.data?.length || 0,
        success: searchResponse.data?.success
      });
    } catch (error) {
      console.log('❌ Member Search API Error:', error.response?.status, error.response?.data?.error || error.message);
    }

    // Test 2: Recent Check-ins API
    console.log('\n2. Testing Recent Check-ins API...');
    try {
      const recentResponse = await axios.get(`${API_BASE_URL}/checkin/recent?limit=5`);
      console.log('✅ Recent Check-ins API Response:', {
        status: recentResponse.status,
        dataLength: recentResponse.data?.data?.length || 0,
        success: recentResponse.data?.success
      });
    } catch (error) {
      console.log('❌ Recent Check-ins API Error:', error.response?.status, error.response?.data?.error || error.message);
    }

    // Test 3: Check-in API (with valid data)
    console.log('\n3. Testing Check-in API...');
    try {
      // First get a user ID for testing
      const userResponse = await axios.get(`${API_BASE_URL}/checkin/search?q=test`);
      const testUser = userResponse.data?.data?.[0];
      
      if (testUser) {
        const checkInData = {
          userId: testUser.id,
          checkInTime: new Date().toISOString(),
          checkInType: 'manual'
        };
        
        const checkInResponse = await axios.post(`${API_BASE_URL}/checkin/checkin`, checkInData);
        console.log('✅ Check-in API Response:', {
          status: checkInResponse.status,
          success: checkInResponse.data?.success,
          checkInId: checkInResponse.data?.data?.id
        });
      } else {
        console.log('⚠️ No test user found for check-in test');
      }
    } catch (error) {
      console.log('❌ Check-in API Error:', error.response?.status, error.response?.data?.error || error.message);
    }

    // Test 4: Member History API
    console.log('\n4. Testing Member History API...');
    try {
      const userResponse = await axios.get(`${API_BASE_URL}/checkin/search?q=test`);
      const testUser = userResponse.data?.data?.[0];
      
      if (testUser) {
        const historyResponse = await axios.get(`${API_BASE_URL}/checkin/history/${testUser.id}`);
        console.log('✅ Member History API Response:', {
          status: historyResponse.status,
          dataLength: historyResponse.data?.data?.length || 0,
          success: historyResponse.data?.success
        });
      } else {
        console.log('⚠️ No test user found for history test');
      }
    } catch (error) {
      console.log('❌ Member History API Error:', error.response?.status, error.response?.data?.error || error.message);
    }

    // Test 5: Member Consistency API
    console.log('\n5. Testing Member Consistency API...');
    try {
      const userResponse = await axios.get(`${API_BASE_URL}/checkin/search?q=test`);
      const testUser = userResponse.data?.data?.[0];
      
      if (testUser) {
        const consistencyResponse = await axios.get(`${API_BASE_URL}/checkin/consistency/${testUser.id}`);
        console.log('✅ Member Consistency API Response:', {
          status: consistencyResponse.status,
          success: consistencyResponse.data?.success,
          currentWeek: consistencyResponse.data?.data?.currentWeek,
          history: consistencyResponse.data?.data?.history?.length || 0
        });
      } else {
        console.log('⚠️ No test user found for consistency test');
      }
    } catch (error) {
      console.log('❌ Member Consistency API Error:', error.response?.status, error.response?.data?.error || error.message);
    }

    // Test 6: Error Handling - Invalid Check-in Data
    console.log('\n6. Testing Error Handling - Invalid Check-in Data...');
    try {
      const invalidData = { invalid: 'data' };
      const errorResponse = await axios.post(`${API_BASE_URL}/checkin/checkin`, invalidData);
      console.log('⚠️ Unexpected success with invalid data:', errorResponse.status);
    } catch (error) {
      console.log('✅ Error Handling Test Passed:', {
        status: error.response?.status,
        error: error.response?.data?.error || 'Validation error'
      });
    }

    // Test 7: Error Handling - Invalid User ID
    console.log('\n7. Testing Error Handling - Invalid User ID...');
    try {
      const errorResponse = await axios.get(`${API_BASE_URL}/checkin/history/999999`);
      console.log('⚠️ Unexpected success with invalid user ID:', errorResponse.status);
    } catch (error) {
      console.log('✅ Error Handling Test Passed:', {
        status: error.response?.status,
        error: error.response?.data?.error || 'User not found'
      });
    }

    console.log('\n🎉 Backend API Testing Completed!');

  } catch (error) {
    console.error('❌ API Testing Failed:', error.message);
  }
};

// Wait a bit for the server to start, then run tests
setTimeout(testApiEndpoints, 3000);
