import CheckInController from './src/controllers/checkInController.js';

async function testMethodBinding() {
  try {
    console.log('🔍 Testing method binding...\\n');
    
    const controller = CheckInController;
    
    // Check if methods are bound properly
    console.log('1. Checking method binding...');
    console.log('searchMembers bound:', typeof controller.searchMembers);
    console.log('getRecentCheckIns bound:', typeof controller.getRecentCheckIns);
    console.log('checkInMember bound:', typeof controller.checkInMember);
    
    // Test if methods are callable
    console.log('\\n2. Testing method callability...');
    
    const mockReq = {
      query: { q: 'test', limit: '10' },
      user: { id: 1, role: 'front_desk' }
    };
    
    const mockRes = {
      json: (data) => {
        console.log('✅ Method callable - Response:', data.success);
      },
      status: (code) => {
        console.log(`Status: ${code}`);
        return mockRes;
      }
    };
    
    // Test with explicit binding
    console.log('\\n3. Testing with explicit binding...');
    const boundSearchMembers = controller.searchMembers.bind(controller);
    await boundSearchMembers(mockReq, mockRes);
    
    console.log('\\n4. Testing direct call...');
    await controller.searchMembers(mockReq, mockRes);
    
  } catch (error) {
    console.error('❌ Method binding test failed:', error.message);
    console.error('Error details:', error);
  }
}

testMethodBinding();
