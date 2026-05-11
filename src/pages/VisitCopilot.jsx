import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Leaf, BrainCircuit, CheckCircle, Navigation, XCircle, FileText, Mic, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import './VisitCopilot.css';

const VisitCopilot = ({ visit: propVisit, onBack }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Use prop if passed, otherwise query from Dexie (useful for routing directly)
  const queryVisit = useLiveQuery(() => db.visits.get(id || ''));
  const visit = propVisit || queryVisit;

  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Chatbot State
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech recognition not supported in this browser.");
    }
  }, []);

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
        quantity: 0,
        timestamp: new Date().toISOString(),
        synced: 0
      });
      toast.success(`Outcome logged offline: ${status}`);
      if (onBack) onBack();
      else navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save outcome.');
    }
  };

  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input not supported in your browser.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Can be swapped to 'hi-IN'

    recognition.onstart = () => {
      setIsRecording(true);
      setShowNotes(true);
      toast('Listening...', { icon: '🎤' });
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setNotes(prev => prev + ' ' + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const simulateAiResponse = (query) => {
    setChatMessage('');
    setIsTyping(true);
    setBotResponse('');
    
    // Simulate network delay
    setTimeout(() => {
      const responseText = `Based on the latest satellite imagery for ${visit.location}, the soil moisture is currently optimal. However, due to the impending high humidity, I strongly recommend pitching ${visit.nextBestAction?.product || 'Fungicide'} to prevent early blight. Emphasize the long-term yield protection to the farmer.`;
      
      let i = 0;
      const typeWriter = setInterval(() => {
        setBotResponse((prev) => prev + responseText.charAt(i));
        i++;
        if (i >= responseText.length) {
          clearInterval(typeWriter);
          setIsTyping(false);
        }
      }, 30);
    }, 1000);
  };

  return (
    <div className="copilot-container animate-fade-in pb-20">
      <button className="back-btn" onClick={onBack || (() => navigate('/'))}>
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
              <span className="status-value">{visit.inventoryStatus || 'Unknown'}</span>
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
        <div className="ai-badge" onClick={() => setShowChatbot(!showChatbot)} style={{ cursor: 'pointer' }}>
          <BrainCircuit size={12} /> {showChatbot ? 'CLOSE CO-PILOT CHAT' : 'ASK AI CO-PILOT'}
        </div>

        <AnimatePresence>
          {showChatbot && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}
            >
              <div style={{ minHeight: '60px', fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '12px' }}>
                {botResponse || (isTyping ? 'Thinking...' : 'Ask me anything about this field or farmer...')}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="E.g., What should I pitch?"
                  style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white' }}
                />
                <button 
                  onClick={() => simulateAiResponse(chatMessage)}
                  style={{ background: 'var(--accent-primary)', border: 'none', padding: '8px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="action-header">
          <TargetIcon />
          <h3>{t('Recommended Action:')} <br/> <span style={{color:'white', fontSize:'0.9rem'}}>{visit.nextBestAction?.action}</span></h3>
        </div>

        <span className="rationale-label" style={{ marginBottom: '8px', display: 'block' }}>RECOMMENDED PRODUCT</span>
        <div className="products-list">
          <span className="product-tag">{visit.nextBestAction?.product}</span>
        </div>

        <div className="rationale-box">
          <span className="rationale-label">WHY THIS ACTION?</span>
          <p className="rationale-text">{visit.nextBestAction?.rationale}</p>
        </div>

        <div className="rationale-box" style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '3px solid var(--accent-primary)' }}>
          <span className="rationale-label" style={{color: 'var(--accent-primary)'}}>TALKING POINTS</span>
          <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.85rem', color: 'white' }}>
            {visit.nextBestAction?.talkingPoints?.map((pt, i) => (
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
            placeholder="Enter feedback or tap mic to speak..."
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px', minHeight: '80px', fontFamily: 'inherit' }}
          />
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <button className="btn-secondary" onClick={() => setShowNotes(!showNotes)}>
            <FileText size={18} /> {t('Type Notes')}
          </button>
          <button 
            className="btn-secondary" 
            style={{ borderColor: isRecording ? 'var(--alert-danger)' : 'var(--border-color)', color: isRecording ? 'var(--alert-danger)' : 'white' }} 
            onClick={toggleRecording}
          >
            <Mic size={18} className={isRecording ? "animate-pulse" : ""} /> {isRecording ? 'Listening...' : t('Voice Log')}
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
