import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MapPin, Target, ShieldAlert, Store, Leaf, ChevronRight, Activity, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const visits = useLiveQuery(() => db.visits.toArray()) || [];
  const anomalies = useLiveQuery(() => db.anomalies.toArray()) || [];

  const handleVisitClick = (id) => {
    navigate(`/visit/${id}`);
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'var(--alert-danger)';
    if (priority === 'Medium') return 'var(--alert-warning)';
    return 'var(--accent-primary)';
  };

  const getPriorityBg = (priority) => {
    if (priority === 'High') return 'rgba(239, 68, 68, 0.15)';
    if (priority === 'Medium') return 'rgba(245, 158, 11, 0.15)';
    return 'rgba(16, 185, 129, 0.15)';
  };

  return (
    <div className="dashboard-container animate-fade-in">
      
      {/* Priority Visits Section */}
      <section>
        <div className="visits-list">
          {visits.map(visit => (
            <div 
              key={visit.id} 
              className="glass-panel visit-card"
              onClick={() => handleVisitClick(visit.id)}
            >
              <div className="visit-header">
                <div className="visit-info">
                  <div className="visit-icon-wrapper" style={{ color: getPriorityColor(visit.priority) }}>
                    {visit.type === 'retailer' ? <Store size={20} /> : <Leaf size={20} />}
                  </div>
                  <div className="visit-details">
                    <h4>{visit.name}</h4>
                    <p><MapPin size={12} /> {visit.location}</p>
                  </div>
                </div>
                <div 
                  className="priority-badge" 
                  style={{ 
                    backgroundColor: getPriorityBg(visit.priority), 
                    color: getPriorityColor(visit.priority) 
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getPriorityColor(visit.priority) }}></div>
                  {t(`${visit.priority} Priority`)}
                </div>
              </div>
              
              <div className="visit-reason" style={{ borderLeftColor: getPriorityColor(visit.priority) }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {t('Why this is important:')}
                </span>
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  {visit.reason.split(',').map((reason, i) => (
                    <li key={i}>{reason.trim()}</li>
                  ))}
                </ul>
              </div>

              <div className="visit-action" style={{ marginTop: '12px', background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{t('Recommended Action:')}</span>
                  <span className="action-text" style={{ color: 'var(--accent-primary)' }}>{visit.nextBestAction.product}</span>
                  <span style={{ fontSize: '0.75rem', display: 'block' }}>{visit.nextBestAction.action}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <button className="start-btn" onClick={(e) => { e.stopPropagation(); handleVisitClick(visit.id); }}>
                    ▶ {t('Start Visit')}
                  </button>
                  <button className="start-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={(e) => { e.stopPropagation(); }}>
                    <Navigation size={12} /> {t('Navigate')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
