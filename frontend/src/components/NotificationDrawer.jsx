import React from 'react';
import { X, CheckCheck, AlertTriangle, Info, Sparkles, Trash2 } from 'lucide-react';
import api from '../api/client';

export default function NotificationDrawer({ isOpen, onClose, notifications, onRefresh }) {
  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.35)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '400px',
          height: '100%',
          borderRadius: 0,
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #e2e8f0',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.06)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Notifications & Alerts</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {notifications.filter((n) => !n.isRead).length} unread updates
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleMarkAllRead}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              title="Mark all as read"
            >
              <CheckCheck size={14} /> Read All
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.5rem', borderRadius: '50%' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem 1rem', fontSize: '0.9rem' }}>
              No notifications at this time. All clear!
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                className="glass-card"
                style={{
                  padding: '0.85rem 1rem',
                  borderLeft: `3px solid ${
                    item.type === 'alert'
                      ? '#ef4444'
                      : item.type === 'recommendation'
                      ? '#2563eb'
                      : '#64748b'
                  }`,
                  background: item.isRead ? '#ffffff' : '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                    {item.type === 'alert' && <AlertTriangle size={15} color="#ef4444" />}
                    {item.type === 'recommendation' && <Sparkles size={15} color="#2563eb" />}
                    {item.type === 'system' && <Info size={15} color="#475569" />}
                    <span>{item.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkRead(item._id)}
                        style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer' }}
                        title="Mark read"
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item._id)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.45 }}>{item.message}</p>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
