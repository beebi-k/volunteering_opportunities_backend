import db from './db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const seedData = async () => {
  const rowCount = db.prepare('SELECT count(*) as count FROM users').get();
  
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Always ensure Admin exists
  const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@volunteerhub.in');
  if (!adminExists) {
    const adminId = uuidv4();
    db.prepare('INSERT INTO users (id, name, email, password, role, bio, interests, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      adminId, 'Admin User', 'admin@volunteerhub.in', hashedPassword, 'admin', 'System Administrator', 'Management, Tech', 'Leadership'
    );
  }

  // Always ensure Demo Volunteer exists
  const volunteerExists = db.prepare('SELECT * FROM users WHERE email = ?').get('sofia@example.com');
  if (!volunteerExists) {
    const volunteerId = uuidv4();
    db.prepare('INSERT INTO users (id, name, email, password, role, bio, interests, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      volunteerId, 'Sofia Volunteer', 'sofia@example.com', hashedPassword, 'volunteer', 'Passionate about education and child rights.', 'Education, Child Rights', 'Teaching, Communication'
    );
  }

  if (rowCount.count > 5) return; // Already seeded enough data

  console.log('Seeding additional database content...');

  const ngos = [
    { name: 'Goonj', city: 'Delhi', state: 'Delhi', focus: 'Disaster Relief & Rural Development', website: 'https://goonj.org', email: 'mail@goonj.org' },
    { name: 'CRY – Child Rights and You', city: 'Mumbai', state: 'Maharashtra', focus: 'Child Rights', website: 'https://www.cry.org', email: 'cryinfo.mum@crymail.org' },
    { name: 'Teach For India', city: 'Mumbai', state: 'Maharashtra', focus: 'Education', website: 'https://www.teachforindia.org', email: 'info@teachforindia.org' },
    { name: 'Smile Foundation', city: 'Delhi', state: 'Delhi', focus: 'Education & Healthcare', website: 'https://www.smilefoundationindia.org', email: 'info@smilefoundationindia.org' },
    { name: 'Akshaya Patra Foundation', city: 'Bangalore', state: 'Karnataka', focus: 'Food & Education', website: 'https://www.akshayapatra.org', email: 'infodesk@akshayapatra.org' },
    { name: 'HelpAge India', city: 'Delhi', state: 'Delhi', focus: 'Elderly Care', website: 'https://www.helpageindia.org', email: 'headoffice@helpageindia.org' },
    { name: 'Pratham', city: 'Mumbai', state: 'Maharashtra', focus: 'Education', website: 'https://www.pratham.org', email: 'info@pratham.org' },
    { name: 'WWF India', city: 'Delhi', state: 'Delhi', focus: 'Environment & Wildlife', website: 'https://www.wwfindia.org', email: 'contact@wwfindia.org' },
    { name: 'SEWA', city: 'Ahmedabad', state: 'Gujarat', focus: 'Women Empowerment', website: 'https://www.sewa.org', email: 'mail@sewa.org' },
    { name: 'Nanhi Kali', city: 'Mumbai', state: 'Maharashtra', focus: 'Girl Child Education', website: 'https://www.nanhikali.org', email: 'support@nanhikali.org' },
    { name: 'Make A Difference', city: 'Bangalore', state: 'Karnataka', focus: 'Youth Empowerment', website: 'https://makeadiff.in', email: 'contact@makeadiff.in' },
    { name: 'Uday Foundation', city: 'Delhi', state: 'Delhi', focus: 'Health & Disaster Relief', website: 'https://www.udayfoundation.org', email: 'info@udayfoundation.org' },
    { name: 'Bhumi', city: 'Chennai', state: 'Tamil Nadu', focus: 'Education & Environment', website: 'https://bhumi.ngo', email: 'contact@bhumi.ngo' },
    { name: 'Robin Hood Army', city: 'Multiple', state: 'Pan India', focus: 'Food Waste', website: 'https://robinhoodarmy.com', email: 'info@robinhoodarmy.com' },
    { name: 'Save The Children India', city: 'Delhi', state: 'Delhi', focus: 'Child Protection', website: 'https://www.savethechildren.in', email: 'info@savethechildren.in' },
    { name: 'Magic Bus', city: 'Mumbai', state: 'Maharashtra', focus: 'Livelihood & Education', website: 'https://www.magicbus.org', email: 'info@magicbus.org' },
    { name: 'GiveIndia', city: 'Bangalore', state: 'Karnataka', focus: 'Philanthropy', website: 'https://www.giveindia.org', email: 'info@giveindia.org' },
    { name: 'Laxmi Foundation', city: 'Delhi', state: 'Delhi', focus: 'Acid Attack Survivors', website: 'https://theluxmifoundation.org', email: 'info@theluxmifoundation.org' },
    { name: 'Sightsavers India', city: 'Delhi', state: 'Delhi', focus: 'Visual Impairment', website: 'https://www.sightsaversindia.in', email: 'indiaweb@sightsavers.org' },
    { name: 'Deepalaya', city: 'Delhi', state: 'Delhi', focus: 'Urban Poor Education', website: 'https://www.deepalaya.org', email: 'info@deepalaya.org' }
  ];

  for (const ngo of ngos) {
    const userId = uuidv4();
    const orgId = uuidv4();
    const email = ngo.email.toLowerCase();

    // Create User for Org
    db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(
      userId, ngo.name, email, hashedPassword, 'organization'
    );

    // Create Org Profile
    db.prepare(`
      INSERT INTO organizations (id, user_id, name, description, city, state, website, contact_email, focus_area, is_approved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      orgId, userId, ngo.name, `Leading NGO working in ${ngo.focus}`, ngo.city, ngo.state, ngo.website, email, ngo.focus
    );

    // Create 3-5 Opportunities for each Org
    const oppCount = Math.floor(Math.random() * 3) + 3;
    const skills = ['Communication', 'Teaching', 'Social Media', 'Event Management', 'Data Entry', 'Fundraising'];
    const categories = ['Education', 'Environment', 'Health', 'Community', 'Disaster Relief'];

    for (let i = 0; i < oppCount; i++) {
      const oppId = uuidv4();
      const skill = skills[Math.floor(Math.random() * skills.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 30) + 1);

      db.prepare(`
        INSERT INTO opportunities (id, org_id, title, description, location, date, required_skills, available_slots, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        oppId, orgId, `${ngo.name} - ${category} Drive`, `Join us for a ${category} initiative in ${ngo.city}.`, ngo.city, date.toISOString(), skill, 10 + i, category
      );
    }
  }

  console.log('Seeding completed.');
};
