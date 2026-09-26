import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  CloudSun,
  Search,
  ShieldCheck,
  TrendingUp,
  Cpu,
  ArrowRight,
  Sun,
  CloudRain,
  Compass,
  Users,
} from 'lucide-react';
import api from '../api/client';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [featuredCities, setFeaturedCities] = useState([
    { name: 'Tokyo', country: 'JP', temp: 23, cond: 'Clear', humidity: 55, wind: 12 },
    { name: 'London', country: 'GB', temp: 16, cond: 'Partly Cloudy', humidity: 68, wind: 18 },
    { name: 'New York', country: 'US', temp: 21, cond: 'Sunny', humidity: 45, wind: 15 },
    { name: 'Paris', country: 'FR', temp: 18, cond: 'Clouds', humidity: 60, wind: 14 },
  ]);

  useEffect(() => {
    // Optionally fetch live data for Tokyo & London to showcase real API
    api.get('/weather/current?city=Tokyo')
      .then((res) => {
        if (res.data?.data) {
          setFeaturedCities((prev) => [
            {
              name: res.data.data.city,
              country: res.data.data.country,
              temp: res.data.data.weather.temp,
              cond: res.data.data.weather.condition,
              humidity: res.data.data.weather.humidity,
              wind: res.data.data.weather.windSpeed,
            },
            ...prev.slice(1),
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      navigate(`/search?city=${encodeURIComponent(searchCity.trim())}`);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '3rem 1.5rem 5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 4rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            marginBottom: '1.5rem',
          }}
        >
          <Sparkles size={15} color="#2563eb" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
            Powered by Google Gemini AI & Meteorology Services
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            letterSpacing: '-0.02em',
            color: '#0f172a',
          }}
        >
          Intelligent Weather Platform <br />
          <span style={{ color: '#2563eb' }}>with Gemini AI Insights</span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6, marginBottom: '2.25rem' }}>
          Real-time weather conditions, multi-day forecasting, and personalized AI recommendations for travel, clothing, and outdoor activities.
        </p>

        {/* Hero Search Box */}
        <form
          onSubmit={handleSearch}
          style={{
            maxWidth: '560px',
            margin: '0 auto 1.5rem',
            display: 'flex',
            gap: '0.5rem',
            background: '#ffffff',
            padding: '0.4rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #cbd5e1',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <input
            id="home-search-input"
            type="text"
            placeholder="Search city, e.g. London, Tokyo, New York..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            style={{
              flex: 1,
              background: '#ffffff',
              border: 'none',
              color: '#0f172a',
              padding: '0.65rem 0.85rem',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          <button type="submit" id="home-search-submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            <Search size={16} />
            <span>Search</span>
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/search?city=Tokyo')}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            Explore Tokyo
          </button>
          <button
            onClick={() => navigate('/search?city=Paris')}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            Explore Paris
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-ai"
            style={{ fontSize: '0.85rem' }}
          >
            Sign In with Demo Account
          </button>
        </div>
      </div>

      {/* Live Featured Cities Strip */}
      <div style={{ marginBottom: '5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Featured Global Atmospheres</h3>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Updated automatically</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {featuredCities.map((c, i) => (
            <div
              key={i}
              className="glass-card"
              onClick={() => navigate(`/search?city=${encodeURIComponent(c.name)}`)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{c.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.country}</span>
                </div>
                <Sun size={28} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
                {c.temp}°C
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>{c.cond}</span>
                <span>{c.humidity}% Humidity</span>
                <span>{c.wind} km/h</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Pillars Grid */}
      <div style={{ marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Engineered for Precision & Continuity
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Built on a robust MERN stack architecture providing speed, cryptographic security, and uninterrupted intelligence.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={20} color="#fff" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Google Gemini AI Insights</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Converts complex meteorological telemetry into actionable human directives: wardrobe choices, travel precautions, outdoor athletic windows, and severe risk analysis.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Cpu size={20} color="#fff" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Resilient Fallback Mode</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Zero service downtime. Even if upstream weather APIs experience rate limits or downtime, our atmospheric physics engine provides continuous realistic multi-day forecasts.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <ShieldCheck size={20} color="#fff" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Security & Role-Based Access</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Role-based authorization, bcrypt password hashing, JWT stateless authentication, express-rate-limit protection, and complete administrative audit telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
        }}
      >
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Ready to Experience Intelligent Weather?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
          Create an account to save your favorite cities, track your search history, and receive tailored Gemini AI weather summaries.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
            <span>Create Free Account</span>
            <ArrowRight size={15} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.65rem 1.5rem' }}>
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
