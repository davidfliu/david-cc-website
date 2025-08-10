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

    // Sanitize and validate other fields
    const sanitizedData = {
      action: body.action,
      cardId: sanitizeString(body.cardId, 100),
      cardName: sanitizeString(body.cardName, 200),
      path: sanitizeString(body.path, 500),
      ts: typeof body.ts === 'number' && body.ts > 0 ? body.ts : Date.now(),
      answers: body.answers && typeof body.answers === 'object' ? {
        priority: sanitizeString(body.answers.priority, 50),
        feeComfort: sanitizeString(body.answers.feeComfort, 20),
        redemption: sanitizeString(body.answers.redemption, 20)
      } : null,
      referrer: sanitizeString(body.referrer, 300),
      ua: sanitizeString(body.ua, 500),
      clientIP: clientIP.startsWith('::ffff:') ? clientIP.substring(7) : clientIP // IPv4-mapped IPv6
    };

    // Server-side log (visible in Vercel logs)
    console.log("[dccr/click]", sanitizedData);

    // TODO: (optional) Forward to GA4 Measurement Protocol
    // if (process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) { ... }

    return new Response(null, { status: 204 });
  } catch (e) {
    console.error('Click tracking error:', e instanceof Error ? e.message : 'Unknown error');
    return new Response("Bad Request", { status: 400 });
  }
}

// Cleanup old rate limit entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000); // Clean up every 5 minutes
}