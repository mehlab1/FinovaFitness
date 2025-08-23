// Simple manual test to verify frontend is working
console.log('🧪 Manual Test: Frontend Connectivity');

// Test 1: Check if frontend is accessible
fetch('http://localhost:5173')
  .then(response => {
    console.log('✅ Frontend server is running (Status:', response.status, ')');
    return response.text();
  })
  .then(html => {
    if (html.includes('Finova Fitness')) {
      console.log('✅ Frontend page loads correctly');
    } else {
      console.log('❌ Frontend page content issue');
    }
  })
  .catch(error => {
    console.log('❌ Frontend server not accessible:', error.message);
  });

// Test 2: Check if backend API is accessible
fetch('http://localhost:3001/api/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Backend API is running:', data.message);
  })
  .catch(error => {
    console.log('❌ Backend API not accessible:', error.message);
  });

// Test 3: Check membership plans API
fetch('http://localhost:3001/api/frontdesk/membership-plans')
  .then(response => response.json())
  .then(data => {
    if (data.success && data.data.length > 0) {
      console.log('✅ Membership plans API working (', data.data.length, 'plans available)');
    } else {
      console.log('❌ Membership plans API issue');
    }
  })
  .catch(error => {
    console.log('❌ Membership plans API error:', error.message);
  });

console.log('📋 Manual Test Instructions:');
console.log('1. Open http://localhost:5173 in your browser');
console.log('2. Click "Portals" dropdown');
console.log('3. Click "Front Desk Portal"');
console.log('4. Login with: frontdesk@finovafitness.com / frontdesk123');
console.log('5. Verify you can access "Walk-In Sales" tab');
console.log('6. Check if the form loads without errors');
