// Comprehensive database verification and data seeding script
require('dotenv').config();
const { db, COLLECTIONS } = require('../src/config/firebase');

// Sample markets data to write to database
const sampleMarkets = [
  {
    id: 'bitcoin-100k-2024',
    title: 'Will Bitcoin reach $100k by end of 2024?',
    description: 'Prediction market for Bitcoin price target of $100,000 by December 31, 2024',
    volume: 125000,
    categories: ['crypto'],
    iconName: 'bitcoin.png',
    address: '0x123abc...',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    market_mean: 75000,
    market_mean_min: 50000,
    market_mean_max: 150000,
    market_standard_deviation: 15000,
    market_standard_deviation_min: 5000,
    market_standard_deviation_max: 25000,
    min_sigma: 1000,
    Lambda: 0.1,
    peak_p: 0.8,
    headroom: 0.2,
    s: 1.5,
    mu_per_one: 1.0,
    sigma_per_one: 0.5,
    x_axis_field_name: 'Price (USD)',
    x_axis_short_form: 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'us-election-2024',
    title: 'US Presidential Election 2024',
    description: 'Prediction market for 2024 US Presidential Election outcome',
    volume: 250000,
    categories: ['politics', 'elections'],
    iconName: 'usa.png',
    address: '0x456def...',
    startDate: '2024-01-01',
    endDate: '2024-11-05',
    market_mean: 0.5,
    market_mean_min: 0.0,
    market_mean_max: 1.0,
    market_standard_deviation: 0.2,
    market_standard_deviation_min: 0.1,
    market_standard_deviation_max: 0.4,
    min_sigma: 0.05,
    Lambda: 0.15,
    peak_p: 0.6,
    headroom: 0.3,
    s: 2.0,
    mu_per_one: 0.8,
    sigma_per_one: 0.3,
    x_axis_field_name: 'Probability',
    x_axis_short_form: 'P',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tesla-stock-500',
    title: 'Will Tesla stock reach $500 by Q2 2024?',
    description: 'Prediction market for Tesla stock price target',
    volume: 89000,
    categories: ['stocks', 'tech'],
    iconName: 'tesla.png',
    address: '0x789ghi...',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    market_mean: 350,
    market_mean_min: 200,
    market_mean_max: 600,
    market_standard_deviation: 75,
    market_standard_deviation_min: 25,
    market_standard_deviation_max: 150,
    min_sigma: 10,
    Lambda: 0.12,
    peak_p: 0.7,
    headroom: 0.25,
    s: 1.8,
    mu_per_one: 1.2,
    sigma_per_one: 0.6,
    x_axis_field_name: 'Stock Price (USD)',
    x_axis_short_form: 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function verifyAndSeedDatabase() {
  try {
    console.log('🔍 Starting database verification...');
    
    if (!db) {
      console.error('❌ Database connection not available');
      return false;
    }

    console.log('✅ Database connection established');

    // Test 1: Check if we can write to the database
    console.log('\n📝 Test 1: Writing sample data to database...');
    
    const batch = db.batch();
    
    for (const market of sampleMarkets) {
      const docRef = db.collection(COLLECTIONS.MARKETS_MINIMAL).doc(market.id);
      batch.set(docRef, market);
      console.log(`  - Preparing to write: ${market.title}`);
    }

    await batch.commit();
    console.log('✅ Successfully wrote all sample markets to database');

    // Test 2: Read back the data
    console.log('\n📖 Test 2: Reading data back from database...');
    
    const snapshot = await db.collection(COLLECTIONS.MARKETS_MINIMAL).get();
    console.log(`📊 Found ${snapshot.size} documents in ${COLLECTIONS.MARKETS_MINIMAL} collection`);

    const retrievedMarkets = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      retrievedMarkets.push({
        id: doc.id,
        title: data.title,
        volume: data.volume,
        categories: data.categories
      });
      console.log(`  - ${doc.id}: ${data.title} (Volume: ${data.volume})`);
    });

    // Test 3: Query with filters
    console.log('\n🔍 Test 3: Testing filtered queries...');
    
    // Query by category
    const cryptoQuery = await db.collection(COLLECTIONS.MARKETS_MINIMAL)
      .where('categories', 'array-contains', 'crypto')
      .get();
    
    console.log(`📈 Found ${cryptoQuery.size} crypto markets:`);
    cryptoQuery.forEach(doc => {
      console.log(`  - ${doc.data().title}`);
    });

    // Query with sorting
    const sortedQuery = await db.collection(COLLECTIONS.MARKETS_MINIMAL)
      .orderBy('volume', 'desc')
      .limit(2)
      .get();
    
    console.log(`📊 Top 2 markets by volume:`);
    sortedQuery.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.title}: ${data.volume}`);
    });

    // Test 4: Test individual document retrieval
    console.log('\n🎯 Test 4: Testing individual document retrieval...');
    
    const singleDoc = await db.collection(COLLECTIONS.MARKETS_MINIMAL)
      .doc('bitcoin-100k-2024')
      .get();
    
    if (singleDoc.exists) {
      const data = singleDoc.data();
      console.log(`✅ Retrieved single document: ${data.title}`);
      console.log(`   Volume: ${data.volume}, Categories: ${data.categories.join(', ')}`);
    } else {
      console.log('❌ Single document not found');
    }

    console.log('\n🎉 All database tests completed successfully!');
    console.log(`📊 Database contains ${retrievedMarkets.length} markets`);
    
    return true;

  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

// Run the verification
verifyAndSeedDatabase().then(success => {
  if (success) {
    console.log('\n✅ Database is fully operational and ready for use!');
    process.exit(0);
  } else {
    console.log('\n❌ Database verification failed. Check the logs above.');
    process.exit(1);
  }
});
