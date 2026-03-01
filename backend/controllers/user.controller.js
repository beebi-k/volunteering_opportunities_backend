import db from '../config/db.js';

export const getProfile = (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, avatar_url, phone, bio, interests, skills, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = (req, res) => {
  try {
    const { name, phone, bio, interests, skills, avatar_url } = req.body;
    db.prepare(`
      UPDATE users 
      SET name = ?, phone = ?, bio = ?, interests = ?, skills = ?, avatar_url = ?
      WHERE id = ?
    `).run(name, phone, bio, interests, skills, avatar_url, req.user.id);
    
    const updatedUser = db.prepare('SELECT id, name, email, role, avatar_url, phone, bio, interests, skills, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = (req, res) => {
  try {
    const hours = db.prepare('SELECT SUM(hours) as total FROM volunteer_hours WHERE volunteer_id = ?').get(req.user.id);
    const applications = db.prepare('SELECT COUNT(*) as count FROM applications WHERE volunteer_id = ?').get(req.user.id);
    
    // Mock data for charts
    const hoursByMonth = [
      { month: 'Jan', hours: 10 },
      { month: 'Feb', hours: 15 },
      { month: 'Mar', hours: 8 },
      { month: 'Apr', hours: 22 },
      { month: 'May', hours: 18 },
      { month: 'Jun', hours: 25 },
    ];

    const hoursByCategory = [
      { name: 'Education', value: 40 },
      { name: 'Environment', value: 30 },
      { name: 'Health', value: 20 },
      { name: 'Community', value: 10 },
    ];

    res.json({
      totalHours: hours.total || 0,
      totalApplications: applications.count || 0,
      hoursByMonth,
      hoursByCategory,
      badges: [
        { id: 1, name: '10 Hours Badge', icon: 'Award', earned: (hours.total || 0) >= 10 },
        { id: 2, name: '50 Hours Badge', icon: 'Shield', earned: (hours.total || 0) >= 50 },
        { id: 3, name: 'Community Champion', icon: 'Star', earned: applications.count >= 5 },
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
