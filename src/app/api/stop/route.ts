import { NextResponse } from 'next/server';
import { STOPPED_JOBS } from '@/lib/events';

export async function POST(req: Request) {
  try {
    const { jobId } = await req.json();
    if (jobId) {
      STOPPED_JOBS.add(jobId);
      return NextResponse.json({ success: true, message: 'Job stop signal sent' });
    }
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
