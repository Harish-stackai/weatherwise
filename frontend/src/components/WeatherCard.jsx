import React, { useState } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Gauge,
  Eye,
  Compass,
  Sunrise,
  Sunset,
  ShieldCheck,
  Heart,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import confetti from 'canvas-confetti';

export default function WeatherCard({ data, onRefresh, unit = 'C' }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSavingFav, setIsSavingFav] = useState(false);
  const [favSaved, setFavSaved] = useState(false);

  if (!data || !data.weather) return null;

  const { city, country, coordinates, weather, hourly, timestamp } = data;

  const tempDisplay = (cVal) => {
    if (cVal === undefined || cVal === null) return '--';
    if (unit === 'F') return `${Math.round(((cVal * 9) / 5 + 32) * 10) / 10}°F`;
    return `${cVal}°C`;
  };

  const getWeatherIcon = (cond = '', iconCode = '') => {
    const c = cond.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain size={52} color="#38bdf8" />;
    if (c.includes('thunder') || c.includes('storm')) return <CloudLightning size={52} color="#f59e0b" />;
    if (c.includes('cloud')) return <Cloud size={52} color="#94a3b8" />;
    return <Sun size={52} color="#f59e0b" className="animate-float" />;
  };

  const handleSaveFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsSavingFav(true);
    try {
      await api.post('/favorites', {
        name: city,
        country: country || '',
        lat: coordinates?.lat,
        lon: coordinates?.lon,
        customLabel: `${city} Central`,
      });
      setFavSaved(true);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => setFavSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to favorites');
    } finally {
      setIsSavingFav(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.75rem', position: 'relative' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a' }}>{city}</h2>
            {country && (
              <span style={{ fontSize: '0.85rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                {country}
              </span>
            )}
            {weather.isFallback && (
              <span className="badge badge-fallback" title="Fallback Mode: Active meteorological simulation">
                Resilient Mode
              </span>
            )}
            {!weather.isFallback && (
              <span className="badge badge-live">
                Live OpenWeather
              </span>
            )}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Coordinates: {coordinates?.lat?.toFixed(2)}°N, {coordinates?.lon?.toFixed(2)}°E • Updated {new Date(timestamp || Date.now()).toLocaleTimeString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={handleSaveFavorite}
            disabled={isSavingFav || favSaved}
            className="btn btn-secondary"
            style={{ borderColor: favSaved ? '#ef4444' : 'var(--border-color)', color: favSaved ? '#ef4444' : 'inherit' }}
            title="Save location to favorites"
          >
            <Heart size={15} fill={favSaved ? '#ef4444' : 'none'} color={favSaved ? '#ef4444' : 'currentColor'} />
            <span>{favSaved ? 'Saved!' : 'Favorite'}</span>
          </button>

          <button
            onClick={() => navigate(`/insights?city=${encodeURIComponent(city)}`)}
            className="btn btn-ai"
          >
            <Sparkles size={15} />
            <span>AI Insights</span>
          </button>

          {onRefresh && (
            <button onClick={onRefresh} className="btn btn-secondary" style={{ padding: '0.55rem' }} title="Refresh Weather Data">
              <RefreshCw size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Main Temperature & Condition Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div>
            {getWeatherIcon(weather.condition, weather.icon)}
          </div>
          <div>
            <div style={{ fontSize: '3.75rem', fontWeight: 800, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
              {tempDisplay(weather.temp)}
            </div>
            <div style={{ textTransform: 'capitalize', fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.35rem' }}>
              {weather.description || weather.condition}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              Feels like {tempDisplay(weather.feelsLike)} • High: {tempDisplay(weather.temp_max)} / Low: {tempDisplay(weather.temp_min)}
            </div>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Droplets size={22} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Humidity</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{weather.humidity}%</div>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Wind size={22} color="var(--accent-indigo)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wind Speed</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{weather.windSpeed} km/h</div>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sun size={22} color="var(--accent-amber)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UV Index</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{weather.uvIndex} of 11</div>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Gauge size={22} color="var(--accent-emerald)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Air Quality</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {weather.aqi} ({weather.aqiLabel || 'Good'})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Secondary Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <Gauge size={16} color="var(--text-muted)" />
          <span>Pressure: <strong>{weather.pressure} hPa</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <Eye size={16} color="var(--text-muted)" />
          <span>Visibility: <strong>{((weather.visibility || 10000) / 1000).toFixed(1)} km</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <Compass size={16} color="var(--text-muted)" />
          <span>Wind Direction: <strong>{weather.windDirection || 0}°</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <Sunrise size={16} color="var(--accent-amber)" />
          <span>Sunrise: <strong>{weather.sunrise || '06:12 AM'}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <Sunset size={16} color="var(--accent-rose)" />
          <span>Sunset: <strong>{weather.sunset || '06:48 PM'}</strong></span>
        </div>
      </div>

      {/* Hourly Timeline Mini Scroller */}
      {hourly && hourly.length > 0 && (
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
            24-Hour Atmospheric Trajectory
          </div>
          <div style={{ display: 'flex', gap: '0.85rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {hourly.map((h, i) => (
              <div
                key={i}
                className="glass-card"
                style={{
                  minWidth: '90px',
                  padding: '0.75rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.time}</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{tempDisplay(h.temp)}</div>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>{h.pop}% rain</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
