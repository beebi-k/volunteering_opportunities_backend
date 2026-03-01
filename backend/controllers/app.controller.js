import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';

export const apply = (req, res) => {
  try {
    const { opp_id } = req.body;
    const volunteer_id = req.user.id;

    const existing = db.prepare('SELECT * FROM applications WHERE opp_id = ? AND volunteer_id = ?').get(opp_id, volunteer_id);
    if (existing) return res.status(400).json({ message: 'Already applied' });

    const id = uuidv4();
    db.prepare('INSERT INTO applications (id, opp_id, volunteer_id) VALUES (?, ?, ?)').run(id, opp_id, volunteer_id);

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyApplications = (req, res) => {
  try {
    const apps = db.prepare(`
      SELECT a.*, o.title as opp_title, org.name as org_name
      FROM applications a
      JOIN opportunities o ON a.opp_id = o.id
      JOIN organizations org ON o.org_id = org.id
      WHERE a.volunteer_id = ?
    `).all(req.user.id);
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
