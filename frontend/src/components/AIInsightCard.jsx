import React, { useState } from 'react';
import {
  Sparkles,
  Shirt,
  Navigation,
  Activity,
  AlertTriangle,
  Send,
  Bot,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import api from '../api/client';

export default function AIInsightCard({ insightData, city, onRefreshInsight }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [question, setQuestion] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState(null);
  const [isAsking, setIsAsking] = useState(false);

  if (!insightData) return null;

  const { summary, recommendations, source, modelUsed, generatedAt } = insightData;
  const { travel, clothing, activities, severeAlerts } = recommendations || {};

  const handleAskAssistant = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsAsking(true);
    try {
      const res = await api.post('/ai/ask', {
        city: city || insightData.city,
        question: question.trim(),
      });
      setAssistantAnswer(res.data.answer);
    } catch (err) {
      setAssistantAnswer('Weather assistant encountered an error. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.75rem', position: 'relative' }}>
      {/* AI Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Gemini Weather Intelligence</h3>
              <span className="badge badge-gemini">{modelUsed || 'Gemini 1.5 Flash'}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Analyzed for {insightData.city} • Source: {source === 'gemini-ai' ? 'Google Gemini AI' : 'Smart AI Fallback Engine'}
            </span>
          </div>
        </div>

        {onRefreshInsight && (
          <button onClick={onRefreshInsight} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Sparkles size={14} color="#2563eb" /> Regenerate Analysis
          </button>
        )}
      </div>

      {/* Narrative Summary Box */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          lineHeight: 1.6,
          fontSize: '0.925rem',
          color: '#1e293b',
        }}
      >
        <p>{summary}</p>
      </div>

      {/* Recommendation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('clothing')}
          className={`btn ${activeTab === 'clothing' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
        >
          <Shirt size={16} /> Clothing & Wardrobe
        </button>

        <button
          onClick={() => setActiveTab('travel')}
          className={`btn ${activeTab === 'travel' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
        >
          <Navigation size={16} /> Travel Precautions
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`btn ${activeTab === 'activities' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
        >
          <Activity size={16} /> Activity Suggestions
        </button>

        <button
          onClick={() => setActiveTab('severe')}
          className={`btn ${activeTab === 'severe' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
        >
          <AlertTriangle size={16} color={severeAlerts?.isSevere ? 'var(--accent-rose)' : 'inherit'} />
          Severe Weather Risk
        </button>
      </div>

      {/* Tab Contents */}
      <div style={{ minHeight: '180px', marginBottom: '2rem' }}>
        {/* Clothing Tab */}
        {activeTab === 'clothing' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                Primary Outfit Recommendation
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {clothing?.primary || 'Comfortable daily wear suitable for current conditions.'}
              </p>
            </div>

            <div className="glass-card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>
                Layering Strategy
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {clothing?.layers || 'Light layering recommended.'}
              </p>
            </div>

            <div className="glass-card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '0.5rem' }}>
                Essential Accessories
              </h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {clothing?.accessories?.map((acc, i) => (
                  <li key={i}>{acc}</li>
                )) || <li>Sunglasses and comfortable footwear</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Travel Tab */}
        {activeTab === 'travel' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Commute & Transit Feasibility</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  {travel?.advice || 'Conditions are favorable for normal road and air transit.'}
                </div>
              </div>
              <span
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  background:
                    travel?.status === 'Hazardous'
                      ? 'rgba(244,63,94,0.2)'
                      : travel?.status === 'Caution'
                      ? 'rgba(245,158,11,0.2)'
                      : 'rgba(16,185,129,0.2)',
                  color:
                    travel?.status === 'Hazardous'
                      ? 'var(--accent-rose)'
                      : travel?.status === 'Caution'
                      ? 'var(--accent-amber)'
                      : 'var(--accent-emerald)',
                  border: `1px solid ${
                    travel?.status === 'Hazardous'
                      ? 'var(--accent-rose)'
                      : travel?.status === 'Caution'
                      ? 'var(--accent-amber)'
                      : 'var(--accent-emerald)'
                  }`,
                }}
              >
                Status: {travel?.status || 'Favorable'}
              </span>
            </div>

            <div className="glass-card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Travel Precautions Checklist</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {travel?.precautions?.map((prec, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={16} color="var(--accent-cyan)" />
                    <span>{prec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Clock size={16} color="var(--accent-amber)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Best Window: <strong>{activities?.bestTimeOfDay || 'Midday to Early Evening'}</strong>
                </span>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
                Recommended Outdoor Pursuits
              </h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {activities?.outdoor?.map((act, i) => (
                  <li key={i}>{act}</li>
                )) || <li>Jogging or brisk walking in local parks</li>}
              </ul>
            </div>

            <div className="glass-card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '0.5rem', marginTop: '1.25rem' }}>
                Indoor Alternatives & Leisure
              </h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {activities?.indoor?.map((act, i) => (
                  <li key={i}>{act}</li>
                )) || <li>Art exhibitions and museum tours</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Severe Alert Tab */}
        {activeTab === 'severe' && (
          <div className="animate-fade-in">
            <div
              className="glass-card"
              style={{
                borderLeft: `4px solid ${severeAlerts?.isSevere ? 'var(--accent-rose)' : 'var(--accent-emerald)'}`,
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} color={severeAlerts?.isSevere ? 'var(--accent-rose)' : 'var(--accent-emerald)'} />
                  {severeAlerts?.headline || 'No Active Severe Weather Warnings'}
                </h4>
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: severeAlerts?.isSevere ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)',
                    color: severeAlerts?.isSevere ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                  }}
                >
                  Risk Level: {severeAlerts?.riskLevel || 'None'}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Continuous monitoring active. Atmospheric indices are within normal variance thresholds.
              </p>
              {severeAlerts?.instructions && severeAlerts.instructions.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Safety Directives:</div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {severeAlerts.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Weather Assistant Input Box */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Bot size={18} color="var(--accent-purple)" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Ask Gemini Weather Assistant</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— Instant conversational queries</span>
        </div>

        <form onSubmit={handleAskAssistant} style={{ display: 'flex', gap: '0.65rem' }}>
          <input
            type="text"
            placeholder={`Ask anything about ${city || 'the weather'} (e.g., "Is it good for a flight at 6 PM?")`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="input-field"
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={isAsking} className="btn btn-ai" style={{ padding: '0.65rem 1.25rem' }}>
            <Send size={16} />
            <span>{isAsking ? 'Thinking...' : 'Ask'}</span>
          </button>
        </form>

        {assistantAnswer && (
          <div
            className="glass-card animate-fade-in"
            style={{
              marginTop: '1rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '1rem 1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#2563eb', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <Bot size={15} /> Weather Assistant Response:
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#334155' }}>{assistantAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
