import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  CloudSun,
  Search,
  Sparkles,
  Heart,
  History,
  ShieldAlert,
  Bell,
  Sun,
  Moon,
  Zap,
  User,
  LogOut,
  Calendar,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

export default function Navbar({ onOpenNotifications, unreadCount = 0 }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?city=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      id="main-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1380px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          id="nav-logo"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloudSun size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a' }}>
              <span>WeatherWise</span>
              <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>AI</span>
            </div>
          </div>
        </Link>

        {/* Quick Search */}
        <form onSubmit={handleQuickSearch} style={{ display: 'flex', alignItems: 'center', flex: '0 1 300px', position: 'relative' }}>
          <input
            id="nav-quick-search"
            type="text"
            placeholder="Search city (e.g. London)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.2rem', height: '36px', fontSize: '0.85rem', borderColor: '#e2e8f0' }}
          />
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', color: '#94a3b8' }} />
        </form>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Link
            to="/dashboard"
            id="nav-dashboard"
            className="btn btn-secondary"
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.85rem',
              borderColor: isActive('/dashboard') ? '#cbd5e1' : 'transparent',
              background: isActive('/dashboard') ? '#f1f5f9' : 'transparent',
              fontWeight: isActive('/dashboard') ? 600 : 500,
            }}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/search"
            id="nav-search"
            className="btn btn-secondary"
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.85rem',
              borderColor: isActive('/search') ? '#cbd5e1' : 'transparent',
              background: isActive('/search') ? '#f1f5f9' : 'transparent',
              fontWeight: isActive('/search') ? 600 : 500,
            }}
          >
            <Search size={15} />
            <span>Search</span>
          </Link>

          <Link
            to="/forecast"
            id="nav-forecast"
            className="btn btn-secondary"
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.85rem',
              borderColor: isActive('/forecast') ? '#cbd5e1' : 'transparent',
              background: isActive('/forecast') ? '#f1f5f9' : 'transparent',
              fontWeight: isActive('/forecast') ? 600 : 500,
            }}
          >
            <Calendar size={15} />
            <span>Forecast</span>
          </Link>

          <Link
            to="/insights"
            id="nav-insights"
            className="btn btn-secondary"
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.85rem',
              borderColor: isActive('/insights') ? '#cbd5e1' : 'transparent',
              background: isActive('/insights') ? '#f1f5f9' : 'transparent',
              fontWeight: isActive('/insights') ? 600 : 500,
            }}
          >
            <Sparkles size={15} color="#2563eb" />
            <span>AI Insights</span>
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/favorites"
                id="nav-favorites"
                className="btn btn-secondary"
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem',
                  borderColor: isActive('/favorites') ? '#cbd5e1' : 'transparent',
                  background: isActive('/favorites') ? '#f1f5f9' : 'transparent',
                  fontWeight: isActive('/favorites') ? 600 : 500,
                }}
              >
                <Heart size={15} color="#ef4444" />
                <span>Favorites</span>
              </Link>

              <Link
                to="/history"
                id="nav-history"
                className="btn btn-secondary"
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem',
                  borderColor: isActive('/history') ? '#cbd5e1' : 'transparent',
                  background: isActive('/history') ? '#f1f5f9' : 'transparent',
                  fontWeight: isActive('/history') ? 600 : 500,
                }}
              >
                <History size={15} />
                <span>History</span>
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              id="nav-admin"
              className="btn btn-danger"
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.825rem',
                fontWeight: 600,
              }}
            >
              <ShieldAlert size={15} />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Right Tools: Notifications, Theme, User Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Notifications Button */}
          {isAuthenticated && (
            <button
              id="nav-notifications-btn"
              onClick={onOpenNotifications}
              className="btn btn-secondary"
              style={{ padding: '0.5rem', position: 'relative', borderRadius: '50%', width: '38px', height: '38px' }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Theme Switcher */}
          <button
            id="nav-theme-toggle"
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px' }}
            title={`Current theme: ${theme}. Click to switch.`}
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* User Menu */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                id="nav-user-dropdown-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: '#fff',
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user?.name?.split(' ')[0]}</span>
              </button>

              {userDropdownOpen && (
                <div
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '110%',
                    width: '210px',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                >
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', border: 'none', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                  >
                    <User size={15} /> Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', border: 'none', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                  >
                    <Sparkles size={15} /> Preferences & Keys
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="btn btn-danger"
                    style={{ justifyContent: 'flex-start', marginTop: '0.35rem', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" id="nav-login-btn" className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
                Sign In
              </Link>
              <Link to="/register" id="nav-register-btn" className="btn btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
