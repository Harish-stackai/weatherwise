const axios = require('axios');
const http = require('http');
const app = require('../server');

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log('==================================================');
  console.log('🧪 Starting WeatherWise Automated Integration Tests');
  console.log(`Target: ${BASE_URL}`);
  console.log('==================================================\n');

  let serverInstance;
  // If server is not running, start it
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 1000 });
  } catch (e) {
    console.log('Backend server not detected on port 5000. Launching in-process server for tests...');
    await new Promise((resolve) => {
      serverInstance = app.listen(5000, () => {
        console.log('Test server listening on port 5000');
        // Give DB connection & demo seeds 2 seconds
        setTimeout(resolve, 2000);
      });
    });
  }

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Reason: ${err.response?.data?.message || err.message}`);
      failed++;
    }
  };

  let userToken = '';
  let adminToken = '';
  let sampleFavId = '';

  // 1. Health check
  await test('GET /health - System Operational Check', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.data.status !== 'ONLINE') throw new Error('Status not ONLINE');
  });

  // 2. Auth Seed
  await test('POST /auth/seed - Seed Demo Credentials', async () => {
    const res = await axios.post(`${BASE_URL}/auth/seed`);
    if (!res.data.success) throw new Error('Failed to seed demo users');
  });

  // 3. User Login
  await test('POST /auth/login - Regular User Login', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user@weatherwise.com',
      password: 'UserPassword123!',
    });
    if (!res.data.token) throw new Error('No token returned');
    userToken = res.data.token;
  });

  // 4. Admin Login
  await test('POST /auth/login - Admin Login', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@weatherwise.com',
      password: 'AdminPassword123!',
    });
    if (!res.data.token || res.data.user.role !== 'admin') throw new Error('Admin role missing');
    adminToken = res.data.token;
  });

  // 5. User Profile Check
  await test('GET /auth/me - Verify Token & Profile', async () => {
    const res = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (res.data.user.email !== 'user@weatherwise.com') throw new Error('User email mismatch');
  });

  // 6. Current Weather with Resilient Fallback
  await test('GET /weather/current?city=Tokyo - Fetch Current Weather', async () => {
    const res = await axios.get(`${BASE_URL}/weather/current?city=Tokyo`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (!res.data.data.city || res.data.data.weather.temp === undefined) {
      throw new Error('Weather payload invalid');
    }
  });

  // 7. Multi-Day Forecast
  await test('GET /weather/forecast?city=London&days=7 - Fetch Forecast', async () => {
    const res = await axios.get(`${BASE_URL}/weather/forecast?city=London&days=7`);
    if (!res.data.data.daily || res.data.data.daily.length < 5) {
      throw new Error('Forecast days mismatch');
    }
  });

  // 8. City Search Autocomplete
  await test('GET /weather/search?q=lon - Autocomplete Search', async () => {
    const res = await axios.get(`${BASE_URL}/weather/search?q=lon`);
    if (!Array.isArray(res.data.data) || res.data.data.length === 0) {
      throw new Error('Search did not return matches');
    }
  });

  // 9. AI Weather Insights Generation
  await test('POST /ai/insights - Generate Gemini Weather Summary & Recommendations', async () => {
    const res = await axios.post(
      `${BASE_URL}/ai/insights`,
      { city: 'Tokyo' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (!res.data.data.summary || !res.data.data.recommendations.clothing) {
      throw new Error('AI recommendations structure invalid');
    }
  });

  // 10. AI Weather Assistant Q&A
  await test('POST /ai/ask - Weather Assistant Interaction', async () => {
    const res = await axios.post(`${BASE_URL}/ai/ask`, {
      city: 'Tokyo',
      question: 'Should I carry an umbrella today?',
    });
    if (!res.data.answer) throw new Error('No answer from weather assistant');
  });

  // 11. AI Recommendations Endpoint Alias
  await test('POST /ai/recommendations - Generate Recommendations via Alias', async () => {
    const res = await axios.post(
      `${BASE_URL}/ai/recommendations`,
      { city: 'Paris' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (!res.data.data.summary || !res.data.data.recommendations) {
      throw new Error('Recommendations payload invalid');
    }
  });

  // 12. Add Favorite Location
  await test('POST /favorites - Add Favorite City', async () => {
    const res = await axios.post(
      `${BASE_URL}/favorites`,
      { name: 'Tokyo', customLabel: 'Tokyo Headquarters', notes: 'Frequent business travel' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (!res.data.data._id) throw new Error('Favorite not created');
    sampleFavId = res.data.data._id;
  });

  // 13. Locations Endpoint (Alias)
  await test('POST /locations - Add Location via /api/locations', async () => {
    const res = await axios.post(
      `${BASE_URL}/locations`,
      { city: 'Sydney', country: 'AU', customLabel: 'Sydney Office' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (!res.data.data._id) throw new Error('Location not created');
  });

  await test('GET /locations - List Locations via /api/locations', async () => {
    const res = await axios.get(`${BASE_URL}/locations`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (!Array.isArray(res.data.data) || res.data.data.length < 2) {
      throw new Error('Locations list empty');
    }
  });

  // 14. Get Favorites with Live Weather
  await test('GET /favorites - List Favorites with Weather Snapshot', async () => {
    const res = await axios.get(`${BASE_URL}/favorites`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (!Array.isArray(res.data.data) || res.data.data.length === 0) {
      throw new Error('Favorites list empty');
    }
  });

  // 13. Weather History
  await test('GET /history - Search History Audit', async () => {
    const res = await axios.get(`${BASE_URL}/history`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (res.data.total === undefined) throw new Error('History list empty');
  });

  // 14. Admin Statistics
  await test('GET /admin/stats - Admin Dashboard Metrics (Protected RBAC)', async () => {
    const res = await axios.get(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.data.data.totalUsers === undefined) throw new Error('Stats payload invalid');
  });

  // 15. Admin System Health
  await test('GET /admin/health - Diagnostics & Fallback State', async () => {
    const res = await axios.get(`${BASE_URL}/admin/health`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.data.status !== 'OPERATIONAL') throw new Error('Health check not OPERATIONAL');
  });

  // 16. Admin RBAC Protection Verification
  await test('GET /admin/stats - Reject Non-Admin User (403 Forbidden)', async () => {
    try {
      await axios.get(`${BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      throw new Error('Non-admin user was granted access');
    } catch (err) {
      if (err.response?.status !== 403) throw err;
    }
  });

  console.log('\n==================================================');
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================\n');

  if (serverInstance) {
    serverInstance.close();
  }
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
