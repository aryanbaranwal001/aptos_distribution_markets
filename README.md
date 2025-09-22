# Aptos Distribution Markets

A full-stack prediction/distribution markets platform built for the Aptos blockchain with Node.js backend and Next.js frontend.

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and Zustand state management
- **Backend**: Node.js + Express.js with Firestore database
- **Blockchain**: Aptos integration via @aptos-labs/ts-sdk and wallet adapters

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project (optional for development - mock mode available)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
   
   For development, the backend runs in mock mode without Firebase credentials.
   
   For production, configure these environment variables in `.env`:
   ```env
   # Firebase Configuration (Required for production)
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   API_BASE_URL=/api/v1
   CORS_ORIGIN=http://localhost:3000
   
   # Caching
   CACHE_TTL=300
   ENABLE_CACHE=true
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   The backend will run on `http://localhost:5000` in mock mode for development.

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   ```bash
   cp env.example .env.local
   ```
   
   Configure the API endpoint in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
   NODE_ENV=development
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:3000` (or next available port).

## 📡 API Endpoints

### Markets
- `GET /api/v1/markets` - Get markets with pagination, filtering, and sorting
- `GET /api/v1/markets/:id` - Get single market details
- `GET /api/v1/markets/search?q=query` - Search markets
- `GET /api/v1/markets/category/:category` - Get markets by category

### Health Check
- `GET /api/v1/health` - API health status

### Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `category` - Filter by category
- `sort` - Sort field (volume, date, title)
- `order` - Sort order (asc, desc)

## 🗄️ Database Structure

### Firestore Collections

#### `markets_full`
Complete market data with all statistical parameters for detailed views.

#### `markets_minimal`
Optimized market data for listing views with essential fields only.

### Mock Data
For development without Firebase, the backend uses mock data with sample Bitcoin and Election prediction markets.

## 🎨 Frontend Features

- **Market Grid**: Responsive grid layout with pagination
- **Search**: Real-time market search functionality
- **Categories**: Filter markets by category (crypto, politics, sports, etc.)
- **Individual Market Pages**: Detailed market views with distribution charts
- **Theming**: Multiple color themes (green, orange, coral)
- **Wallet Integration**: Aptos wallet connection ready
- **State Management**: Zustand with persistence

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev        # Start with nodemon
npm run start      # Production start
npm run lint       # ESLint
npm test          # Jest tests
```

### Frontend Development
```bash
cd frontend
npm run dev        # Next.js development server
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
```

### Database Seeding
To populate Firestore with sample data:
```bash
cd backend
node scripts/seedDatabase.js
```

## 🚀 Production Deployment

### Backend
1. Set up Firebase project and service account
2. Configure production environment variables
3. Deploy to your preferred platform (Vercel, Railway, etc.)

### Frontend
1. Update API base URL for production
2. Build and deploy to Vercel, Netlify, or similar

## 🔒 Security Features

- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Environment variable protection
- Error handling middleware

## 📊 Caching

- In-memory caching with configurable TTL
- Cache keys for different data types
- Automatic cache invalidation
- Development cache disable option

## 🧪 Testing

The project includes:
- API endpoint testing
- Mock data for development
- Error handling validation
- Integration testing setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.