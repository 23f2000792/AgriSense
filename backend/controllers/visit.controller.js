import { pool } from '../config/db.js';

export const getVisits = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM visits WHERE repId = $1 AND status != 'completed'", [req.user.id]);
    const visits = rows.map(r => ({ 
      ...r, 
      nextBestAction: typeof r.nextbestaction === 'string' ? JSON.parse(r.nextbestaction) : r.nextbestaction 
    }));
    return res.status(200).json(visits);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const syncOutcomes = async (req, res) => {
  try {
    const outcomes = req.body.outcomes;
    if (!outcomes || !outcomes.length) return res.status(200).json({ success: true });

    for (const o of outcomes) {
      await pool.query(
        `INSERT INTO outcomes (visitId, repId, status, feedback, timestamp) VALUES ($1, $2, $3, $4, $5)`,
        [o.visitId, req.user.id, o.status, o.feedback, o.timestamp]
      );
      await pool.query(`UPDATE visits SET status = 'completed' WHERE id = $1`, [o.visitId]);
    }
    return res.status(200).json({ success: true, message: 'Sync complete' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const addVisit = async (req, res) => {
  try {
    const { name, location, type, crop } = req.body;
    const id = `VISIT-${Date.now()}`;
    const nextBestAction = JSON.stringify({ product: "New Action", action: "Assess Field", rationale: "New farmer added", talkingPoints: ["Check crop health"] });
    
    await pool.query(
      `INSERT INTO visits (id, repId, type, name, location, priority, priorityScore, reason, inventoryStatus, crop, nextBestAction, status, lat, lng, lastVisit)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, $15)`,
      [id, req.user.id, type, name, location, 'Medium', 50, 'Newly added', null, crop, nextBestAction, 'pending', 16.5, 80.3, 'Never']
    );
    
    return res.status(201).json({ success: true, message: 'Visit added' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
