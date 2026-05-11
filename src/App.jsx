import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, LineChart, User, Leaf, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Dashboard from './components/Dashboard';
import VisitCopilot from './components/VisitCopilot';
import MapView from './components/MapView';
import Insights from './components/Insights';
import Profile from './components/Profile';
import Login from './components/Login';
import ReloadPrompt from './components/ReloadPrompt';
import { db } from './db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { socket, syncVisits } from './api';
import './App.css';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const profile = useLiveQuery(() => db.profile.toCollection().first());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Socket.io Real-Time Synchronization
    socket.on('visits-updated', async (data) => {
      console.log('Real-time update received:', data);
      await syncVisits();
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      socket.off('visits-updated');
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const getActiveTab = () => {
    if (location.pathname.startsWith('/map')) return 'map';
    if (location.pathname.startsWith('/insights')) return 'insights';
    if (location.pathname.startsWith('/profile')) return 'profile';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  return (
    <div className="app-container">
      {/* Top Header Section */}
      <header className="app-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="header-brand">
            <Leaf className="brand-icon" size={24} />
            <div>
              <h1 className="header-title" style={{ fontSize: '1rem' }}>AgriSense</h1>
              <span className="header-subtitle">Field Copilot</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={toggleLanguage}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {i18n.language === 'en' ? 'EN / HI' : 'HI / EN'}
            </button>
            <div className="header-profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
              {profile ? profile.name.substring(0,2).toUpperCase() : 'AK'}
            </div>
          </div>
        </div>

        {/* Greeting & Sync Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 600 }}>
              {t('Good morning')}, {profile ? profile.name.split(' ')[0] : ''}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} • {profile?.territory || ''}
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isOnline ? 'var(--accent-primary)' : 'var(--alert-warning)'
          }}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isOnline ? t('Synced') : t('Offline Mode')}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/visit/:id" element={<VisitCopilot />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
        </Routes>
      </main>

      <ReloadPrompt />

      {/* Bottom Navigation (4 Tabs) */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <LayoutDashboard className="nav-icon" size={24} />
          <span>{t('Today Plan')}</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => navigate('/map')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <MapIcon className="nav-icon" size={24} />
          <span>{t('Map View')}</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => navigate('/insights')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <LineChart className="nav-icon" size={24} />
          <span>{t('Insights')}</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <User className="nav-icon" size={24} />
          <span>{t('Profile')}</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
