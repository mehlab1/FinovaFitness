import CheckInController from './src/controllers/checkInController.js';

async function testControllerDirectly() {
  try {
    console.log('🔍 Testing CheckInController directly...\\n');
    
    const controller = CheckInController;
    
    // Test 1: Search members
    console.log('1. Testing searchMembers...');
    try {
      // Create mock request and response objects
      const mockReq = {
        query: { q: 'test', limit: '10' },
        user: { id: 1, role: 'front_desk' }
      };
      
      const mockRes = {
        json: (data) => {
          console.log('✅ Controller response:', JSON.stringify(data, null, 2));
        },
        status: (code) => {
          console.log(`Status: ${code}`);
          return mockRes;
        }
      };
      
      await controller.searchMembers(mockReq, mockRes);
    } catch (error) {
      console.error('❌ Controller searchMembers failed:', error.message);
      console.error('Error details:', error);
    }
    
    // Test 2: Get recent check-ins
    console.log('\\n2. Testing getRecentCheckIns...');
    try {
      const mockReq = {
        query: { limit: '5', offset: '0' },
        user: { id: 1, role: 'front_desk' }
      };
      
      const mockRes = {
        json: (data) => {
          console.log('✅ Controller response:', JSON.stringify(data, null, 2));
        },
        status: (code) => {
          console.log(`Status: ${code}`);
          return mockRes;
        }
      };
      
      await controller.getRecentCheckIns(mockReq, mockRes);
    } catch (error) {
      console.error('❌ Controller getRecentCheckIns failed:', error.message);
      console.error('Error details:', error);
    }
    
  } catch (error) {
    console.error('❌ Controller test failed:', error.message);
    console.error('Error details:', error);
  }
}

testControllerDirectly();
