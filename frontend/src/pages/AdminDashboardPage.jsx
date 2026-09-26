import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Search,
  Sparkles,
  Cpu,
  Clock,
  Send,
  Trash2,
  RefreshCw,
  Activity,
  Layers,
  Heart,
  FileText,
  TrendingUp,
} from 'lucide-react';
import api from '../api/client';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [reports, setReports] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Broadcast Notification modal
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState('system');
  const [broadcastStatus, setBroadcastStatus] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, healthRes, usersRes, logsRes, favRes, repRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/health'),
        api.get(`/admin/users?search=${encodeURIComponent(userSearch)}`),
        api.get('/admin/logs?limit=15'),
        api.get('/admin/favorites').catch(() => ({ data: { data: [] } })),
        api.get('/admin/reports').catch(() => ({ data: { data: null } })),
      ]);
      setStats(statsRes.data.data);
      setHealth(healthRes.data);
      setUsers(usersRes.data.data);
      setLogs(logsRes.data.data);
      setFavorites(favRes.data.data || []);
      setReports(repRes.data.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [userSearch]);

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/admin/users/${user._id}`, { role: newRole });
      fetchAdminData();
    } catch (e) {
      alert(e.response?.data?.message || 'Error updating user role');
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      await api.put(`/admin/users/${user._id}`, { status: newStatus });
      fetchAdminData();
    } catch (e) {
      alert(e.response?.data?.message || 'Error updating user status');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Permanently delete user ${name} and all associated records?`)) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchAdminData();
      } catch (e) {
        alert(e.response?.data?.message || 'Error deleting user');
      }
    }
  };

  const handleDeleteFavorite = async (id) => {
    if (window.confirm('Remove this favorite location entry?')) {
      try {
        await api.delete(`/admin/favorites/${id}`);
        fetchAdminData();
      } catch (e) {
        alert(e.response?.data?.message || 'Error deleting favorite');
      }
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;

    try {
      await api.post('/admin/broadcast', {
        title: broadcastTitle,
        message: broadcastMsg,
        type: broadcastType,
      });
      setBroadcastStatus('Broadcast successfully dispatched to all active users!');
      setBroadcastTitle('');
      setBroadcastMsg('');
      setTimeout(() => setBroadcastStatus(''), 4000);
    } catch (e) {
      setBroadcastStatus('Failed to send broadcast');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1380px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontSize: '0.85rem' }}>
            <ShieldAlert size={16} />
            <span>Administrator Governance Console</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.2rem', color: '#0f172a' }}>
            Admin Dashboard
          </h1>
        </div>

        <button onClick={fetchAdminData} className="btn btn-secondary">
          <RefreshCw size={15} /> Refresh Metrics
        </button>
      </div>

      {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          Overview & Telemetry
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`btn ${activeTab === 'favorites' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          Favorite Locations ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          Reports & Analytics
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`btn ${activeTab === 'broadcast' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          Notifications
        </button>
      </div>

      {loading && !stats ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          Loading administrative metrics...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top KPIs Row (Always visible or in Overview) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.825rem' }}>Total Users</span>
                <Users size={16} color="#2563eb" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
                {stats?.totalUsers || 0}
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.825rem' }}>Total Searches</span>
                <Search size={16} color="#d97706" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
                {stats?.totalSearches || 0}
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.825rem' }}>AI Insights</span>
                <Sparkles size={16} color="#475569" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
                {stats?.totalAiInsights || 0}
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.825rem' }}>Avg Latency</span>
                <Clock size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
                {stats?.avgResponseTimeMs || 35}ms
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.825rem' }}>Fallback Engine</span>
                <Cpu size={16} color="#2563eb" />
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d', marginTop: '0.2rem' }}>
                Active & Ready
              </div>
            </div>
          </div>

          {/* TAB: Overview & Telemetry */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* System Health */}
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <Activity size={18} color="#10b981" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>System Health & Ingestion Status</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Core API Status</span>
                    <span style={{ fontWeight: 600, color: '#10b981' }}>{health?.status || 'OPERATIONAL'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Uptime</span>
                    <span style={{ fontWeight: 500 }}>{health?.uptimeSeconds || 0}s</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Memory Heap</span>
                    <span style={{ fontWeight: 500 }}>{health?.memory?.heapUsedMb || 0} MB</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Weather Service Driver</span>
                    <span className="badge badge-fallback">{health?.resilientFallbackMode?.externalApis?.openWeather || 'FALLBACK_SIMULATION'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>AI Intelligence Driver</span>
                    <span className="badge badge-gemini">{health?.resilientFallbackMode?.externalApis?.geminiAI || 'SMART_FALLBACK'}</span>
                  </div>
                </div>
              </div>

              {/* API Logs */}
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <Layers size={18} color="#2563eb" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Real-Time API Telemetry Logs</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                        <th style={{ padding: '0.65rem 0.75rem' }}>Method</th>
                        <th style={{ padding: '0.65rem 0.75rem' }}>Endpoint</th>
                        <th style={{ padding: '0.65rem 0.75rem' }}>Status</th>
                        <th style={{ padding: '0.65rem 0.75rem' }}>Latency</th>
                        <th style={{ padding: '0.65rem 0.75rem' }}>Engine Mode</th>
                        <th style={{ padding: '0.65rem 0.75rem' }}>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#2563eb' }}>{log.method}</td>
                          <td style={{ padding: '0.65rem 0.75rem', color: '#334155' }}>{log.endpoint}</td>
                          <td style={{ padding: '0.65rem 0.75rem', color: log.statusCode < 400 ? '#10b981' : '#b91c1c', fontWeight: 600 }}>
                            {log.statusCode}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>{log.responseTimeMs}ms</td>
                          <td style={{ padding: '0.65rem 0.75rem' }}>
                            {log.isFallback ? (
                              <span style={{ color: '#b45309', fontWeight: 500 }}>Fallback Simulation</span>
                            ) : (
                              <span style={{ color: '#15803d', fontWeight: 500 }}>Direct API</span>
                            )}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: User Management */}
          {activeTab === 'users' && (
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} color="#2563eb" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>User Governance</h3>
                </div>

                <div style={{ position: 'relative', width: '280px' }}>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '2.2rem', height: '36px', fontSize: '0.85rem' }}
                  />
                  <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>User</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Registered</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              background: u.role === 'admin' ? '#fee2e2' : '#f1f5f9',
                              color: u.role === 'admin' ? '#b91c1c' : '#334155',
                            }}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: u.status === 'active' ? '#15803d' : '#b91c1c',
                            }}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleToggleRole(u)}
                              className="btn btn-secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              Toggle Role
                            </button>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className="btn btn-secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              className="btn btn-danger"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: Favorite Locations Management */}
          {activeTab === 'favorites' && (
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Heart size={18} color="#ef4444" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>All User Favorite Locations</h3>
              </div>

              {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                  No favorite locations recorded across users yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>City</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Country</th>
                        <th style={{ padding: '0.75rem 1rem' }}>User</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Custom Label</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {favorites.map((fav) => (
                        <tr key={fav._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{fav.name}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{fav.country || '--'}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>
                            {fav.user?.email || fav.user?.name || 'User'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{fav.customLabel || 'None'}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteFavorite(fav._id)}
                              className="btn btn-danger"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: Reports & Analytics */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <FileText size={18} color="#2563eb" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Executive Reliability & Query Report</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="glass-card">
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>System Reliability Score</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d', marginTop: '0.2rem' }}>
                      {reports?.summary?.reliabilityScore || '100%'}
                    </div>
                  </div>
                  <div className="glass-card">
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>API Calls Logged</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                      {reports?.summary?.totalApiRequests || 0}
                    </div>
                  </div>
                  <div className="glass-card">
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Fallback Executions</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706', marginTop: '0.2rem' }}>
                      {reports?.summary?.fallbackRequests || 0}
                    </div>
                  </div>
                </div>

                {/* Popular Cities in History */}
                {reports?.popularCities && reports.popularCities.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>
                      Top Searched Locations Across Platform
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      {reports.popularCities.map((pc, i) => (
                        <div key={i} className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{pc._id}</div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {pc.totalQueries} searches • avg {Math.round(pc.avgTemp || 0)}°C
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Broadcast Notifications */}
          {activeTab === 'broadcast' && (
            <div className="glass-panel" style={{ padding: '1.75rem', maxWidth: '640px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Send size={18} color="#2563eb" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Dispatch Broadcast Notification</h3>
              </div>

              {broadcastStatus && (
                <div style={{ padding: '0.75rem', borderRadius: '4px', background: '#ecfdf5', color: '#15803d', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {broadcastStatus}
                </div>
              )}

              <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 500 }}>Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Broadcast Subject..."
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 500 }}>Message</label>
                  <textarea
                    required
                    placeholder="Message payload delivered to all active user notification drawers..."
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    className="input-field"
                    rows={3}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value)}
                    className="input-field"
                    style={{ width: '160px' }}
                  >
                    <option value="system">System Notice</option>
                    <option value="alert">Severe Advisory</option>
                    <option value="recommendation">AI Tip</option>
                  </select>

                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    <Send size={15} /> Send Broadcast
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
