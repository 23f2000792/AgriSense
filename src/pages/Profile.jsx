import React, { useState } from 'react';
import { User, RefreshCw, DownloadCloud, Database, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { pushOutcomes, syncVisits } from '../api';

const Profile = ({ onLogout }) => {
  const { t } = useTranslation();
  const profile = useLiveQuery(() => db.profile.toCollection().first());
  const unsyncedOutcomes = useLiveQuery(() => db.outcomes.where('synced').equals(0).count()) || 0;
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await pushOutcomes();
      await syncVisits();
      await db.profile.update(profile.id, { lastSync: new Date().toISOString() });
      alert("Data synced successfully with backend!");
    } catch (err) {
      alert("Sync failed. Check your network connection.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Profile Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '3px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <User size={40} color="var(--accent-primary)" />
        </div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{profile?.name}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{profile?.territory}</p>
        
        <button 
          onClick={onLogout}
          style={{ marginTop: '16px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--alert-danger)', border: '1px solid var(--alert-danger)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Sync Status */}
      <section>
        <h3 className="section-title" style={{ marginBottom: '12px', fontSize: '1rem', color: 'var(--text-secondary)' }}>
          <Database size={18} /> Data & Sync
        </h3>
        <div className="glass-panel" style={{ padding: '0' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'white' }}>Last Sync</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {profile?.lastSync ? new Date(profile.lastSync).toLocaleString() : 'Never'}
              </div>
            </div>
            <div style={{ color: unsyncedOutcomes > 0 ? 'var(--alert-warning)' : 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {unsyncedOutcomes} Pending
            </div>
          </div>
          
          <button 
            onClick={handleSync}
            disabled={syncing}
            style={{ width: '100%', padding: '16px', background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <RefreshCw size={18} color="var(--accent-primary)" className={syncing ? 'animate-spin' : ''} />
            <span style={{ fontSize: '0.9rem' }}>{syncing ? 'Syncing with Server...' : 'Manual Sync Now'}</span>
          </button>
          
          <button style={{ width: '100%', padding: '16px', background: 'transparent', border: 'none', borderTop: '1px solid var(--border-color)', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <DownloadCloud size={18} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.9rem' }}>Download Data for Offline</span>
          </button>
        </div>
      </section>

    </div>
  );
};

export default Profile;
