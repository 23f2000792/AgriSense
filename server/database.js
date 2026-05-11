const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'agrisense.db');
const db = new sqlite3.Database(dbPath);

const initDB = () => {
  db.serialize(async () => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT UNIQUE,
      password TEXT,
      territory TEXT
    )`);

    // Visits Table
    db.run(`CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY,
      repId TEXT,
      type TEXT,
      name TEXT,
      location TEXT,
      priority TEXT,
      priorityScore INTEGER,
      reason TEXT,
      inventoryStatus TEXT,
      crop TEXT,
      nextBestAction TEXT,
      status TEXT,
      lat REAL,
      lng REAL,
      lastVisit TEXT,
      FOREIGN KEY(repId) REFERENCES users(id)
    )`);

    // Outcomes Table
    db.run(`CREATE TABLE IF NOT EXISTS outcomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitId TEXT,
      repId TEXT,
      status TEXT,
      feedback TEXT,
      timestamp TEXT
    )`);

    // Seed Data if empty
    db.get('SELECT count(*) as count FROM users', async (err, row) => {
      if (row.count === 0) {
        console.log('Seeding Database with Indian Data...');
        const hashedPw = await bcrypt.hash('123456', 10);
        
        // Seed User
        const insertUser = db.prepare(`INSERT INTO users VALUES (?, ?, ?, ?, ?)`);
        insertUser.run('REP-1', 'Rajesh Kumar', '9876543210', hashedPw, 'Guntur, AP');
        insertUser.finalize();

        // Seed Visits
        const insertVisit = db.prepare(`INSERT INTO visits VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        insertVisit.run(
          'VISIT-1', 'REP-1', 'farmer', 'Venkat Rao', 'Amaravathi Village', 'High', 95,
          'Pest risk up 30%, Rainfall spike', null, 'Cotton (45 days)',
          JSON.stringify({ product: "Ampligo", action: "Early-stage spray", rationale: "High humidity, pest alert", talkingPoints: ["Spray within 3 days", "Focus on under-leaf coverage"] }),
          'pending', 16.5745, 80.3556, '14 days'
        );

        insertVisit.run(
          'VISIT-2', 'REP-1', 'retailer', 'Kisan Seva Kendra', 'Tenali Market', 'Medium', 82,
          'Competitor promo active', 'Low on Insecticides', null,
          JSON.stringify({ product: "Voliam Targo", action: "Pitch Bulk Discount", rationale: "Inventory down 60%", talkingPoints: ["Protect margins"] }),
          'pending', 16.2341, 80.6432, '7 days'
        );

        insertVisit.finalize();
        console.log('Seeding Complete.');
      }
    });
  });
};

module.exports = { db, initDB };
