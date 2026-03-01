import db from '../config/db.js';

export const getAllOrgs = (req, res) => {
  try {
    const { city, focus } = req.query;
    let query = 'SELECT * FROM organizations WHERE is_approved = 1';
    const params = [];

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }
    if (focus) {
      query += ' AND focus_area = ?';
      params.push(focus);
    }

    const orgs = db.prepare(query).all(...params);
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrgById = (req, res) => {
  try {
    const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
