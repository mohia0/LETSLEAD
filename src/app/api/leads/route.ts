import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const db_id = searchParams.get('db_id') || '1';
    const leads = db.prepare('SELECT * FROM leads WHERE db_id = ? ORDER BY savedAt DESC LIMIT 500').all(db_id);
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, ids, target_db_id } = body;

    if (action === 'MOVE' && ids && Array.isArray(ids) && target_db_id) {
       const placeholders = ids.map(() => '?').join(',');
       const stmt = db.prepare(`UPDATE leads SET db_id = ? WHERE id IN (${placeholders})`);
       stmt.run(target_db_id, ...ids);
       return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Move error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { ids, db_id } = body;
    
    if (ids && Array.isArray(ids)) {
      if (ids.length === 0) return NextResponse.json({ success: true });
      const placeholders = ids.map(() => '?').join(',');
      const stmt = db.prepare(`DELETE FROM leads WHERE id IN (${placeholders})`);
      stmt.run(...ids);
      return NextResponse.json({ success: true });
    }

    // Clear by db_id?
    if (db_id) {
      db.prepare('DELETE FROM leads WHERE db_id = ?').run(db_id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'No IDs or db_id provided' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Delete error' }, { status: 500 });
  }
}
