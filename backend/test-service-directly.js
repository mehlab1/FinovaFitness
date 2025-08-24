import CheckInService from './src/services/checkInService.js';

async function testServiceDirectly() {
  try {
    console.log('🔍 Testing CheckInService directly...\n');
    
    const checkInService = CheckInService;
    
    // Test 1: Search active members
    console.log('1. Testing searchActiveMembers...');
    try {
      const searchResult = await checkInService.searchActiveMembers('test', 10);
      console.log('✅ Search successful:', searchResult);
    } catch (error) {
      console.error('❌ Search failed:', error.message);
      console.error('Error details:', error);
    }
    
    // Test 2: Get recent check-ins
    console.log('\n2. Testing getRecentCheckIns...');
    try {
      const recentResult = await checkInService.getRecentCheckIns(5, 0);
      console.log('✅ Recent check-ins successful:', recentResult);
    } catch (error) {
      console.error('❌ Recent check-ins failed:', error.message);
      console.error('Error details:', error);
    }
    
  } catch (error) {
    console.error('❌ Service test failed:', error);
  } finally {
    process.exit(0);
  }
}

testServiceDirectly();
