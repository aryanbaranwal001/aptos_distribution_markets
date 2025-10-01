const { db, COLLECTIONS } = require('../src/config/firebase');
const path = require('path');
const fs = require('fs');

// First, let's create a JSON version of the markets data
function createMarketsJSON() {
  const marketsPath = path.join(__dirname, '../../frontend/src/data/markets.ts');
  const outputPath = path.join(__dirname, 'markets.json');
  
  try {
    console.log('📖 Reading TypeScript file...');
    const content = fs.readFileSync(marketsPath, 'utf8');
    
    // Extract just the markets array content
    const arrayMatch = content.match(/export const markets: Market\[\] = (\[[\s\S]*?\]);/);
    if (!arrayMatch) {
      throw new Error('Could not find markets array');
    }
    
    // Use Node.js vm module for safe evaluation
    const vm = require('vm');
    const context = vm.createContext({});
    
    // Evaluate the array in the safe context
    const markets = vm.runInContext(`(${arrayMatch[1]})`, context);
    
    // Write to JSON file
    fs.writeFileSync(outputPath, JSON.stringify(markets, null, 2));
    console.log(`✅ Created markets.json with ${markets.length} markets`);
    
    return markets;
  } catch (error) {
    console.error('❌ Error creating JSON:', error.message);
    throw error;
  }
}

// Load markets from JSON file or create it
function loadMarkets() {
  const jsonPath = path.join(__dirname, 'markets.json');
  
  try {
    // Try to load existing JSON file
    if (fs.existsSync(jsonPath)) {
      console.log('📄 Loading existing markets.json...');
      const content = fs.readFileSync(jsonPath, 'utf8');
      return JSON.parse(content);
    } else {
      console.log('📝 Creating new markets.json from TypeScript...');
      return createMarketsJSON();
    }
  } catch (error) {
    console.error('❌ Error loading markets:', error.message);
    throw error;
  }
}

// Transform market data for Firebase
function transformMarket(market) {
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
    aicontext: market.aicontext || ""
  };

  const minimalData = {
    ...baseData,
    market_mean: market.market_mean,
    market_standard_deviation: market.market_standard_deviation,
    x_axis_field_name: market.x_axis_field_name,
    x_axis_short_form: market.x_axis_short_form
  };

  return { fullData, minimalData };
}

// Main seeding function
async function seedFromJSON() {
  try {
    console.log('🚀 Starting Firebase seeding from JSON...');
    
    if (!db) {
      throw new Error('Firebase not available');
    }
    
    // Load markets data
    const markets = loadMarkets();
    console.log(`📊 Loaded ${markets.length} markets`);
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    const [fullDocs, minimalDocs] = await Promise.all([
      db.collection(COLLECTIONS.MARKETS_FULL).get(),
      db.collection(COLLECTIONS.MARKETS_MINIMAL).get()
    ]);
    
    const batch = db.batch();
    fullDocs.forEach(doc => batch.delete(doc.ref));
    minimalDocs.forEach(doc => batch.delete(doc.ref));
    
    if (fullDocs.size > 0 || minimalDocs.size > 0) {
      await batch.commit();
      console.log(`✅ Cleared ${fullDocs.size + minimalDocs.size} documents`);
    }
    
    // Seed new data
    console.log('📝 Seeding new data...');
    const fullBatch = db.batch();
    const minimalBatch = db.batch();
    
    for (const market of markets) {
      const { fullData, minimalData } = transformMarket(market);
      
      const fullRef = db.collection(COLLECTIONS.MARKETS_FULL).doc(market.id);
      const minimalRef = db.collection(COLLECTIONS.MARKETS_MINIMAL).doc(market.id);
      
      fullBatch.set(fullRef, fullData);
      minimalBatch.set(minimalRef, minimalData);
    }
    
    await Promise.all([fullBatch.commit(), minimalBatch.commit()]);
    
    console.log('✅ Seeding completed!');
    console.log(`📊 Seeded ${markets.length} markets to both collections`);
    
    // Verify
    const [fullCount, minimalCount] = await Promise.all([
      db.collection(COLLECTIONS.MARKETS_FULL).count().get(),
      db.collection(COLLECTIONS.MARKETS_MINIMAL).count().get()
    ]);
    
    console.log(`🔍 Verification:`);
    console.log(`   - Full: ${fullCount.data().count} documents`);
    console.log(`   - Minimal: ${minimalCount.data().count} documents`);
    
    // Test a sample
    const sample = await db.collection(COLLECTIONS.MARKETS_FULL).doc('1').get();
    if (sample.exists) {
      const data = sample.data();
      console.log(`📋 Sample market: "${data.title}"`);
      console.log(`   - Volume: $${data.volume.toLocaleString()}`);
      console.log(`   - Categories: ${data.categories.join(', ')}`);
      console.log(`   - AI Context: ${data.aicontext ? 'Present' : 'Missing'}`);
    }
    
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    throw error;
  }
}

// Create categories collection
async function seedCategories() {
  try {
    const markets = loadMarkets();
    const categories = [...new Set(markets.flatMap(m => m.categories))].sort();
    
    await db.collection(COLLECTIONS.CATEGORIES).doc('all').set({
      categories,
      count: categories.length,
      updatedAt: new Date()
    });
    
    console.log(`✅ Categories: ${categories.join(', ')}`);
  } catch (error) {
    console.error('❌ Categories seeding failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await seedFromJSON();
    await seedCategories();
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedFromJSON, seedCategories, loadMarkets };
