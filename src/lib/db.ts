import Database from 'better-sqlite3';
import path from 'path';

// Store DB in the project root
const dbPath = path.resolve(process.cwd(), 'leads.db');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    savedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(businessName, city, country)
  );
`);

// Support Migrations
const columnsToAdd = [
  { name: 'category', type: 'TEXT' },
  { name: 'socials', type: 'TEXT' },
  { name: 'rating', type: 'REAL' },
  { name: 'reviews', type: 'INTEGER' },
  { name: 'savedAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
];

for (const col of columnsToAdd) {
  try {
    db.exec(`ALTER TABLE leads ADD COLUMN ${col.name} ${col.type}`);
  } catch (e) {}
}

export default db;
