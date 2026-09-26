import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ForecastChart from '../components/ForecastChart';
import {
  Calendar,
  CloudSun,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  CloudLightning,
  Sparkles,
  Search,
} from 'lucide-react';
import api from '../api/client';

export default function ForecastPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || 'London';
  const [city, setCity] = useState(cityParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = async (cityName) => {
    setLoading(true);
    try {
      const res = await api.get(`/weather/forecast?city=${encodeURIComponent(cityName)}&days=7`);
      setForecastData(res.data.data);
      setSearchParams({ city: cityName });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(cityParam);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCity(searchQuery.trim());
      fetchForecast(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const getDayIcon = (cond = '') => {
    const c = cond.toLowerCase();
    if (c.includes('rain')) return <CloudRain size={28} color="#38bdf8" />;
    if (c.includes('thunder')) return <CloudLightning size={28} color="#f59e0b" />;
    if (c.includes('cloud')) return <CloudSun size={28} color="#94a3b8" />;
    return <Sun size={28} color="#f59e0b" />;
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header & City Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Calendar size={15} color="#2563eb" />
            <span>Multi-Day Meteorological Modeling</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.2rem', color: '#0f172a' }}>
            7-Day Forecast: <span>{forecastData?.city || city}</span>
          </h1>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Change city (e.g. Sydney)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ height: '42px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.25rem' }}>
            <Search size={16} />
          </button>
        </form>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-float" size={32} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <div>Synthesizing multi-model forecast trajectory...</div>
        </div>
      )}

      {!loading && forecastData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Chart Panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Temperature Trajectory & Thermal Variance
            </h3>
            <ForecastChart forecastData={forecastData} />
          </div>

          {/* Daily Cards Grid */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Day-by-Day Atmospheric Breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {forecastData.daily.map((day, i) => (
                <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{day.day}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{day.date}</span>
                    </div>
                    {getDayIcon(day.condition)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
                      {day.temp_max}°C
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      / {day.temp_min}°C
                    </div>
                  </div>

                  <div style={{ textTransform: 'capitalize', fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {day.description || day.condition}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '0.75rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Droplets size={14} color="var(--accent-cyan)" />
                      <span>{day.pop || 0}% rain</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Wind size={14} color="var(--accent-indigo)" />
                      <span>{day.windSpeed} km/h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
