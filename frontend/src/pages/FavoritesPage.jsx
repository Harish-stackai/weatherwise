import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Plus,
  Trash2,
  Pin,
  PinOff,
  Sparkles,
  ExternalLink,
  Edit2,
  Check,
  X,
  Sun,
  Droplets,
  Wind,
} from 'lucide-react';
import api from '../api/client';
import confetti from 'canvas-confetti';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/favorites');
      setFavorites(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleAddFavorite = async (e) => {
    e.preventDefault();
    if (!newCity.trim()) return;

    try {
      await api.post('/favorites', {
        name: newCity.trim(),
        customLabel: newLabel.trim(),
        notes: newNotes.trim(),
      });
      setShowAddModal(false);
      setNewCity('');
      setNewLabel('');
      setNewNotes('');
      fetchFavorites();
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding favorite');
    }
  };

  const handleTogglePin = async (fav) => {
    try {
      await api.put(`/favorites/${fav._id}`, { isPinned: !fav.isPinned });
      fetchFavorites();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id, cityName) => {
    if (window.confirm(`Remove ${cityName} from favorites?`)) {
      try {
        await api.delete(`/favorites/${id}`);
        fetchFavorites();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleStartEdit = (fav) => {
    setEditingId(fav._id);
    setEditLabel(fav.customLabel || '');
    setEditNotes(fav.notes || '');
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.put(`/favorites/${id}`, {
        customLabel: editLabel,
        notes: editNotes,
      });
      setEditingId(null);
      fetchFavorites();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.85rem' }}>
            <Heart size={15} fill="#ef4444" />
            <span>Saved Locations Portfolio</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.2rem', color: '#0f172a' }}>
            Favorite Cities & Locations
          </h1>
        </div>

        <button
          id="add-favorite-btn"
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ padding: '0.65rem 1.25rem' }}
        >
          <Plus size={16} /> Add Location
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          Loading your favorite locations...
        </div>
      ) : favorites.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Heart size={44} color="var(--accent-rose)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Favorite Locations Yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Pin your home city, frequent travel destinations, or dream vacation spots for live weather tracking.
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} /> Add Your First City
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {favorites.map((fav) => (
            <div
              key={fav._id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                borderLeft: fav.isPinned ? '4px solid var(--accent-rose)' : '1px solid var(--border-color)',
                position: 'relative',
              }}
            >
              {/* Header with City & Pin/Delete */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{fav.name}</h3>
                    {fav.country && (
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }}>
                        {fav.country}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 500, marginTop: '0.2rem' }}>
                    {fav.customLabel || 'Saved Location'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => handleTogglePin(fav)}
                    style={{ background: 'transparent', border: 'none', color: fav.isPinned ? 'var(--accent-rose)' : 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                    title={fav.isPinned ? 'Unpin city' : 'Pin city to top'}
                  >
                    {fav.isPinned ? <Pin size={16} fill="var(--accent-rose)" /> : <PinOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleStartEdit(fav)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                    title="Edit label & notes"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(fav._id, fav.name)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                    title="Delete favorite"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Edit Mode Inline */}
              {editingId === fav._id ? (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Custom Label (e.g. Vacation Home)"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Notes (e.g. Best in autumn)"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditingId(null)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                      <X size={13} /> Cancel
                    </button>
                    <button onClick={() => handleSaveEdit(fav._id)} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                      <Check size={13} /> Save
                    </button>
                  </div>
                </div>
              ) : (
                fav.notes && (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px' }}>
                    "{fav.notes}"
                  </p>
                )
              )}

              {/* Live Weather Metrics */}
              {fav.currentWeather ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
                      {fav.currentWeather.temp}°C
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {fav.currentWeather.condition}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    <span>Humidity: {fav.currentWeather.humidity}%</span>
                    <span>Wind: {fav.currentWeather.windSpeed} km/h</span>
                    <span>Feels: {fav.currentWeather.feelsLike}°C</span>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Weather data sync pending...</div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                <button
                  onClick={() => navigate(`/search?city=${encodeURIComponent(fav.name)}`)}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem' }}
                >
                  Radar <ExternalLink size={13} />
                </button>
                <button
                  onClick={() => navigate(`/insights?city=${encodeURIComponent(fav.name)}`)}
                  className="btn btn-ai"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem' }}
                >
                  <Sparkles size={13} /> AI Brief
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Favorite Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="glass-panel"
            style={{ width: '100%', maxWidth: '440px', padding: '2rem', background: 'var(--bg-secondary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Save Favorite City</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddFavorite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem' }}>City Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zurich, Barcelona, Singapore"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem' }}>Custom Label (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. European Headquarters, Ski Trip"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem' }}>Personal Notes (Optional)</label>
                <textarea
                  placeholder="Notes about travel windows or climate preferences..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
