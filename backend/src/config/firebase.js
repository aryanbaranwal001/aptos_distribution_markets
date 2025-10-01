const admin = require('firebase-admin');
require('dotenv').config();

const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log('Firebase Admin SDK already initialized');
      return;
    }

    let serviceAccount = null;


    // MAIN: get complete JSON from environment variable
    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        console.log('🔑 Loaded Firebase credentials from JSON environment variable');
      } catch (parseError) {
        console.warn('⚠️  Could not parse Firebase key from environment:', parseError.message);
      }
    }

    // Check if we have Firebase credentials
    if (!serviceAccount) {
      console.warn('⚠️  Firebase credentials not found. WHAT THE FUCK IS Running in mock mode for development.');
      console.warn('   Configure Firebase using one of these methods:');
      console.warn('   1. Individual env vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
      console.warn('   2. JSON env var: FIREBASE_SERVICE_ACCOUNT_KEY');
      console.warn('   3. File path: FIREBASE_SERVICE_ACCOUNT_KEY_FILE');
      console.warn('---------------------------------------------------');
      return;
    }
    
    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`🔥 Connected to project: ${serviceAccount.project_id}`);
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    console.warn('⚠️  Running in mock mode for development.');
  }
};

// Initialize Firebase
initializeFirebase();

// Get Firestore instance (with fallback for mock mode)
let db = null;
try {
  if (admin.apps.length > 0) {
    db = admin.firestore();
  }
} catch (error) {
  console.warn('⚠️  Firestore not available, using mock mode');
}

// Collection names
const COLLECTIONS = {
  MARKETS_FULL: 'markets_full',
  MARKETS_MINIMAL: 'markets_minimal',
  CATEGORIES: 'categories'
};

module.exports = {
  db,
  admin,
  COLLECTIONS
};
