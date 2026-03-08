import Database from 'better-sqlite3';
import path from 'path';

// Store DB in the project root
const dbPath = path.resolve(process.cwd(), 'leads.db');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS databases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  INSERT OR IGNORE INTO databases (id, name) VALUES (1, 'Main Database');

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    db_id INTEGER DEFAULT 1 REFERENCES databases(id),
    businessName TEXT NOT NULL,
    website TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    googleMapsLink TEXT,
    city TEXT,
    country TEXT,
    source TEXT,
    category TEXT,
    socials TEXT,
    rating REAL,
    reviews INTEGER,
    image TEXT,
    savedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(businessName, city, country, db_id)
  );
`);

// Support Migrations
// Support Migrations
const migrations = [
  { name: 'category', type: 'TEXT' },
  { name: 'socials', type: 'TEXT' },
  { name: 'rating', type: 'REAL' },
  { name: 'reviews', type: 'INTEGER' },
  { name: 'image', type: 'TEXT' },
  { name: 'savedAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
  { name: 'db_id', type: 'INTEGER DEFAULT 1' } // SQLite doesn't support REFERENCES in ALTER TABLE ADD COLUMN
];

for (const col of migrations) {
  try {
    db.exec(`ALTER TABLE leads ADD COLUMN ${col.name} ${col.type}`);
  } catch (e) {}
}

// Emergency cleanup to ensure visibility
try {
  db.prepare('UPDATE leads SET db_id = 1 WHERE db_id IS NULL OR db_id = 0').run();
} catch (e) {}

export default db;
