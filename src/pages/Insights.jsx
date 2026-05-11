import React from 'react';
import { ShieldAlert, TrendingUp, BrainCircuit, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Mon', revenue: 4000, visits: 24 },
  { name: 'Tue', revenue: 3000, visits: 13 },
  { name: 'Wed', revenue: 2000, visits: 38 },
  { name: 'Thu', revenue: 2780, visits: 39 },
  { name: 'Fri', revenue: 1890, visits: 48 },
  { name: 'Sat', revenue: 2390, visits: 38 },
  { name: 'Sun', revenue: 3490, visits: 43 },
];

const Insights = () => {
  const { t } = useTranslation();
  const anomalies = useLiveQuery(() => db.anomalies.toArray()) || [];
  const profile = useLiveQuery(() => db.profile.toCollection().first());

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <section>
        <h3 className="section-title" style={{ marginBottom: '12px', fontSize: '1rem', color: 'var(--text-secondary)' }}>
          <ShieldAlert size={18} /> Region Alerts
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {anomalies.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>No active anomalies detected in your region.</div>
          ) : anomalies.map(anomaly => (
            <div key={anomaly.id} className={`glass-panel anomaly-card ${anomaly.type}`} style={{ padding: '16px', display: 'flex', gap: '12px' }}>
              <div style={{ color: anomaly.type === 'alert-danger' ? 'var(--alert-danger)' : 'var(--alert-warning)' }}>
                <Activity size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{anomaly.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{anomaly.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="section-title" style={{ marginBottom: '12px', fontSize: '1rem', color: 'var(--text-secondary)' }}>
          <TrendingUp size={18} /> Performance Metrics
        </h3>
        <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visits Completed</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {profile ? profile.completed : 0} / {profile ? profile.todayTarget : 0}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conversion Rate</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>68%</div>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '16px', height: '250px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '16px' }}>Weekly Revenue Trend</span>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--accent-primary)" strokeWidth={3} dot={{ fill: 'var(--accent-primary)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h3 className="section-title" style={{ marginBottom: '12px', fontSize: '1rem', color: 'var(--text-secondary)' }}>
          <BrainCircuit size={18} /> AI Suggestions
        </h3>
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
            <p style={{ fontSize: '0.85rem' }}>{t('Focus more on cotton belt this week')}</p>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
            <p style={{ fontSize: '0.85rem' }}>{t('Retailer demand rising in Zone B')}</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Insights;
