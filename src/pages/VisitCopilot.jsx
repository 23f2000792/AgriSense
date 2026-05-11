import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Leaf, BrainCircuit, CheckCircle, Navigation, XCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import './VisitCopilot.css';

const VisitCopilot = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const visit = useLiveQuery(() => db.visits.get(id));
  const existingOutcome = useLiveQuery(() => db.outcomes.get(id));

  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  if (!visit) {
    return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;
  }

  const isRetailer = visit.type === 'retailer';

  const handleOutcome = async (status) => {
    try {
      await db.outcomes.put({
        visitId: visit.id,
        status: status,
        feedback: notes,
        quantity: 0, // Mock quantity
        timestamp: new Date().toISOString(),
        synced: 0 // 0 means false for SQLite/IndexedDB boolean conventions
      });
      alert(`Outcome saved offline: ${status}`);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to save outcome.');
    }
  };

  return (
    <div className="copilot-container animate-fade-in">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div className="visit-profile">
          <div className="profile-icon">
            {isRetailer ? <Store size={28} /> : <Leaf size={28} />}
          </div>
          <div className="profile-details">
            <h2>{visit.name}</h2>
            <p><Navigation size={14} /> {visit.location}</p>
          </div>
        </div>

        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Priority</span>
            <span className="status-value" style={{ color: visit.priority === 'High' ? 'var(--alert-danger)' : 'var(--accent-primary)' }}>
              {t(visit.priority + ' Priority')}
            </span>
          </div>
          {isRetailer ? (
            <div className="status-item">
              <span className="status-label">Inventory</span>
              <span className="status-value">{visit.inventoryStatus}</span>
            </div>
          ) : (
            <div className="status-item">
              <span className="status-label">Crop Stage</span>
              <span className="status-value">{visit.crop}</span>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel ai-action-card">
        <div className="ai-badge">
          <BrainCircuit size={12} /> AI CO-PILOT
        </div>
        
        <div className="action-header">
          <TargetIcon />
          <h3>{t('Recommended Action:')} <br/> <span style={{color:'white', fontSize:'0.9rem'}}>{visit.nextBestAction.action}</span></h3>
        </div>

        <span className="rationale-label" style={{ marginBottom: '8px', display: 'block' }}>RECOMMENDED PRODUCT</span>
        <div className="products-list">
          <span className="product-tag">{visit.nextBestAction.product}</span>
        </div>

        <div className="rationale-box">
          <span className="rationale-label">WHY THIS ACTION?</span>
          <p className="rationale-text">{visit.nextBestAction.rationale}</p>
        </div>

        <div className="rationale-box" style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '3px solid var(--accent-primary)' }}>
          <span className="rationale-label" style={{color: 'var(--accent-primary)'}}>TALKING POINTS</span>
          <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.85rem', color: 'white' }}>
            {visit.nextBestAction.talkingPoints.map((pt, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{t(pt)}</li>
            ))}
          </ul>
        </div>

        {/* Action Buttons for Outcome Logging */}
        <span className="rationale-label" style={{ marginTop: '20px', marginBottom: '8px', display: 'block' }}>LOG OUTCOME</span>
        
        {showNotes ? (
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter feedback or notes..."
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px', minHeight: '80px', fontFamily: 'inherit' }}
          />
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <button className="btn-secondary" onClick={() => setShowNotes(!showNotes)}>
            <FileText size={18} /> {t('Add Notes')}
          </button>
        </div>

        <div className="action-buttons">
          <button className="btn-secondary" style={{ borderColor: 'var(--alert-danger)', color: 'var(--alert-danger)' }} onClick={() => handleOutcome('No Sale')}>
            <XCircle size={18} /> {t('No Sale')}
          </button>
          <button className="btn-primary" onClick={() => handleOutcome('Sale Made')}>
            <CheckCircle size={18} /> {t('Sale Made')}
          </button>
        </div>
      </div>
    </div>
  );
};

const TargetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

export default VisitCopilot;
