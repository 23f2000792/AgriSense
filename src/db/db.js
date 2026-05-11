import Dexie from 'dexie';

export const db = new Dexie('AgriSenseDB');

db.version(1).stores({
  visits: 'id, type, name, location, priority, priorityScore, reason, inventoryStatus, crop, nextBestAction, status, lat, lng, lastVisit',
  anomalies: 'id, type, title, description, time',
  outcomes: 'visitId, status, quantity, feedback, timestamp, synced',
  profile: 'id, name, territory, todayTarget, completed, lastSync'
});

// We no longer populate mock data automatically.
// The data will be synced from the Node.js backend when the user logs in.
