const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'leads.db');
const db = new Database(dbPath);

try {
    console.log("Starting emergency data recovery...");

    // 1. Ensure databases table exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS databases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      INSERT OR IGNORE INTO databases (id, name) VALUES (1, 'Main Database');
    `);
    console.log("Confirmed 'databases' table and Main Database entry.");

    // 2. Add db_id column without FOREIGN KEY constraint (SQLite restriction)
    try {
        db.exec("ALTER TABLE leads ADD COLUMN db_id INTEGER DEFAULT 1");
        console.log("Successfully added 'db_id' column to leads table.");
    } catch (e) {
        if (e.message.includes("duplicate column name")) {
            console.log("'db_id' column already exists.");
        } else {
            throw e;
        }
    }

    // 3. Ensure all leads have db_id = 1
    const result = db.prepare("UPDATE leads SET db_id = 1 WHERE db_id IS NULL OR db_id = 0").run();
    console.log(`Updated ${result.changes} leads to point to Main Database (ID: 1).`);

    console.log("Data recovery complete. Your leads should now be visible.");

} catch (e) {
    console.error("Critical Recovery Error:", e.message);
}
db.close();
