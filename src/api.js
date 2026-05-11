import { io } from 'socket.io-client';
import { db } from './db/db';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001');

export const login = async (phone, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password })
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
};

export const syncVisits = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const res = await fetch(`${API_URL}/visits`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (res.ok) {
    const visits = await res.json();
    await db.visits.clear();
    await db.visits.bulkPut(visits);
  }
};

export const pushOutcomes = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const unsynced = await db.outcomes.where('synced').equals(0).toArray();
  if (unsynced.length === 0) return;

  const res = await fetch(`${API_URL}/sync-outcomes`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ outcomes: unsynced })
  });

  if (res.ok) {
    for (const outcome of unsynced) {
      await db.outcomes.update(outcome.id, { synced: 1 });
    }
  }
};

// Open-Meteo Real-Time Weather Integration for India
export const fetchLiveWeatherAlerts = async () => {
  try {
    // Coordinates for Guntur, AP (mocking the rep's location)
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=16.2997&longitude=80.4573&daily=precipitation_sum,temperature_2m_max&timezone=Asia%2FKolkata');
    const data = await res.json();
    
    // Check if rain is high tomorrow
    const rainTomorrow = data.daily.precipitation_sum[1];
    
    await db.anomalies.clear();
    if (rainTomorrow > 10) {
      await db.anomalies.put({
        id: "LIVE-ANOMALY-1",
        type: "alert-warning",
        title: "Live Weather Alert",
        description: `Heavy rainfall predicted tomorrow (${rainTomorrow}mm). Adjust fungicide schedules.`,
        time: "Just now"
      });
    } else {
      await db.anomalies.put({
        id: "LIVE-ANOMALY-2",
        type: "alert-danger",
        title: "Pest Warning (Dry Spell)",
        description: `High temperatures and dry conditions. Peak risk for Fall Armyworm.`,
        time: "Just now"
      });
    }
  } catch (err) {
    console.error("Failed to fetch live weather", err);
  }
};
