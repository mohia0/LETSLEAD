const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'leads.db');
const db = new Database(dbPath);

try {
    const tableInfo = db.prepare("PRAGMA table_info(leads)").all();
    console.log("Table structure:", JSON.stringify(tableInfo, null, 2));

    const totalLeads = db.prepare("SELECT COUNT(*) as count FROM leads").get();
    console.log("Total leads in table:", totalLeads.count);

    const dbIdCounts = db.prepare("SELECT db_id, COUNT(*) as count FROM leads GROUP BY db_id").all();
    console.log("Leads grouped by db_id:", JSON.stringify(dbIdCounts, null, 2));

    const databases = db.prepare("SELECT * FROM databases").all();
    console.log("Databases:", JSON.stringify(databases, null, 2));

    // Sample data to see if db_id is actually 1
    const sample = db.prepare("SELECT id, businessName, db_id FROM leads LIMIT 5").all();
    console.log("Sample leads:", JSON.stringify(sample, null, 2));

} catch (e) {
    console.error("Error:", e.message);
}
db.close();
