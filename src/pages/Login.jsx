import React, { useState } from 'react';
import { Leaf, Lock, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { login, syncVisits, fetchLiveWeatherAlerts } from '../services/api.service';
import { db } from '../db/db';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(phone, password);
      authLogin(data.token, data.user);
      
      await db.profile.clear();
      await db.profile.put({
        id: data.user.id,
        name: data.user.name,
        territory: data.user.territory,
        todayTarget: 10,
        completed: 0,
        lastSync: new Date().toISOString()
      });

      toast.promise(
        Promise.all([syncVisits(), fetchLiveWeatherAlerts()]),
        {
          loading: 'Syncing field data...',
          success: 'Ready to go!',
          error: 'Sync failed, falling back to offline mode'
        }
      );
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--accent-primary)' }}>
          <Leaf size={32} color="var(--accent-primary)" />
        </div>
        <h1 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '8px' }}>AgriSense</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Field Force Intelligence</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
          <input 
            type="text" 
            placeholder="Phone Number" 
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={{ width: '100%', padding: '14px 14px 14px 40px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '1rem' }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '14px 14px 14px 40px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '1rem' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, marginTop: '8px', cursor: 'pointer' }}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Demo Account: 9876543210 / 123456</span>
        </div>
      </form>
    </div>
  );
};

export default Login;
