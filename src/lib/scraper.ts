import { chromium, BrowserContext } from 'playwright';
import { scraperEvents, STOPPED_JOBS } from './events';
import db from './db';

type ScrapeParams = {
  jobId: string;
  industry: string;
  country: string;
  city: string;
  targetLeads: number;
  activeDbId?: number;
  allowGlobalDuplicates?: boolean;
  autoSave?: boolean;
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function emitLog(jobId: string, level: 'INFO' | 'ACTION' | 'SUCCESS' | 'WARNING' | 'ERROR', message: string, payload?: any) {
  scraperEvents.emit('log', {
    jobId, type: 'LOG', level, message, payload, timestamp: new Date().toISOString()
  });
}

function emitLead(jobId: string, lead: any) {
  scraperEvents.emit('log', { jobId, type: 'LEAD', payload: lead });
}

function emitEnd(jobId: string, success: boolean) {
  scraperEvents.emit('log', {
    jobId, type: success ? 'END' : 'ERROR',
    message: success ? 'Scraping Process Terminated' : 'Discovery failed abruptly'
  });
}

// Deep Intelligence Hack: Crate for Emails & Socials
async function deepCrawl(browser: any, website: string, jobId: string): Promise<{ emails: string[], socials: string[] }> {
    let emails: string[] = [];
    let socials: string[] = [];
    let context: BrowserContext | null = null;
    
    try {
        context = await browser.newContext({ 
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' 
        });

        if (context) {
          // ⚡ SPEED BOOST 1: Block heavy assets
          await context.route('**/*.{png,jpg,jpeg,gif,svg,webp,css,woff,woff2,ttf,otf,ico}', route => route.abort());
        }
        
        const targets = [website];
        if (!website.endsWith('/')) {
            targets.push(website + '/contact', website + '/contact-us', website + '/about');
        }

        // ⚡ SPEED BOOST 2: Parallel scanning of targets
        await Promise.all(targets.map(async (url) => {
            if (!context) return;
            const page = await context.newPage();
            try {
                await page.goto(url, { timeout: 10000, waitUntil: 'domcontentloaded' });
                const content = await page.content();
                
                const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
                const matches = content.match(emailRegex);
                if (matches) {
                    const filtered = matches.filter(e => !e.toLowerCase().match(/\.(png|jpg|jpeg|gif|svg|webp|pdf|css|js)$/));
                    emails.push(...filtered);
                }

                const links = await page.evaluate(() => 
                    Array.from(document.querySelectorAll('a'))
                        .filter(a => a.href)
                        .map(a => ({ href: a.href, text: a.textContent?.toLowerCase() || '' }))
                );

                const socialPatterns = [
                   { key: 'facebook', regex: /facebook\.com/i },
                   { key: 'instagram', regex: /instagram\.com/i },
                   { key: 'linkedin', regex: /linkedin\.com/i },
                   { key: 'twitter', regex: /twitter\.com/i },
                   { key: 'x', regex: /x\.com/i },
                   { key: 'youtube', regex: /youtube\.com/i },
                   { key: 'tiktok', regex: /tiktok\.com/i }
                ];
                
                links.forEach(link => {
                   socialPatterns.forEach(pattern => {
                      if (pattern.regex.test(link.href) || link.text.includes(pattern.key)) {
                         socials.push(link.href);
                      }
                   });
                });
            } catch (e) { } finally {
                await page.close();
            }
        }));
    } catch (e) {} finally {
        if (context) await context.close();
    }
    
    return { 
        emails: [...new Set(emails)], 
        socials: [...new Set(socials)] 
    };
}

export async function runScrapeJob(params: ScrapeParams) {
  const { jobId, industry, country, city, targetLeads } = params;
  emitLog(jobId, 'INFO', `⚡ [SYSTEM] Target identified: ${industry} in ${city}. Mandatory contact filters active.`);
  
  try {
    const browser = await chromium.launch({ headless: true });
    emitLog(jobId, 'ACTION', '🖥️ [BROWSER] Initializing Isolated Playwright Instance...');
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    const query = `${industry} in ${city}, ${country}`;
    
    emitLog(jobId, 'ACTION', `🌐 [NAVIGATE] Targeting Maps for: ${query}`);
    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
    
    emitLog(jobId, 'INFO', '📡 [SCAN] Waiting for result handshakes...');
    await sleep(4000); 

    const acceptCookies = page.getByRole('button', { name: /Accept all|I agree/i });
    if (await acceptCookies.isVisible().catch(() => false)) {
      emitLog(jobId, 'INFO', '🛡️ [AUTH] Bypassing Google consent walls...');
      await acceptCookies.click().catch(() => {});
    }

    const leadsCollected = new Set<string>();

    for (let i = 0; i < 50; i++) { 
        const entries = page.locator('a[href*="/maps/place/"]');
        const count = await entries.count();

        for (let j = 0; j < count; j++) {
            if (STOPPED_JOBS.has(jobId) || leadsCollected.size >= targetLeads) break;

            const element = entries.nth(j);
            const businessName = await element.getAttribute('aria-label') || '';
            if (!businessName || leadsCollected.has(businessName)) continue;
            
            try {
                // FORCE CLICK AND SYNC
                emitLog(jobId, 'ACTION', `🔍 [SYNC] Accessing detail panel for: ${businessName}`);
                await element.click({ force: true });
                
                // PANEL SYNC LOOP
                let data: any = null;
                for (let syncRetry = 0; syncRetry < 5; syncRetry++) {
                    await sleep(1500); 
                    data = await page.evaluate((targetName: string) => {
                        const h1s = Array.from(document.querySelectorAll('h1'));
                        // Robust match: Search all H1s for the business name
                        const matchingH1 = h1s.find(h => {
                            const txt = h.textContent?.toLowerCase() || '';
                            const words = targetName.toLowerCase().split(/\s+/).filter(w => w.length > 1);
                            // Check if at least 2 words match, or the first word if it's long
                            const matchCount = words.filter(w => txt.includes(w)).length;
                            return matchCount >= Math.min(words.length, 2);
                        });

                        if (!matchingH1) return null;
                        const panelTitle = matchingH1.textContent?.trim() || '';
                        
                        // Find the panel containing or related to this H1
                        const panel = matchingH1.closest('[role="main"]') || document.querySelector('[role="main"]');
                        if (!panel) return null;

                        let phone = '', website = '', address = '', category = '', rating = 0, reviews = 0;
                        
                        // PHONE EXTRACTION (Priority: data-item-id, aria-label, tel: links, text search)
                        const phoneEl = panel.querySelector('[data-item-id^="phone:tel:"]');
                        if (phoneEl) {
                            phone = phoneEl.getAttribute('data-item-id')?.replace('phone:tel:', '') || '';
                        }
                        if (!phone) {
                            const anyPhone = Array.from(panel.querySelectorAll('button[aria-label*="Phone"], a[aria-label*="Phone"], button[aria-label*="الهاتف"], a[aria-label*="الهاتف"]'));
                            for (const el of anyPhone) {
                                const aria = el.getAttribute('aria-label') || '';
                                phone = aria.replace(/Phone:?|الهاتف:?/i, '').trim();
                                if (phone) break;
                            }
                        }
                        if (!phone) {
                            const telLink = panel.querySelector('a[href^="tel:"]');
                            if (telLink) phone = telLink.getAttribute('href')?.replace('tel:', '') || '';
                        }

                        // WEBSITE EXTRACTION (Priority: authority ID, data-tooltip)
                        const webEl = panel.querySelector('a[data-item-id="authority"]');
                        if (webEl) website = webEl.getAttribute('href') || '';
                        if (!website) {
                            const webBtn = panel.querySelector('a[data-tooltip*="website"], button[data-tooltip*="website"]');
                            if (webBtn) website = webBtn.getAttribute('href') || '';
                        }

                        // SOCIALS EXTRACTION (Directly from Maps panel if present)
                        let mapsSocials: string[] = [];
                        const socialLinks = Array.from(panel.querySelectorAll('a[href*="facebook.com"], a[href*="instagram.com"], a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="x.com"], a[href*="youtube.com"], a[href*="tiktok.com"]'));
                        socialLinks.forEach(link => {
                            const href = link.getAttribute('href');
                            if (href) mapsSocials.push(href);
                        });

                        // DATA EXTRACTION (Category, Rating, Reviews)
                        category = panel.querySelector('button[jsaction*="category"]')?.textContent?.trim() || '';
                        
                        // Stage 1: Standard ARIA Label Selection
                        const ratingEl = panel.querySelector('span[role="img"][aria-label*="stars"], span[role="img"][aria-label*="نجوم"], span[aria-label*="stars"]');
                        const ratingStr = ratingEl ? ratingEl.getAttribute('aria-label') || '' : '';
                        
                        const rMatch = ratingStr.match(/([0-9,.]+)\s*(?:stars|نجوم|star)/i);
                        if (rMatch) rating = parseFloat(rMatch[1].replace(',', '.'));
                        
                        const reviewMatch = ratingStr.match(/([0-9.,]+)\s*(?:Reviews|Review|مراجعة|مراجعات)/i);
                        if (reviewMatch) reviews = parseInt(reviewMatch[1].replace(/[.,]/g, ''), 10);

                        // Stage 2: Parent Row Fallback (Catches visually adjacent formats like "4.8 (1,234)")
                        if (!rating || !reviews) {
                            const elements = Array.from(panel.querySelectorAll('div, span'));
                            for (const el of elements) {
                                const txt = el.textContent?.trim() || '';
                                if (txt.length < 40 && txt.includes('(') && txt.includes(')')) {
                                    const fallRating = txt.match(/([0-9][.,][0-9])\s*\(/);
                                    if (fallRating && !rating) rating = parseFloat(fallRating[1].replace(',', '.'));
                                    
                                    const fallReviews = txt.match(/\(([0-9.,]+)\)/);
                                    if (fallReviews && !reviews) reviews = parseInt(fallReviews[1].replace(/[.,]/g, ''), 10);
                                    
                                    if (rating && reviews) break;
                                }
                            }
                        }

                        // Stage 3: Isolated Span Fallback (Aggressive final sweep)
                        if (!rating) {
                            const isolateRating = Array.from(panel.querySelectorAll('span')).find(s => {
                                const t = s.textContent?.trim() || '';
                                return /^[0-5][.,][0-9]$/.test(t);
                            });
                            if (isolateRating) rating = parseFloat(isolateRating.textContent!.replace(',', '.'));
                        }

                        if (!reviews) {
                            const isolateReviews = Array.from(panel.querySelectorAll('span')).find(s => {
                                const t = s.textContent?.trim() || '';
                                return /^\([0-9.,]+\)$/.test(t);
                            });
                            if (isolateReviews) reviews = parseInt(isolateReviews.textContent!.replace(/[().,]/g, ''), 10);
                        }

                        // IMAGE EXTRACTION
                        let image = '';
                        const imgEl = panel.querySelector('button[jsaction*="photo"] img, [role="img"] img, .m67q60-image-view img');
                        if (imgEl) {
                          image = imgEl.getAttribute('src') || '';
                          if (image.startsWith('//')) image = 'https:' + image;
                        }

                        return { phone, website, category, rating, reviews, panelTitle, mapsSocials: [...new Set(mapsSocials)], image };
                    }, businessName);

                    if (data) break;
                }

                if (!data) {
                    emitLog(jobId, 'WARNING', `🕒 [TIMEOUT] Panel sync failed for ${businessName}. Skipping.`);
                    continue;
                }

                if (data.phone) data.phone = data.phone.replace(/[^\d+x\s-]/g, '').trim();

                let { phone, website, category, rating, reviews, mapsSocials, image } = data;
                let emails: string[] = [];
                let socials: string[] = [...(mapsSocials || [])];

                if (website) {
                    emitLog(jobId, 'ACTION', `🕵️ [CRAWL] Deep scanning assets at ${website}`);
                    const intel = await deepCrawl(browser, website, jobId);
                    emails = intel.emails;
                    socials.push(...intel.socials);
                }
                
                socials = [...new Set(socials)];

                // CRITICAL FILTER: MANDATORY CONTACT INTEL
                if (!phone && emails.length === 0) {
                    emitLog(jobId, 'WARNING', `⏭️ [FILTER] Discarding ${businessName}: Incomplete contact fingerprint.`);
                    continue; 
                }

                // DEDUPLICATION PROTOCOL
                let skip = false;
                if (!params.allowGlobalDuplicates) {
                   // Reject if it exists ANYWHERE
                   const exist = db.prepare('SELECT id FROM leads WHERE businessName = ? AND city = ? AND country = ? LIMIT 1').get(businessName, city, country);
                   if (exist) skip = true;
                } else {
                   // Reject ONLY if it exists in the active target database
                   const exist = db.prepare('SELECT id FROM leads WHERE businessName = ? AND city = ? AND country = ? AND db_id = ? LIMIT 1').get(businessName, city, country, params.activeDbId || 1);
                   if (exist) skip = true;
                }

                if (skip) {
                   emitLog(jobId, 'WARNING', `⏩ [SKIP] Duplicate: ${businessName}`);
                   continue;
                }

                const finalLead = {
                    businessName, website, email: emails.join(', '), phone, address: '', 
                    googleMapsLink: await element.getAttribute('href'), city, country,
                    source: 'Deep Discovery Engine v3', category, socials: socials.join(', '),
                    rating, reviews, image
                };

                try {
                  const targetDb = params.autoSave ? (params.activeDbId || 1) : 0; // 0 = temp buffer in DB
                  const info = db.prepare(`
                      INSERT INTO leads (businessName, website, email, phone, googleMapsLink, city, country, source, category, socials, rating, reviews, image, db_id)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                  `).run(
                    finalLead.businessName, finalLead.website, finalLead.email, finalLead.phone, 
                    finalLead.googleMapsLink, finalLead.city, finalLead.country, finalLead.source,
                    finalLead.category, finalLead.socials, finalLead.rating, finalLead.reviews, finalLead.image, targetDb
                  );
                  
                  leadsCollected.add(businessName);
                  emitLead(jobId, { ...finalLead, id: info.lastInsertRowid.toString() });
                  emitLog(jobId, 'SUCCESS', `💎 [SECURED] Intelligence secured for: ${businessName}`);
                } catch(e) {
                  emitLog(jobId, 'WARNING', `⏩ [SKIP] Duplicate: ${businessName}`);
                }
            } catch(e) {}
        }
        
        if (leadsCollected.size >= targetLeads || STOPPED_JOBS.has(jobId)) break;
        const feed = page.locator('[role="feed"]');
        if (await feed.isVisible()) { await feed.press('End'); await sleep(3000); }
    }
    
    emitLog(jobId, 'SUCCESS', `✅ [COMPLETE] Extraction finished. ${leadsCollected.size} high-quality leads secured.`);
    await browser.close();
    emitEnd(jobId, true);
  } catch(error) {
    emitLog(jobId, 'ERROR', `☢️ [CRITICAL] ${(error as Error).message}`);
    emitEnd(jobId, false);
  } finally {
    STOPPED_JOBS.delete(jobId);
  }
}
