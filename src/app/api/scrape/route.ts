import { NextResponse } from 'next/server';
import { runScrapeJob } from '@/lib/scraper';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { industry, country, city, targetLeads, activeDbId, allowGlobalDuplicates, autoSave } = body;

    if (!industry || !country || !city || !targetLeads) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const jobId = Math.random().toString(36).substring(2, 15);

    // Fire and forget (Start the scraping loop in background)
    // In Vercel serverless this might be killed, but since we are running locally/VPS it will continue.
    runScrapeJob({
      jobId,
      industry,
      country,
      city,
      targetLeads: parseInt(targetLeads, 10),
      activeDbId: activeDbId || 1,
      allowGlobalDuplicates: !!allowGlobalDuplicates,
      autoSave: !!autoSave
    });

    return NextResponse.json({ jobId });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
