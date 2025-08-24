import express from 'express';
import { verifyToken } from './src/middleware/auth.js';
import { validateSearchQuery } from './src/middleware/checkInValidation.js';
import CheckInController from './src/controllers/checkInController.js';

async function testMiddlewareChain() {
  try {
    console.log('🔍 Testing middleware chain...\\n');
    
    const app = express();
    app.use(express.json());
    
    // Create a mock request and response
    const mockReq = {
      query: { q: 'test', limit: '10' },
      headers: {
        authorization: 'Bearer test-token'
      },
      user: { id: 1, role: 'front_desk' }
    };
    
    const mockRes = {
      json: (data) => {
        console.log('✅ Response:', JSON.stringify(data, null, 2));
      },
      status: (code) => {
        console.log(`Status: ${code}`);
        return mockRes;
      }
    };
    
    // Test 1: Test validateSearchQuery middleware directly
    console.log('1. Testing validateSearchQuery middleware...');
    try {
      await new Promise((resolve, reject) => {
        validateSearchQuery(mockReq, mockRes, (error) => {
          if (error) {
            console.error('❌ Middleware error:', error);
            reject(error);
          } else {
            console.log('✅ Middleware passed');
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('❌ Middleware test failed:', error.message);
    }
    
    // Test 2: Test controller method directly
    console.log('\\n2. Testing controller method directly...');
    try {
      await CheckInController.searchMembers(mockReq, mockRes);
    } catch (error) {
      console.error('❌ Controller test failed:', error.message);
    }
    
    // Test 3: Test with a simple route
    console.log('\\n3. Testing with simple route...');
    app.get('/test', (req, res) => {
      res.json({ success: true, message: 'Route works' });
    });
    
    // Test 4: Test the actual route with middleware
    console.log('\\n4. Testing actual route with middleware...');
    app.get('/search', 
      (req, res, next) => {
        console.log('✅ Auth middleware passed');
        req.user = { id: 1, role: 'front_desk' };
        next();
      },
      validateSearchQuery,
      CheckInController.searchMembers
    );
    
  } catch (error) {
    console.error('❌ Middleware chain test failed:', error.message);
    console.error('Error details:', error);
  }
}

testMiddlewareChain();
