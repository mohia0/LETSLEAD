import { EventEmitter } from 'events';

const globalForEvents = global as unknown as { 
  scraperEvents: EventEmitter,
  stoppedJobs: Set<string>
};

export const scraperEvents = globalForEvents.scraperEvents || new EventEmitter();
export const STOPPED_JOBS = globalForEvents.stoppedJobs || new Set<string>();

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.scraperEvents = scraperEvents;
  globalForEvents.stoppedJobs = STOPPED_JOBS;
}
