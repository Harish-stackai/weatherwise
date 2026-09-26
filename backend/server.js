const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { apiLogger } = require('./middleware/apiLogger');

// Load environment variables
dotenv.config();

// Connect to Database (auto memory server fallback if needed)
connectDB();

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Cross Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request metrics logger
app.use(apiLogger);

// Rate limiter for API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ONLINE',
    service: 'AI WeatherWise Enterprise API',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    features: [
      'JWT Authentication & RBAC',
      'Real-Time Weather with Resilient Fallback',
      'Google Gemini AI Weather Insights',
      'Lifestyle & Clothing Recommendations',
      'Severe Alert Preparedness',
      'Favorite Locations & History Management',
      'Administrative Analytics & API Monitoring',
    ],
  });
});

// Seed default users automatically
const { seedDemoUsers } = require('./controllers/authController');
setTimeout(() => {
  seedDemoUsers({}, { status: () => ({ json: () => {} }) }, () => {});
}, 1500);

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 WeatherWise API Server running on port ${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});

module.exports = app;
