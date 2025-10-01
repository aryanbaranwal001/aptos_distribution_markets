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

    // Method 1: Try individual environment variables first (most flexible)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      try {
        serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
          token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
        };
        console.log('🔑 Loaded Firebase credentials from individual environment variables');
      } catch (envError) {
        console.warn('⚠️  Could not construct service account from individual env vars:', envError.message);
      }
    }

    // Method 2: Try complete JSON from environment variable
    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        console.log('🔑 Loaded Firebase credentials from JSON environment variable');
      } catch (parseError) {
        console.warn('⚠️  Could not parse Firebase key from environment:', parseError.message);
      }
    }

    // Method 3: Fallback to service account file (least preferred)
    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_KEY_FILE) {
      try {
        const fs = require('fs');
        const path = require('path');
        const keyPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_FILE);
        
        // Check if file exists before trying to read
        if (fs.existsSync(keyPath)) {
          serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
          console.log('📄 Loaded Firebase credentials from file');
        } else {
          console.warn('⚠️  Firebase service account file not found:', keyPath);
        }
      } catch (fileError) {
        console.warn('⚠️  Could not load Firebase key file:', fileError.message);
      }
    }

    // Check if we have Firebase credentials
    if (!serviceAccount) {
      console.warn('⚠️  Firebase credentials not found. Running in mock mode for development.');
      console.warn('   Configure Firebase using one of these methods:');
      console.warn('   1. Individual env vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
      console.warn('   2. JSON env var: FIREBASE_SERVICE_ACCOUNT_KEY');
      console.warn('   3. File path: FIREBASE_SERVICE_ACCOUNT_KEY_FILE');
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
