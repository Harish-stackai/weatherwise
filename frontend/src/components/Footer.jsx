import React from 'react';
import { CloudSun, Sparkles, ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        padding: '2.5rem 1.5rem 1.75rem',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CloudSun size={16} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                WeatherWise AI
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Meteorological intelligence platform with real-time conditions, multi-day forecasting, and AI-powered recommendations.
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text-main)' }}>Platform Features</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li>• Real-Time Hyperlocal Meteorological Ingestion</li>
              <li>• Google Gemini AI Daily Atmospheric Briefings</li>
              <li>• Travel Precautions & Wardrobe Recommendations</li>
              <li>• Interactive 7-Day Trend Charts</li>
              <li>• Resilient Zero-Downtime Fallback Mode</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text-main)' }}>System Telemetry</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                <span>API Status: <strong>Operational</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}>
                <Sparkles size={14} color="#a855f7" />
                <span>AI Engine: <strong>Gemini 1.5 Flash Active</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}>
                <ShieldCheck size={14} color="#38bdf8" />
                <span>Security: <strong>JWT + RBAC + Helmet</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}>
                <Cpu size={14} color="#f59e0b" />
                <span>Fallback Mode: <strong>Resilient Engine Armed</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>© {new Date().getFullYear()} WeatherWise AI Platform. MERN Architecture.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Built with React + Express + MongoDB + Google Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
