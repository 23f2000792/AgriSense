const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { db, initDB } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

initDB();

const JWT_SECRET = process.env.JWT_SECRET || 'agrisense-secret-key-2026';

// AUTHENTICATION
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  db.get('SELECT * FROM users WHERE phone = ?', [phone], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, name: user.name, territory: user.territory }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, territory: user.territory } });
  });
});

app.post('/api/signup', async (req, res) => {
  const { name, phone, password, territory } = req.body;
  const id = 'REP-' + Date.now();
  const hashedPw = await bcrypt.hash(password, 10);
  
  db.run('INSERT INTO users VALUES (?, ?, ?, ?, ?)', [id, name, phone, hashedPw, territory], function(err) {
    if (err) return res.status(400).json({ error: 'Phone already exists' });
    const token = jwt.sign({ id, name, territory }, JWT_SECRET);
    res.json({ token, user: { id, name, territory } });
  });
});

// MIDDLEWARE
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.user = decoded;
    next();
  });
};

// API ROUTES
app.get('/api/visits', authenticate, (req, res) => {
  db.all('SELECT * FROM visits WHERE repId = ? AND status != "completed"', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Parse JSON nextBestAction
    const visits = rows.map(r => ({ ...r, nextBestAction: JSON.parse(r.nextBestAction) }));
    res.json(visits);
  });
});

app.post('/api/sync-outcomes', authenticate, (req, res) => {
  const outcomes = req.body.outcomes;
  if (!outcomes || !outcomes.length) return res.json({ success: true });

  const stmt = db.prepare('INSERT INTO outcomes (visitId, repId, status, feedback, timestamp) VALUES (?, ?, ?, ?, ?)');
  const updateVisit = db.prepare('UPDATE visits SET status = "completed" WHERE id = ?');

  db.serialize(() => {
    outcomes.forEach(o => {
      stmt.run(o.visitId, req.user.id, o.status, o.feedback, o.timestamp);
      updateVisit.run(o.visitId);
    });
    stmt.finalize();
    updateVisit.finalize();
  });

  // Real-time broadcast that a visit was completed
  io.emit('visits-updated', { message: 'Refresh your visits' });

  res.json({ success: true });
});

// WEBSOCKET
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
