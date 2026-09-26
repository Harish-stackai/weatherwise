# AI WeatherWise - Intelligent Weather Platform & Gemini AI Insights

AI WeatherWise is an enterprise-grade, MERN-based intelligent meteorological platform designed to provide real-time weather metrics, multi-day forecasting, and natural language recommendations powered by **Google Gemini AI**.

---

## 🌟 Key Features

1. **Intelligent Weather Synthesis**
   - Ingestion of live temperature, humidity, wind velocity, atmospheric pressure, UV index, and Air Quality Index (AQI).
   - 7-day extended trend modeling with interactive Chart.js temperature variance graphs.
   - 24-hour hourly trajectory breakdowns.

2. **Google Gemini AI Integration**
   - Natural language weather summaries replacing cold numerical metrics with human insights.
   - Tailored lifestyle recommendations:
     - **Clothing & Wardrobe**: Outfit selection, layering strategies, and UV accessories.
     - **Travel Precautions**: Commute feasibility status (Favorable / Caution / Hazardous), road/air hazards.
     - **Activity Windows**: Best outdoor athletic time windows & indoor leisure alternatives.
     - **Severe Weather Risk**: Active meteorological watch, risk level, and emergency instructions.
   - **Interactive Weather Assistant**: Conversational Q&A to answer custom questions about travel or outdoor activities.

3. **Resilient Zero-Downtime Fallback Mode**
   - Continuous service availability without disruption. If external weather APIs or Gemini keys are missing, hit rate limits (429), or encounter network timeouts, a built-in atmospheric simulation engine seamlessly calculates deterministic, physically plausible meteorological parameters and AI summaries.

4. **Robust Security & Enterprise Architecture**
   - Stateless JWT authentication and bcrypt password hashing.
   - Role-Based Access Control (RBAC) separating Standard Users from System Administrators.
   - Express rate-limiting, Helmet security headers, Morgan request logging, and express-validator input sanitization.
   - In-memory NodeCache layer with TTL to prevent external API quota exhaustion.

5. **Administrative Console & Governance**
   - Real-time API telemetry logs tracking latency, endpoint hit volume, HTTP status codes, and fallback engagement rates.
   - User account management (promote/demote roles, suspend, or delete accounts).
   - Broadcast notification dispatcher delivering high-priority notices to all user drawers.
   - Database and cache telemetry diagnostics.

---

## 🏗️ Project Architecture (MVC)

```
weatherwise-api/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & Memory Server fallback
│   ├── controllers/
│   │   ├── adminController.js    # System KPIs, logs, broadcast alerts, user governance
│   │   ├── aiController.js       # Gemini summaries, recommendations, and conversational Q&A
│   │   ├── authController.js     # Register, login, getMe, updatePassword, demo seed
│   │   ├── favoriteController.js # Saved cities CRUD enriched with live weather
│   │   ├── historyController.js  # Search audit log, pagination, CSV/JSON export
│   │   ├── notificationController.js # User notifications and alert marks
│   │   ├── settingsController.js # Units, themes, AI models, custom API keys
│   │   ├── userController.js     # Profile management
│   │   └── weatherController.js  # Current weather, forecast, autocomplete search
│   ├── middleware/
│   │   ├── apiLogger.js          # Ingestion of API call telemetry
│   │   ├── auth.js               # JWT bearer verification and optionalAuth
│   │   ├── errorHandler.js       # Centralized error mapping and formatting
│   │   ├── rateLimiter.js        # Strict auth and general API rate limiting
│   │   ├── role.js               # Role-based access control (Admin route shield)
│   │   └── validator.js          # Express-validator error interceptor
│   ├── models/
│   │   ├── AIInsight.js          # Gemini insights and recommendation schemas
│   │   ├── ApiLog.js             # API request telemetry and latency logs
│   │   ├── FavoriteLocation.js   # Pinned cities and user notes
│   │   ├── Location.js           # Core Location entity matching ER diagram
│   │   ├── Notification.js       # Alerts and broadcast dispatches
│   │   ├── Settings.js           # User preferences, units, and custom API keys
│   │   ├── User.js               # User authentication entity with bcrypt pre-hooks
│   │   └── WeatherHistory.js     # User search query historical audit
│   ├── routes/                   # REST routing definitions
│   ├── services/
│   │   ├── cacheService.js       # NodeCache caching layer for weather and AI
│   │   ├── geminiService.js      # Google Gemini SDK integration & smart fallback
│   │   └── weatherService.js     # OpenWeatherMap integration & resilient simulation
│   ├── tests/
│   │   └── test-runner.js        # 19 automated integration test cases
│   ├── index.js                  # Entry point delegating to server.js
│   ├── server.js                 # Express server configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js         # Axios client with JWT interceptors
│   │   ├── components/           # Navbar, Footer, WeatherCard, ForecastChart, AIInsightCard, NotificationDrawer
│   │   ├── context/              # AuthContext, ThemeContext
│   │   ├── pages/                # Home, Login, Register, Dashboard, Search, Forecast, Insights, Favorites, History, Profile, Settings, Admin
│   │   ├── index.css             # Glassmorphic design system and CSS variables
│   │   ├── App.jsx               # React Router layout and notification poller
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🗄️ Database Schemas (Mongoose)

### 1. User Entity
- `_id`: ObjectId (Primary Key)
- `name`: String (Required, trimmed)
- `email`: String (Required, unique, indexed)
- `password`: String (Hashed with bcrypt, excluded from default queries)
- `role`: String (Enum: `['user', 'admin']`, Default: `'user'`)
- `defaultLocation`: Object `{ city, country, lat, lon }`
- `preferences`: Object `{ temperatureUnit, windSpeedUnit, theme }`

### 2. Location / FavoriteLocation Entity
- `_id`: ObjectId (Primary Key)
- `user`: ObjectId (Foreign Key -> User Collection)
- `city` / `name`: String (Required)
- `country`: String (Required)
- `lat`: Number, `lon`: Number
- `customLabel`: String, `notes`: String
- `createdAt`: Date (Default: `Date.now`)

### 3. AIInsight Entity
- `user`: ObjectId (Foreign Key -> User, Optional)
- `city`: String, `country`: String
- `summary`: String (Concise meteorological narrative)
- `recommendations`:
  - `travel`: `{ status, precautions, advice }`
  - `clothing`: `{ primary, layers, accessories }`
  - `activities`: `{ outdoor, indoor, bestTimeOfDay }`
  - `severeAlerts`: `{ isSevere, riskLevel, headline, instructions }`
- `source`: `'gemini-ai'` | `'smart-fallback-engine'`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or above recommended)
- npm (v8 or above)

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*Note: If no `MONGO_URI` is provided in `.env`, the system automatically initializes an embedded MongoDB in memory for zero-friction development!*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Demo User** | `user@weatherwise.com` | `UserPassword123!` |
| **Demo Admin** | `admin@weatherwise.com` | `AdminPassword123!` |

*(Both accounts can be pre-seeded automatically by clicking the **Demo User** / **Demo Admin** shortcut buttons on the Login page).*

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` - Create new user account.
- `POST /api/auth/login` - Authenticate user and receive JWT.
- `GET /api/auth/me` - Get authenticated profile context.
- `PUT /api/auth/updatepassword` - Change account password.
- `POST /api/auth/seed` - Seed demo user and admin credentials.

### Weather Telemetry
- `GET /api/weather/current?city={cityName}` - Real-time metrics with fallback & history logging.
- `GET /api/weather/forecast?city={cityName}&days=7` - 7-day multi-day trajectory.
- `GET /api/weather/search?q={query}` - City autocompletion suggestions.
- `GET /api/weather/analytics` - User personal query analytics.

### Google Gemini AI
- `POST /api/ai/insights` - Generate weather narrative & lifestyle recommendations.
- `POST /api/ai/recommendations` - Alias endpoint for AI recommendations.
- `POST /api/ai/ask` - Conversational meteorological assistant Q&A.
- `GET /api/ai/insights` - Retrieve saved past AI insights.

### Favorite Locations
- `GET /api/locations` or `GET /api/favorites` - Get favorite cities with live weather enrichment.
- `POST /api/locations` or `POST /api/favorites` - Save new location.
- `PUT /api/favorites/:id` - Update custom labels and notes.
- `DELETE /api/favorites/:id` - Remove location.

### Search History
- `GET /api/history` - Paginated query history with city filtering.
- `DELETE /api/history` - Clear entire search audit log.
- `GET /api/history/export?format=csv|json` - Export history file.

### Admin Portal (RBAC Protected)
- `GET /api/admin/stats` - Platform KPIs, response latencies, and fallback ratios.
- `GET /api/admin/users` - Paginated user management table.
- `PUT /api/admin/users/:id` - Toggle user roles and active/suspended status.
- `DELETE /api/admin/users/:id` - Delete user and cascade wipe associated data.
- `GET /api/admin/logs` - Live API telemetry logs.
- `POST /api/admin/broadcast` - Dispatch system notice to all users.
- `GET /api/admin/health` - Diagnostics and engine health.

---

## 🧪 Automated Testing

The backend includes a comprehensive 19-point integration test suite verifying health, authentication, weather fetching, AI generation, favorite locations, audit history, and RBAC security shielding:

```bash
cd backend
npm test
```

**Results:**
```
==================================================
🧪 Starting WeatherWise Automated Integration Tests
Target: http://localhost:5000/api
==================================================

  ✅ PASS: GET /health - System Operational Check
  ✅ PASS: POST /auth/seed - Seed Demo Credentials
  ✅ PASS: POST /auth/login - Regular User Login
  ✅ PASS: POST /auth/login - Admin Login
  ✅ PASS: GET /auth/me - Verify Token & Profile
  ✅ PASS: GET /weather/current?city=Tokyo - Fetch Current Weather
  ✅ PASS: GET /weather/forecast?city=London&days=7 - Fetch Forecast
  ✅ PASS: GET /weather/search?q=lon - Autocomplete Search
  ✅ PASS: POST /ai/insights - Generate Gemini Weather Summary & Recommendations
  ✅ PASS: POST /ai/ask - Weather Assistant Interaction
  ✅ PASS: POST /ai/recommendations - Generate Recommendations via Alias
  ✅ PASS: POST /favorites - Add Favorite City
  ✅ PASS: POST /locations - Add Location via /api/locations
  ✅ PASS: GET /locations - List Locations via /api/locations
  ✅ PASS: GET /favorites - List Favorites with Weather Snapshot
  ✅ PASS: GET /history - Search History Audit
  ✅ PASS: GET /admin/stats - Admin Dashboard Metrics (Protected RBAC)
  ✅ PASS: GET /admin/health - Diagnostics & Fallback State
  ✅ PASS: GET /admin/stats - Reject Non-Admin User (403 Forbidden)

==================================================
Summary: 19 Passed, 0 Failed
==================================================
```
