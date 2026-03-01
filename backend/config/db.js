import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure database path is correct and file exists
const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize Tables
export const initDB = () => {
  try {
    // Users Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('volunteer', 'organization', 'admin')) NOT NULL,
        avatar_url TEXT,
        phone TEXT,
        bio TEXT,
        interests TEXT, -- Stored as comma-separated values or JSON string
        skills TEXT,    -- Stored as comma-separated values or JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Organizations Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        city TEXT,
        state TEXT,
        address TEXT,
        pincode TEXT,
        latitude REAL,
        longitude REAL,
        website TEXT,
        contact_email TEXT,
        focus_area TEXT,
        logo_url TEXT,
        is_approved INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Opportunities Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id TEXT PRIMARY KEY,
        org_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT,
        date DATETIME,
        required_skills TEXT,
        available_slots INTEGER,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
      )
    `);

    // Applications Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        opp_id TEXT NOT NULL,
        volunteer_id TEXT NOT NULL,
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (opp_id) REFERENCES opportunities(id) ON DELETE CASCADE,
        FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Volunteer Hours Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS volunteer_hours (
        id TEXT PRIMARY KEY,
        volunteer_id TEXT NOT NULL,
        opp_id TEXT NOT NULL,
        hours REAL NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (opp_id) REFERENCES opportunities(id) ON DELETE CASCADE
      )
    `);

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err.message);
    process.exit(1); // Stop server if DB init fails
  }
};

export default db;