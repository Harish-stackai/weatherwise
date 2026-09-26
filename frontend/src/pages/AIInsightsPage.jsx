import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AIInsightCard from '../components/AIInsightCard';
import { Sparkles, Bot, Search, History, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

export default function AIInsightsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || 'Tokyo';
  const [city, setCity] = useState(cityParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [insightData, setInsightData] = useState(null);
  const [savedInsights, setSavedInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInsight = async (targetCity) => {
    setLoading(true);
    try {
      const res = await api.post('/ai/insights', { city: targetCity });
      setInsightData(res.data.data);
      setSearchParams({ city: targetCity });

      // Fetch saved insights if logged in
      api.get('/ai/insights')
        .then((r) => setSavedInsights(r.data.data || []))
        .catch(() => {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight(cityParam);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCity(searchQuery.trim());
      fetchInsight(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      {/* Page Title & Search Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', fontSize: '0.85rem' }}>
            <Sparkles size={15} />
            <span style={{ fontWeight: 600 }}>Gemini Weather Advisory</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.2rem', color: '#0f172a' }}>
            AI Weather Intelligence: <span>{city}</span>
          </h1>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', minWidth: '320px' }}>
          <input
            type="text"
            placeholder="Generate for city (e.g. Paris)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ height: '42px' }}
          />
          <button type="submit" className="btn btn-ai" style={{ padding: '0 1.25rem' }}>
            <Search size={16} />
          </button>
        </form>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-float" size={38} color="var(--accent-purple)" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Google Gemini is generating atmospheric lifestyle synthesis...
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Evaluating temperatures, humidity, UV indices, wardrobe comfort, and travel hazards.
          </p>
        </div>
      )}

      {!loading && insightData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <AIInsightCard
            insightData={insightData}
            city={city}
            onRefreshInsight={() => fetchInsight(city)}
          />

          {/* Saved Past Insights Archive */}
          {savedInsights.length > 0 && (
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <History size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Recent AI Insights History</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {savedInsights.slice(0, 6).map((item) => (
                  <div
                    key={item._id}
                    className="glass-card"
                    onClick={() => {
                      setCity(item.city);
                      setInsightData(item);
                    }}
                    style={{ cursor: 'pointer', padding: '1rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{item.city}</span>
                      <span className="badge badge-gemini" style={{ fontSize: '0.65rem' }}>{item.modelUsed}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.summary}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(item.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
