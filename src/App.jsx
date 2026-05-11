import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import ReloadPrompt from './components/ReloadPrompt';

import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import Login from './pages/Login';
import VisitCopilot from './pages/VisitCopilot';

import './App.css';
import { syncVisits } from './services/api.service';

const MainApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeVisit, setActiveVisit] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(async () => {
      if (navigator.onLine && localStorage.getItem('token')) {
        await syncVisits();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!user) {
    return <Login />;
  }

  if (activeVisit) {
    return <VisitCopilot visit={activeVisit} onBack={() => setActiveVisit(null)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onStartVisit={setActiveVisit} />;
      case 'map': return <MapView onStartVisit={setActiveVisit} />;
      case 'insights': return <Insights />;
      case 'profile': return <Profile />;
      default: return <Dashboard onStartVisit={setActiveVisit} />;
    }
  };

  return (
    <div className="app-container">
      <Toaster position="top-center" reverseOrder={false} />
      <ReloadPrompt />
      <Header />
      
      {!isOnline && (
        <div className="offline-banner">
          You are currently offline. Changes will sync when reconnected.
        </div>
      )}

      <main className="content-area pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ height: '100%' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

export default App;
