import { NextRequest } from 'next/server';

// Rate limiting using simple in-memory store (for production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_MINUTE = 30;
const MAX_PAYLOAD_SIZE = 1024 * 5; // 5KB limit

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || req.headers.get('x-real-ip') 
    || 'unknown';
}

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const key = `click:${clientIP}`;
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute
    return false;
  }
  
  if (current.count >= MAX_REQUESTS_PER_MINUTE) {
    return true;
  }
  
  current.count++;
  return false;
}

function sanitizeString(input: unknown, maxLength: number): string {
  if (typeof input !== 'string') return '';
  return input.substring(0, maxLength).replace(/[\x00-\x1F\x7F-\x9F]/g, '');
}

function validateAction(action: unknown): action is 'apply' | 'copy_link' {
  return typeof action === 'string' && ['apply', 'copy_link'].includes(action);
}

function validateAnswers(answers: unknown): answers is { priority: string; feeComfort: string; redemption: string } {
  if (!answers || typeof answers !== 'object' || answers === null) return false;
  
  const a = answers as Record<string, unknown>;
  
  const validPriorities = ["one_card", "dining_groceries", "flights_hotels", "everything_else"];
  const validFeeComfort = ["any", "$", "$$", "$$$", "$$$$"];
  const validRedemption = ["points", "cashback", "simple"];
  
  return (
    typeof a.priority === 'string' && validPriorities.includes(a.priority) &&
    typeof a.feeComfort === 'string' && validFeeComfort.includes(a.feeComfort) &&
    typeof a.redemption === 'string' && validRedemption.includes(a.redemption)
  );
}

function validateCardId(cardId: unknown): boolean {
  return typeof cardId === 'string' && 
         cardId.length > 0 && 
         cardId.length <= 100 && 
         /^[a-zA-Z0-9_-]+$/.test(cardId);
}

// Enhanced click logger with security improvements
export async function POST(req: NextRequest) {
  try {
    // Check content length
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
      return new Response("Payload too large", { status: 413 });
    }

    // Rate limiting
    const clientIP = getClientIP(req);
    if (isRateLimited(clientIP)) {
      return new Response("Rate limit exceeded", { status: 429 });
    }

    const body = await req.json();
    
    // Enhanced validation
    if (!body || typeof body !== 'object') {
      return new Response("Invalid payload format", { status: 400 });
    }

    if (!validateAction(body.action)) {
      return new Response("Invalid action", { status: 400 });
    }

    if (!validateCardId(body.cardId)) {
      return new Response("Invalid cardId", { status: 400 });
    }

    // Enhanced validation and sanitization
    const sanitizedData = {
      action: body.action,
      cardId: sanitizeString(body.cardId, 100),
      cardName: sanitizeString(body.cardName, 200),
      path: sanitizeString(body.path, 500),
      ts: typeof body.ts === 'number' && body.ts > 0 && body.ts <= Date.now() + 60000 ? body.ts : Date.now(), // Allow 1 minute future tolerance
      answers: body.answers && validateAnswers(body.answers) ? {
        priority: body.answers.priority,
        feeComfort: body.answers.feeComfort,
        redemption: body.answers.redemption
      } : null,
      referrer: sanitizeString(body.referrer, 300),
      ua: sanitizeString(body.ua, 500),
      clientIP: clientIP.startsWith('::ffff:') ? clientIP.substring(7) : clientIP // IPv4-mapped IPv6
    };

    // Validate that we have required data
    if (!sanitizedData.answers) {
      return new Response("Invalid answers format", { status: 400 });
    }

    // Server-side log (visible in Vercel logs)
    console.log("[dccr/click]", sanitizedData);

    // TODO: (optional) Forward to GA4 Measurement Protocol
    // if (process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) { ... }

    return new Response(null, { status: 204 });
  } catch (e) {
    // Log full error server-side but don't expose to client
    console.error('Click tracking error:', e);
    return new Response("Bad Request", { status: 400 });
  }
}

// Cleanup old rate limit entries periodically with memory protection
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRIES = 10000; // Prevent unbounded growth

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(rateLimitStore.entries());
    
    // Clean expired entries
    for (const [key, value] of entries) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
    
    // Emergency cleanup if too many entries remain
    if (rateLimitStore.size > MAX_ENTRIES) {
      const sorted = entries
        .filter(([_, value]) => now <= value.resetTime) // Only non-expired entries
        .sort((a, b) => a[1].resetTime - b[1].resetTime);
      const toDelete = sorted.slice(0, rateLimitStore.size - MAX_ENTRIES);
      toDelete.forEach(([key]) => rateLimitStore.delete(key));
    }
  }, CLEANUP_INTERVAL_MS);
}