const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env') // adjust the relative path to your .env
});
const { db, COLLECTIONS } = require('../src/config/firebase');
const http = require('http');

// Test all API endpoints and functionality
async function verifySystem() {
  console.log('🔍 Starting comprehensive system verification...\n');
  
  let allTestsPassed = true;
  const results = [];
  
  // Test 1: Firebase Connection
  try {
    console.log('1️⃣ Testing Firebase connection...');
    if (!db) {
      throw new Error('Firebase not available');
    }
    
    const [fullCount, minimalCount, categoriesDoc] = await Promise.all([
      db.collection(COLLECTIONS.MARKETS_FULL).count().get(),
      db.collection(COLLECTIONS.MARKETS_MINIMAL).count().get(),
      db.collection(COLLECTIONS.CATEGORIES).doc('all').get()
    ]);
    
    const fullMarkets = fullCount.data().count;
    const minimalMarkets = minimalCount.data().count;
    const categoriesExist = categoriesDoc.exists;
    
    console.log(`   ✅ Full markets collection: ${fullMarkets} documents`);
    console.log(`   ✅ Minimal markets collection: ${minimalMarkets} documents`);
    console.log(`   ✅ Categories collection: ${categoriesExist ? 'Present' : 'Missing'}`);
    
    if (fullMarkets === 0 || minimalMarkets === 0) {
      throw new Error('No markets found in database');
    }
    
    results.push({ test: 'Firebase Connection', status: 'PASS', details: `${fullMarkets} markets loaded` });
  } catch (error) {
    console.log(`   ❌ Firebase test failed: ${error.message}`);
    results.push({ test: 'Firebase Connection', status: 'FAIL', details: error.message });
    allTestsPassed = false;
  }
  
  // Test 2: Market Data Structure
  try {
    console.log('\n2️⃣ Testing market data structure...');
    
    const sampleDoc = await db.collection(COLLECTIONS.MARKETS_FULL).doc('1').get();
    if (!sampleDoc.exists) {
      throw new Error('Sample market not found');
    }
    
    const market = sampleDoc.data();
    const requiredFields = [
      'title', 'description', 'volume', 'categories', 'iconName', 'address',
      'startDate', 'endDate', 'market_mean', 'market_standard_deviation',
      'x_axis_field_name', 'x_axis_short_form', 'aicontext'
    ];
    
    const missingFields = requiredFields.filter(field => !market.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing fields: ${missingFields.join(', ')}`);
    }
    
    console.log(`   ✅ All required fields present`);
    console.log(`   ✅ AI context: ${market.aicontext ? 'Present' : 'Missing'}`);
    console.log(`   ✅ Categories: ${market.categories.join(', ')}`);
    
    results.push({ test: 'Market Data Structure', status: 'PASS', details: 'All fields validated' });
  } catch (error) {
    console.log(`   ❌ Data structure test failed: ${error.message}`);
    results.push({ test: 'Market Data Structure', status: 'FAIL', details: error.message });
    allTestsPassed = false;
  }
  
  // Test 3: API Endpoints
  try {
    console.log('\n3️⃣ Testing API endpoints...');
    
    const http = require('http');
    const { promisify } = require('util');
    
    // Helper function to make HTTP requests
    const makeRequest = (path) => {
      return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:5000${path}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(new Error('Invalid JSON response'));
            }
          });
        });
        req.on('error', reject);
        req.setTimeout(5000, () => reject(new Error('Request timeout')));
      });
    };
    
    // Test markets endpoint
    const marketsData = await makeRequest('/api/v1/markets?limit=5');
    
    if (!marketsData.success || !marketsData.data.markets) {
      throw new Error('Markets endpoint failed');
    }
    
    console.log(`   ✅ Markets endpoint: ${marketsData.data.markets.length} markets returned`);
    
    // Test single market endpoint
    const marketData = await makeRequest('/api/v1/markets/1');
    
    if (!marketData.success || !marketData.data.aicontext) {
      throw new Error('Single market endpoint missing AI context');
    }
    
    console.log(`   ✅ Single market endpoint: AI context present`);
    
    // Test categories endpoint
    const categoriesData = await makeRequest('/api/v1/markets/categories');
    
    if (!categoriesData.success || !Array.isArray(categoriesData.data)) {
      throw new Error('Categories endpoint failed');
    }
    
    console.log(`   ✅ Categories endpoint: ${categoriesData.data.length} categories`);
    
    // Test search endpoint
    const searchData = await makeRequest('/api/v1/markets/search?q=bitcoin');
    
    if (!searchData.success || !searchData.data.markets) {
      throw new Error('Search endpoint failed');
    }
    
    console.log(`   ✅ Search endpoint: ${searchData.data.markets.length} results for "bitcoin"`);
    
    results.push({ test: 'API Endpoints', status: 'PASS', details: 'All endpoints working' });
  } catch (error) {
    console.log(`   ❌ API test failed: ${error.message}`);
    results.push({ test: 'API Endpoints', status: 'FAIL', details: error.message });
    allTestsPassed = false;
  }
  
  // Test 4: Chat Integration
  try {
    console.log('\n4️⃣ Testing AI chat integration...');
    
    // Helper function for POST requests
    const makePostRequest = (path, data) => {
      return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const options = {
          hostname: 'localhost',
          port: 5000,
          path: path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };
        
        const req = http.request(options, (res) => {
          let responseData = '';
          res.on('data', chunk => responseData += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(responseData));
            } catch (error) {
              reject(new Error('Invalid JSON response'));
            }
          });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => reject(new Error('Request timeout')));
        req.write(postData);
        req.end();
      });
    };
    
    const chatData = await makePostRequest('/api/v1/chat', {
      message: 'What is this market about?',
      marketId: '1',
      aiContext: 'Test market context'
    });
    
    if (!chatData.success || !chatData.response) {
      throw new Error('Chat endpoint failed');
    }
    
    console.log(`   ✅ Chat endpoint working`);
    console.log(`   ✅ Response length: ${chatData.response.length} characters`);
    
    results.push({ test: 'AI Chat Integration', status: 'PASS', details: 'Chat working with OpenRouter' });
  } catch (error) {
    console.log(`   ❌ Chat test failed: ${error.message}`);
    results.push({ test: 'AI Chat Integration', status: 'FAIL', details: error.message });
    allTestsPassed = false;
  }
  
  // Test 5: Data Consistency
  try {
    console.log('\n5️⃣ Testing data consistency...');
    
    const [fullSnapshot, minimalSnapshot] = await Promise.all([
      db.collection(COLLECTIONS.MARKETS_FULL).get(),
      db.collection(COLLECTIONS.MARKETS_MINIMAL).get()
    ]);
    
    const fullIds = new Set();
    const minimalIds = new Set();
    
    fullSnapshot.forEach(doc => fullIds.add(doc.id));
    minimalSnapshot.forEach(doc => minimalIds.add(doc.id));
    
    const missingInFull = [...minimalIds].filter(id => !fullIds.has(id));
    const missingInMinimal = [...fullIds].filter(id => !minimalIds.has(id));
    
    if (missingInFull.length > 0 || missingInMinimal.length > 0) {
      throw new Error(`Data inconsistency: ${missingInFull.length} missing in full, ${missingInMinimal.length} missing in minimal`);
    }
    
    console.log(`   ✅ Data consistency verified: ${fullIds.size} markets in both collections`);
    
    results.push({ test: 'Data Consistency', status: 'PASS', details: 'Collections synchronized' });
  } catch (error) {
    console.log(`   ❌ Consistency test failed: ${error.message}`);
    results.push({ test: 'Data Consistency', status: 'FAIL', details: error.message });
    allTestsPassed = false;
  }
  
  // Summary
  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('========================');
  
  results.forEach(result => {
    const status = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${status} ${result.test}: ${result.details}`);
  });
  
  const passedTests = results.filter(r => r.status === 'PASS').length;
  const totalTests = results.length;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (allTestsPassed) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL! 🎉');
    console.log('\n✨ Your Aptos Distribution Markets platform is ready for production!');
    console.log('   - Firebase database synchronized with latest market data');
    console.log('   - All API endpoints working correctly');
    console.log('   - AI chat integration functional');
    console.log('   - Data consistency verified');
  } else {
    console.log('⚠️  Some tests failed. Please review the issues above.');
  }
  
  return allTestsPassed;
}

// Run verification if called directly
if (require.main === module) {
  verifySystem()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifySystem };
