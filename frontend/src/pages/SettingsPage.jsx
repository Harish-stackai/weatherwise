import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Sliders,
  Sparkles,
  Thermometer,
  Wind,
  Bell,
  Key,
  Shield,
  Check,
  Save,
} from 'lucide-react';
import api from '../api/client';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [temperatureUnit, setTemperatureUnit] = useState('C');
  const [windSpeedUnit, setWindSpeedUnit] = useState('kmh');
  const [aiModel, setAiModel] = useState('gemini-1.5-flash');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [severeAlerts, setSevereAlerts] = useState(true);
  const [customGeminiKey, setCustomGeminiKey] = useState('');
  const [customWeatherKey, setCustomWeatherKey] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        const s = res.data.data;
        if (s) {
          if (s.temperatureUnit) setTemperatureUnit(s.temperatureUnit);
          if (s.windSpeedUnit) setWindSpeedUnit(s.windSpeedUnit);
          if (s.aiModel) setAiModel(s.aiModel);
          if (s.theme) setTheme(s.theme);
          if (s.emailNotifications !== undefined) setEmailAlerts(s.emailNotifications);
          if (s.severeWeatherAlerts !== undefined) setSevereAlerts(s.severeWeatherAlerts);
          if (s.customGeminiKey) setCustomGeminiKey(s.customGeminiKey);
          if (s.customWeatherKey) setCustomWeatherKey(s.customWeatherKey);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveMsg('');
    try {
      await api.put('/settings', {
        temperatureUnit,
        windSpeedUnit,
        theme,
        aiModel,
        emailNotifications: emailAlerts,
        severeWeatherAlerts: severeAlerts,
        customGeminiKey,
        customWeatherKey,
      });
      setSaveMsg('Settings and API preferences saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg(err.response?.data?.message || 'Error updating settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', fontSize: '0.85rem' }}>
          <Sliders size={15} />
          <span>Application Configuration</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.2rem', color: '#0f172a' }}>
          Settings & Preferences
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Configure units, visual aesthetics, AI model preferences, and custom external API keys.
        </p>
      </div>

      {saveMsg && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#15803d',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Check size={16} /> {saveMsg}
        </div>
      )}

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Metric & Unit Settings */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Thermometer size={18} color="var(--accent-amber)" /> Units & Measurement Standard
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Temperature Scale
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setTemperatureUnit('C')}
                  className={`btn ${temperatureUnit === 'C' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  Celsius (°C)
                </button>
                <button
                  type="button"
                  onClick={() => setTemperatureUnit('F')}
                  className={`btn ${temperatureUnit === 'F' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Wind Velocity Standard
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setWindSpeedUnit('kmh')}
                  className={`btn ${windSpeedUnit === 'kmh' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  km/h
                </button>
                <button
                  type="button"
                  onClick={() => setWindSpeedUnit('mph')}
                  className={`btn ${windSpeedUnit === 'mph' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  mph
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Visual Theme & Ambiance
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div
              className="glass-card"
              onClick={() => setTheme('dark')}
              style={{
                cursor: 'pointer',
                borderColor: theme === 'dark' ? 'var(--accent-cyan)' : 'var(--border-color)',
                background: theme === 'dark' ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-card)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>🌌 Deep Cosmos (Dark)</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sleek dark glassmorphic aesthetics with cyan accents.</p>
            </div>

            <div
              className="glass-card"
              onClick={() => setTheme('cyber')}
              style={{
                cursor: 'pointer',
                borderColor: theme === 'cyber' ? 'var(--accent-rose)' : 'var(--border-color)',
                background: theme === 'cyber' ? 'rgba(244, 63, 94, 0.1)' : 'var(--bg-card)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>⚡ Cyberpunk Neon</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>High-contrast vivid neon violet and electric pink.</p>
            </div>

            <div
              className="glass-card"
              onClick={() => setTheme('light')}
              style={{
                cursor: 'pointer',
                borderColor: theme === 'light' ? 'var(--accent-blue)' : 'var(--border-color)',
                background: theme === 'light' ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-card)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>☀️ Crisp Daylight (Light)</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clean, high-legibility crisp daytime appearance.</p>
            </div>
          </div>
        </div>

        {/* Gemini AI Engine & API Keys */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-purple)" /> Google Gemini AI & External Keys
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Preferred Generative Model
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="input-field"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Fast & Responsive)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Meteorological Reasoning)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen Preview)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Custom Google Gemini API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  placeholder="Paste your Gemini API key (optional - fallback simulation enabled)"
                  value={customGeminiKey}
                  onChange={(e) => setCustomGeminiKey(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Key size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Free keys can be acquired in 30 seconds at Google AI Studio (aistudio.google.com).
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Custom OpenWeather API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  placeholder="Paste your OpenWeather API key (optional - fallback simulation enabled)"
                  value={customWeatherKey}
                  onChange={(e) => setCustomWeatherKey(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Key size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Alert Preferences */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="var(--accent-cyan)" /> Notification Controls
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={severeAlerts}
                onChange={(e) => setSevereAlerts(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Severe Meteorological Watch & Advisory Alerts</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receive alerts in your drawer when severe heatwaves, storms, or hazardous winds are identified.</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Daily Morning Atmospheric Briefing</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generate daily automated AI summaries for your default home city.</div>
              </div>
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.9rem', fontSize: '1rem' }}>
          <Save size={18} />
          <span>{loading ? 'Saving Preferences...' : 'Save All Preferences'}</span>
        </button>
      </form>
    </div>
  );
}
