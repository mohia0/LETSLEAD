import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const leads = db.prepare('SELECT * FROM leads ORDER BY savedAt DESC LIMIT 200').all();
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { ids } = body;
    
    if (ids && Array.isArray(ids)) {
      if (ids.length === 0) return NextResponse.json({ success: true });
      const placeholders = ids.map(() => '?').join(',');
      const stmt = db.prepare(`DELETE FROM leads WHERE id IN (${placeholders})`);
      stmt.run(...ids);
      return NextResponse.json({ success: true });
    }

    // Default: Clear All
    db.prepare('DELETE FROM leads').run();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete leads' }, { status: 500 });
  }
}
