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

    // Try to load service account from file first
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_FILE) {
      try {
        const fs = require('fs');
        const path = require('path');
        const keyPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_FILE);
        serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        console.log('📄 Loaded Firebase credentials from file');
      } catch (fileError) {
        console.warn('⚠️  Could not load Firebase key file:', fileError.message);
      }
    }

    // Fallback to environment variable
    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        console.log('🔑 Loaded Firebase credentials from environment variable');
      } catch (parseError) {
        console.warn('⚠️  Could not parse Firebase key from environment:', parseError.message);
      }
    }

    // Check if we have Firebase credentials
    if (!serviceAccount) {
      console.warn('⚠️  Firebase credentials not found. Running in mock mode for development.');
      console.warn('   Set FIREBASE_SERVICE_ACCOUNT_KEY_FILE or FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
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
