import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import WeatherCard from '../components/WeatherCard';
import ForecastChart from '../components/ForecastChart';
import AIInsightCard from '../components/AIInsightCard';
import {
  Sparkles,
  Search,
  Heart,
  Calendar,
  Compass,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import api from '../api/client';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [city, setCity] = useState(user?.defaultLocation?.city || 'Tokyo');
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (targetCity) => {
    setLoading(true);
    try {
      // 1. Current Weather
      const weatherRes = await api.get(`/weather/current?city=${encodeURIComponent(targetCity)}`);
      setWeatherData(weatherRes.data.data);

      // 2. 7-Day Forecast
      const forecastRes = await api.get(`/weather/forecast?city=${encodeURIComponent(targetCity)}&days=7`);
      setForecastData(forecastRes.data.data);

      // 3. AI Insights
      const aiRes = await api.post('/ai/insights', { city: targetCity });
      setAiInsight(aiRes.data.data);

      // 4. Favorites (if user logged in)
      if (user) {
        const favRes = await api.get('/favorites');
        setFavorites(favRes.data.data || []);
      }
    } catch (err) {
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(city);
  }, [city]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCity(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1380px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Top Greeting & Search Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>•</span>
            <span style={{ color: '#475569', fontWeight: 500 }}>Weather Dashboard</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.2rem', color: '#0f172a' }}>
            Hello, <span>{user?.name || 'Explorer'}</span>
          </h1>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', minWidth: '320px' }}>
          <input
            type="text"
            placeholder="Change location (e.g. Dubai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ height: '42px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.25rem', height: '42px' }}>
            <Search size={16} />
          </button>
        </form>
      </div>

      {loading && !weatherData ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-float" size={32} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <div>Synthesizing live atmospheric telemetry...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Main Weather Card */}
          {weatherData && (
            <WeatherCard
              data={weatherData}
              onRefresh={() => fetchDashboardData(city)}
              unit={user?.preferences?.temperatureUnit || 'C'}
            />
          )}

          {/* Two Column Section: Forecast Chart & AI Insight */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
            {/* Forecast Chart Panel */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} color="var(--accent-amber)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>7-Day Atmospheric Trend</h3>
                </div>
                <button
                  onClick={() => navigate(`/forecast?city=${encodeURIComponent(city)}`)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                >
                  Full Forecast <ArrowUpRight size={14} />
                </button>
              </div>

              {forecastData && (
                <ForecastChart
                  forecastData={forecastData}
                  unit={user?.preferences?.temperatureUnit || 'C'}
                />
              )}
            </div>

            {/* Saved Favorites Mini Panel */}
            {user && favorites.length > 0 && (
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Heart size={20} color="var(--accent-rose)" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Pinned & Saved Cities</h3>
                  </div>
                  <button
                    onClick={() => navigate('/favorites')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  >
                    Manage ({favorites.length}) <ArrowUpRight size={14} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                  {favorites.slice(0, 4).map((fav) => (
                    <div
                      key={fav._id}
                      className="glass-card"
                      onClick={() => setCity(fav.name)}
                      style={{
                        cursor: 'pointer',
                        padding: '1rem',
                        borderLeft: fav.isPinned ? '3px solid var(--accent-rose)' : '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{fav.name}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fav.customLabel || fav.country}</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--accent-cyan)' }}>
                        {fav.currentWeather?.temp !== undefined ? `${fav.currentWeather.temp}°C` : '--'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {fav.currentWeather?.condition || 'Clear'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gemini AI Insight Card Full Width */}
          {aiInsight && (
            <AIInsightCard
              insightData={aiInsight}
              city={city}
              onRefreshInsight={() => fetchDashboardData(city)}
            />
          )}
        </div>
      )}
    </div>
  );
}
