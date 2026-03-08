import { scraperEvents } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');

  if (!jobId) {
    return new Response('Missing jobId', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const listener = (data: any) => {
        if (data.jobId === jobId) {
          const msg = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(msg));
          if (data.type === 'END' || data.type === 'ERROR') {
            // Close stream smoothly
            scraperEvents.off('log', listener);
            controller.close();
          }
        }
      };

      scraperEvents.on('log', listener);

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        scraperEvents.off('log', listener);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
