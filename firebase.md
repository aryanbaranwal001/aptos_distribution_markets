# 🔥 Firebase Integration - Complete Documentation

## Overview

This document provides comprehensive documentation for the Firebase integration in the Aptos Distribution Markets platform. It covers architecture, implementation details, data structures, API patterns, and operational procedures.

## 🏗️ Architecture Overview

### System Components
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Express.js     │    │   Firestore     │
│   Frontend      │◄──►│   Backend API    │◄──►│   Database      │
│                 │    │                  │    │                 │
│ • React Hooks   │    │ • Caching Layer  │    │ • Real-time DB  │
│ • State Mgmt    │    │ • Rate Limiting  │    │ • Indexing      │
│ • Error Handling│    │ • Fallback Mode  │    │ • Batch Ops     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack
- **Database**: Google Firestore (NoSQL Document Database)
- **Backend**: Node.js + Express.js + Firebase Admin SDK
- **Frontend**: Next.js 15 + TypeScript + Custom API Service
- **Caching**: In-memory NodeCache with configurable TTL
- **Authentication**: Firebase Admin SDK with Service Account

## 🗄️ Database Structure

### Collections Overview

#### 1. `markets_full` Collection
**Purpose**: Complete market data for detailed views and AI integration
**Document Count**: 24 markets
**Use Cases**: Individual market pages, AI chat context, trading interfaces

**Document Structure**:
```javascript
{
  // Basic Information
  "id": "1",
  "title": "Will Aptos APT reach $8 by end of December 2025?",
  "description": "Distribution market on Aptos APT token price...",
  "volume": 1850000,
  "categories": ["trending", "crypto", "tech"],
  "iconName": "aptos.svg",
  "address": "0xa0bcdef1234567890abcdef...",
  "startDate": "2024-10-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z",
  
  // Distribution Parameters
  "market_mean": 12.5,
  "market_mean_min": 8.0,
  "market_mean_max": 17.0,
  "market_standard_deviation": 3.2,
  "market_standard_deviation_min": 2.0,
  "market_standard_deviation_max": 4.4,
  "min_sigma": 2.0,
  "Lambda": 0.95,
  "peak_p": 0.55,
  "headroom": 0.45,
  "s": 1.15,
  "mu_per_one": 0.83,
  "sigma_per_one": 0.21,
  
  // Chart Configuration
  "x_axis_field_name": "APT Price (USD)",
  "x_axis_short_form": "APT Price",
  
  // AI Integration
  "aicontext": "This is a distribution market for Aptos (APT) token...",
  
  // Metadata
  "createdAt": "2025-01-01T12:00:00.000Z",
  "updatedAt": "2025-01-01T12:00:00.000Z"
}
```

#### 2. `markets_minimal` Collection
**Purpose**: Optimized data for list views and performance
**Document Count**: 24 markets
**Use Cases**: Market grids, category pages, search results

**Document Structure**:
```javascript
{
  // Essential Information Only
  "id": "1",
  "title": "Will Aptos APT reach $8 by end of December 2025?",
  "description": "Distribution market on Aptos APT token price...",
  "volume": 1850000,
  "categories": ["trending", "crypto", "tech"],
  "iconName": "aptos.svg",
  "address": "0xa0bcdef1234567890abcdef...",
  "startDate": "2024-10-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z",
  
  // Key Distribution Data
  "market_mean": 12.5,
  "market_standard_deviation": 3.2,
  "x_axis_field_name": "APT Price (USD)",
  "x_axis_short_form": "APT Price",
  
  // Metadata
  "createdAt": "2025-01-01T12:00:00.000Z",
  "updatedAt": "2025-01-01T12:00:00.000Z"
}
```

#### 3. `categories` Collection
**Purpose**: Category metadata and statistics
**Document Count**: 1 document (`all`)

**Document Structure**:
```javascript
{
  "categories": [
    "crypto", "earnings", "economy", "elections", 
    "geopolitics", "new", "politics", "sports", 
    "tech", "trending", "world"
  ],
  "count": 11,
  "updatedAt": "2025-01-01T12:00:00.000Z"
}
```

### Market Categories Distribution
- **trending**: 7 markets
- **crypto**: 4 markets  
- **politics**: 3 markets
- **sports**: 3 markets
- **tech**: 10 markets
- **economy**: 4 markets
- **world**: 8 markets
- **elections**: 3 markets
- **geopolitics**: 4 markets
- **earnings**: 3 markets
- **new**: 2 markets

## ⚙️ Backend Implementation

### Firebase Configuration (`/backend/src/config/firebase.js`)

**Flexible Configuration with Multiple Methods:**

```javascript
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


    // Try complete JSON from environment variable
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
```

**Configuration Priority Order:**
1. **Individual Environment Variables** (Most Flexible) - Recommended for production
2. **Complete JSON Environment Variable** - Good for containerized deployments  
3. **Service Account File** - Fallback for local development only

### Environment Configuration

#### Backend `.env` Variables

**Complete JSON in Environment Variable**
```bash
FIREBASE_SERVICE_ACCOUNT_KEY=
PORT=5000
NODE_ENV=development
API_BASE_URL=/api/v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
OPENAI_API_KEY=
```


#### Frontend `.env.local` Variables
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://10.81.15.31:5000/api/v1

```
