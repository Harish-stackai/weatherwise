import React, { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/history?page=${page}&limit=12&search=${encodeURIComponent(searchFilter)}`);
      setHistory(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalRecords(res.data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, searchFilter]);

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear your entire search history?')) {
      try {
        await api.delete('/history');
        fetchHistory();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      fetchHistory();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = (format) => {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/history/export?format=${format}&token=${localStorage.getItem('weatherwise_token')}`, '_blank');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header with Search and Export actions */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', fontSize: '0.85rem' }}>
            <History size={15} />
            <span>Search Audit Log ({totalRecords} queries)</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.2rem', color: '#0f172a' }}>
            Search History
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => handleExport('csv')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => handleExport('json')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Download size={14} /> Export JSON
          </button>
          {totalRecords > 0 && (
            <button onClick={handleClearAll} className="btn btn-danger" style={{ fontSize: '0.85rem' }}>
              <Trash2 size={14} /> Clear History
            </button>
          )}
        </div>
      </div>

      {/* Filter Input */}
      <div style={{ maxWidth: '400px', marginBottom: '1.5rem', position: 'relative' }}>
        <input
          type="text"
          placeholder="Filter history by city..."
          value={searchFilter}
          onChange={(e) => {
            setSearchFilter(e.target.value);
            setPage(1);
          }}
          className="input-field"
          style={{ paddingLeft: '2.5rem', height: '40px', fontSize: '0.9rem' }}
        />
        <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          Loading search history...
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <History size={44} color="var(--accent-cyan)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Search Records</h3>
          <p style={{ color: 'var(--text-muted)' }}>Searches you perform across the application will be recorded here.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Location</th>
                <th style={{ padding: '0.85rem 1rem' }}>Temperature</th>
                <th style={{ padding: '0.85rem 1rem' }}>Conditions</th>
                <th style={{ padding: '0.85rem 1rem' }}>Humidity / Wind</th>
                <th style={{ padding: '0.85rem 1rem' }}>Searched At</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr
                  key={item._id}
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.9rem' }}
                >
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700 }}>{item.city}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.country || 'Global'}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {item.weather?.temp !== undefined ? `${item.weather.temp}°C` : '--'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ textTransform: 'capitalize' }}>{item.weather?.condition || 'Clear'}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {item.weather?.humidity}% • {item.weather?.windSpeed} km/h
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(item.searchedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => navigate(`/search?city=${encodeURIComponent(item.city)}`)}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                        title="View Live Weather"
                      >
                        <ExternalLink size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="btn btn-danger"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                        title="Delete entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Page {page} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
