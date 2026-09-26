import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import WeatherCard from '../components/WeatherCard';
import { Search, MapPin, Sparkles, Navigation } from 'lucide-react';
import api from '../api/client';

export default function WeatherSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCity = searchParams.get('city') || 'London';

  const [query, setQuery] = useState(initialCity);
  const [suggestions, setSuggestions] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (targetCity) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/weather/current?city=${encodeURIComponent(targetCity)}`);
      setWeatherData(res.data.data);
      setSearchParams({ city: targetCity });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch weather data for this location.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(initialCity);
  }, []);

  // Handle autocomplete query
  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await api.get(`/weather/search?q=${encodeURIComponent(query)}`);
          setSuggestions(res.data.data || []);
        } catch (e) {}
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSelectCity = (cityName) => {
    setQuery(cityName);
    setSuggestions([]);
    fetchWeather(cityName);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSuggestions([]);
      fetchWeather(query.trim());
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
          Weather Search & Conditions
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Query any city across the globe for real-time telemetry, 24-hour trajectories, and atmospheric data.
        </p>

        {/* Search Bar with Autocomplete Suggestions */}
        <div style={{ position: 'relative', marginTop: '1.75rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                id="search-page-input"
                type="text"
                placeholder="Enter city name (e.g. Sydney, Berlin, Mumbai)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.75rem', height: '46px', fontSize: '0.95rem' }}
              />
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', height: '46px' }}>
              Search
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '105%',
                left: 0,
                right: 0,
                zIndex: 40,
                padding: '0.5rem',
                textAlign: 'left',
                maxHeight: '260px',
                overflowY: 'auto',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}
            >
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectCity(item.name)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={15} color="#2563eb" />
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({item.country})</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {item.lat?.toFixed(1)}°, {item.lon?.toFixed(1)}°
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto 2rem',
            padding: '0.85rem',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-sm)',
            color: '#b91c1c',
            textAlign: 'center',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-float" size={36} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <div>Ingesting atmospheric parameters...</div>
        </div>
      )}

      {!loading && weatherData && (
        <WeatherCard data={weatherData} onRefresh={() => fetchWeather(weatherData.city)} />
      )}
    </div>
  );
}
