import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, CloudOff, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleLang = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const pendingOutcomes = useLiveQuery(() => db.outcomes.where('synced').equals(0).count()) || 0;

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="branding">
          <h1>AgriSense</h1>
          <span className="badge">PRO</span>
        </div>
        
        <div className="header-actions">
          <AnimatePresence>
            {!isOnline ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0 }}
                className="offline-queue-badge"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--alert-danger)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}
              >
                <CloudOff size={14} /> {pendingOutcomes} Pending
              </motion.div>
            ) : pendingOutcomes > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 'bold' }}
              >
                <RefreshCw size={14} className="animate-spin" /> Syncing...
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button className="lang-toggle" onClick={toggleLang}>
            {i18n.language === 'en' ? 'A/अ' : 'अ/A'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
