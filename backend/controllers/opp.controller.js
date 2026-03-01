import db from '../config/db.js';

export const getAllOpps = (req, res) => {
  try {
    const { category, city } = req.query;
    let query = `
      SELECT o.*, org.name as org_name, org.logo_url as org_logo 
      FROM opportunities o 
      JOIN organizations org ON o.org_id = org.id
    `;
    const params = [];

    if (category) {
      query += ' WHERE o.category = ?';
      params.push(category);
    }
    if (city) {
      query += (params.length ? ' AND' : ' WHERE') + ' o.location = ?';
      params.push(city);
    }

    const opps = db.prepare(query).all(...params);
    res.json(opps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOppById = (req, res) => {
  try {
    const opp = db.prepare(`
      SELECT o.*, org.name as org_name, org.logo_url as org_logo, org.description as org_desc
      FROM opportunities o 
      JOIN organizations org ON o.org_id = org.id
      WHERE o.id = ?
    `).get(req.params.id);
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
    res.json(opp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
