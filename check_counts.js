const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'leads.db');
const db = new Database(dbPath);

try {
    const dbs = db.prepare("SELECT * FROM databases").all();
    console.log("Databases count:", dbs.length);
    console.log("Databases list:", JSON.stringify(dbs));

    const leadsCount = db.prepare("SELECT COUNT(*) as count FROM leads WHERE db_id = 1").get();
    console.log("Leads in db_id=1:", leadsCount.count);
} catch (e) {
    console.error("Error:", e.message);
}
db.close();
