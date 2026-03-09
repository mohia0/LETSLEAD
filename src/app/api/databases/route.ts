import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const dbs = db.prepare('SELECT * FROM databases ORDER BY id ASC').all();
    return NextResponse.json(dbs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch databases' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    
    const stmt = db.prepare('INSERT INTO databases (name) VALUES (?)');
    const info = stmt.run(name);
    return NextResponse.json({ id: info.lastInsertRowid, name });
  } catch (error) {
    return NextResponse.json({ error: 'Database name must be unique' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (id === 1) return NextResponse.json({ error: 'Cannot delete main database' }, { status: 403 });
    
    // Move leads back to main or just delete?
    // User said "we can't delete it (main)", implying we can delete others.
    // Let's delete it and its leads for now to be safe, or move to main?
    // Most users expect moving leads or deleting them. Let's delete to keep it simple unless specified.
    db.prepare('DELETE FROM leads WHERE db_id = ?').run(id);
    db.prepare('DELETE FROM databases WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete database' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name } = await req.json();
    if (!id || !name) return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
    
    db.prepare('UPDATE databases SET name = ? WHERE id = ?').run(name, id);
    return NextResponse.json({ success: true, id, name });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to rename database' }, { status: 500 });
  }
}
