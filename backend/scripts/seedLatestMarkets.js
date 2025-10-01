const { db, COLLECTIONS } = require('../src/config/firebase');
const path = require('path');
const fs = require('fs');

// Import markets data from frontend
const marketsDataPath = path.join(__dirname, '../../frontend/src/data/markets.ts');

// Function to extract markets data from TypeScript file
function extractMarketsFromTS() {
  try {
    console.log('📖 Reading markets data from:', marketsDataPath);
    const fileContent = fs.readFileSync(marketsDataPath, 'utf8');
    
    // Extract the markets array from the TypeScript file
    const marketsMatch = fileContent.match(/export const markets: Market\[\] = (\[[\s\S]*?\]);/);
    if (!marketsMatch) {
      throw new Error('Could not find markets array in markets.ts');
    }
    
    // Convert TypeScript to JSON-compatible format
    let marketsString = marketsMatch[1];
    
    // More robust cleaning of TypeScript syntax
    marketsString = marketsString
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/(\w+)(\s*):/g, '"$1":') // Quote property names with optional spacing
      .replace(/'/g, '"') // Convert single quotes to double quotes
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/"\s*:\s*/g, '": ') // Normalize property spacing
      .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
      .replace(/,\s*]/g, ']'); // Remove trailing commas before closing brackets
    
    // Try to parse, if it fails, use eval as fallback (safer in controlled environment)
    let markets;
    try {
      markets = JSON.parse(marketsString);
    } catch (parseError) {
      console.log('⚠️  JSON.parse failed, attempting alternative parsing...');
      
      // Create a safe evaluation context
      const originalMarketsString = marketsMatch[1];
      
      // Use Function constructor for safer evaluation than eval
      const marketsFunction = new Function('return ' + originalMarketsString);
      markets = marketsFunction();
    }
    
    console.log(`✅ Successfully parsed ${markets.length} markets from TypeScript file`);
    
    return markets;
  } catch (error) {
    console.error('❌ Error extracting markets data:', error.message);
    
    // Fallback: Try to require the compiled version or use a simpler approach
    console.log('🔄 Attempting fallback parsing method...');
    try {
      // Alternative: Read and manually parse the structure
      return parseMarketsManually();
    } catch (fallbackError) {
      console.error('❌ Fallback parsing also failed:', fallbackError.message);
      throw new Error(`Could not parse markets data: ${error.message}`);
    }
  }
}

// Manual parsing fallback
function parseMarketsManually() {
  const fileContent = fs.readFileSync(marketsDataPath, 'utf8');
  
  // Find individual market objects
  const marketMatches = fileContent.match(/{\s*id:\s*"[^"]+",[\s\S]*?aicontext:\s*"[^"]*"\s*}/g);
  
  if (!marketMatches) {
    throw new Error('Could not find market objects in file');
  }
  
  const markets = [];
  
  for (const marketString of marketMatches) {
    try {
      // Clean up each market object
      let cleanMarket = marketString
        .replace(/(\w+):/g, '"$1":')
        .replace(/'/g, '"')
        .replace(/,(\s*})/g, '$1');
      
      const market = JSON.parse(cleanMarket);
      markets.push(market);
    } catch (error) {
      console.warn('⚠️  Skipping malformed market object');
    }
  }
  
  console.log(`✅ Manually parsed ${markets.length} markets`);
  return markets;
}

// Transform market data for Firebase collections
function transformMarketForFirebase(market) {
  const timestamp = new Date();
  
  const baseData = {
    title: market.title,
    description: market.description,
    volume: market.volume,
    categories: market.categories,
    iconName: market.iconName,
    address: market.address,
    startDate: market.startDate,
    endDate: market.endDate,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  // Full market data (for detailed views and AI context)
  const fullData = {
    ...baseData,
    market_mean: market.market_mean,
    market_mean_min: market.market_mean_min,
    market_mean_max: market.market_mean_max,
    market_standard_deviation: market.market_standard_deviation,
    market_standard_deviation_min: market.market_standard_deviation_min,
    market_standard_deviation_max: market.market_standard_deviation_max,
    min_sigma: market.min_sigma,
    Lambda: market.Lambda,
    peak_p: market.peak_p,
    headroom: market.headroom,
    s: market.s,
    mu_per_one: market.mu_per_one,
    sigma_per_one: market.sigma_per_one,
    x_axis_field_name: market.x_axis_field_name,
    x_axis_short_form: market.x_axis_short_form,
    aicontext: market.aicontext || "" // AI context for chat functionality
  };

  // Minimal market data (for list views and performance)
  const minimalData = {
    ...baseData,
    // Include essential fields for search and filtering
    market_mean: market.market_mean,
    market_standard_deviation: market.market_standard_deviation,
    x_axis_field_name: market.x_axis_field_name,
    x_axis_short_form: market.x_axis_short_form
  };

  return { fullData, minimalData };
}

// Validate market data structure
function validateMarket(market) {
  const requiredFields = [
    'id', 'title', 'description', 'volume', 'categories', 'iconName', 
    'address', 'startDate', 'endDate', 'market_mean', 'market_standard_deviation'
  ];
  
  for (const field of requiredFields) {
    if (market[field] === undefined || market[field] === null) {
      throw new Error(`Market ${market.id || 'unknown'} is missing required field: ${field}`);
    }
  }
  
  // Validate categories array
  if (!Array.isArray(market.categories) || market.categories.length === 0) {
    throw new Error(`Market ${market.id} has invalid categories`);
  }
  
  return true;
}

// Seed the database with latest market data
async function seedLatestMarkets() {
  try {
    console.log('🚀 Starting comprehensive database seeding...');
    
    // Check Firebase connection
    if (!db) {
      throw new Error('Firebase database not available. Check your configuration.');
    }
    
    // Extract markets data from TypeScript file
    const markets = extractMarketsFromTS();
    console.log(`📊 Found ${markets.length} markets to process`);

    // Validate all markets
    console.log('🔍 Validating market data...');
    for (const market of markets) {
      validateMarket(market);
    }
    console.log('✅ All markets validated successfully');

    // Clear existing data
    console.log('🧹 Clearing existing collections...');
    
    const [fullSnapshot, minimalSnapshot] = await Promise.all([
      db.collection(COLLECTIONS.MARKETS_FULL).get(),
      db.collection(COLLECTIONS.MARKETS_MINIMAL).get()
    ]);
    
    // Delete existing documents in batches
    const deleteBatch = db.batch();
    
    fullSnapshot.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    
    minimalSnapshot.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    
    if (fullSnapshot.size > 0 || minimalSnapshot.size > 0) {
      await deleteBatch.commit();
      console.log(`✅ Cleared ${fullSnapshot.size + minimalSnapshot.size} existing documents`);
    }

    // Seed new data in batches (Firestore batch limit is 500 operations)
    console.log('📝 Seeding new market data...');
    
    const batchSize = 200; // Conservative batch size
    const batches = [];
    
    for (let i = 0; i < markets.length; i += batchSize) {
      const batch = markets.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    let totalSeeded = 0;
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const fullBatch = db.batch();
      const minimalBatch = db.batch();
      
      for (const market of batch) {
        const { fullData, minimalData } = transformMarketForFirebase(market);
        
        // Use the market ID as document ID for consistent referencing
        const fullRef = db.collection(COLLECTIONS.MARKETS_FULL).doc(market.id);
        const minimalRef = db.collection(COLLECTIONS.MARKETS_MINIMAL).doc(market.id);
        
        fullBatch.set(fullRef, fullData);
        minimalBatch.set(minimalRef, minimalData);
      }
      
      await Promise.all([fullBatch.commit(), minimalBatch.commit()]);
      totalSeeded += batch.length;
      
      console.log(`📦 Batch ${batchIndex + 1}/${batches.length} completed (${totalSeeded}/${markets.length} markets)`);
    }
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Total markets seeded: ${totalSeeded}`);
    console.log(`🗂️  Collections updated:`);
    console.log(`   - ${COLLECTIONS.MARKETS_FULL} (complete market data with AI context)`);
    console.log(`   - ${COLLECTIONS.MARKETS_MINIMAL} (optimized for list views)`);
    
    // Verify the seeded data
    console.log('🔍 Verifying seeded data...');
    const [fullCount, minimalCount] = await Promise.all([
      db.collection(COLLECTIONS.MARKETS_FULL).count().get(),
      db.collection(COLLECTIONS.MARKETS_MINIMAL).count().get()
    ]);
    
    console.log(`📈 Verification results:`);
    console.log(`   - Full markets collection: ${fullCount.data().count} documents`);
    console.log(`   - Minimal markets collection: ${minimalCount.data().count} documents`);
    
    if (fullCount.data().count !== markets.length || minimalCount.data().count !== markets.length) {
      console.warn('⚠️  Document count mismatch detected!');
    } else {
      console.log('✅ All documents verified successfully');
    }
    
    // Sample a few markets to verify structure
    console.log('🔬 Sampling market data structure...');
    const sampleMarket = await db.collection(COLLECTIONS.MARKETS_FULL).doc('1').get();
    if (sampleMarket.exists) {
      const data = sampleMarket.data();
      console.log(`📋 Sample market (ID: 1):`);
      console.log(`   - Title: ${data.title}`);
      console.log(`   - Categories: ${data.categories.join(', ')}`);
      console.log(`   - Volume: $${data.volume.toLocaleString()}`);
      console.log(`   - AI Context: ${data.aicontext ? 'Present' : 'Missing'}`);
      console.log(`   - Distribution params: mean=${data.market_mean}, std=${data.market_standard_deviation}`);
    }
    
  } catch (error) {
    console.error('💥 Error during database seeding:', error);
    throw error;
  }
}

// Create categories collection based on market data
async function seedCategories() {
  try {
    console.log('📂 Creating categories collection...');
    
    const markets = extractMarketsFromTS();
    const categorySet = new Set();
    
    // Extract all unique categories
    markets.forEach(market => {
      market.categories.forEach(category => {
        categorySet.add(category);
      });
    });
    
    const categories = Array.from(categorySet).sort();
    
    // Create categories document
    const categoriesRef = db.collection(COLLECTIONS.CATEGORIES).doc('all');
    await categoriesRef.set({
      categories: categories,
      count: categories.length,
      updatedAt: new Date()
    });
    
    console.log(`✅ Categories collection created with ${categories.length} categories:`);
    console.log(`   ${categories.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error creating categories:', error);
    throw error;
  }
}

// Main execution function
async function main() {
  try {
    await seedLatestMarkets();
    await seedCategories();
    
    console.log('🎉 Complete database seeding finished successfully!');
    console.log('🔗 Your Firebase database is now synchronized with the latest market data');
    
  } catch (error) {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('✨ Database is ready for production!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { 
  seedLatestMarkets, 
  seedCategories, 
  extractMarketsFromTS,
  transformMarketForFirebase,
  validateMarket
};
