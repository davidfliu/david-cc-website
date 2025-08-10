// Minimal click logger. Enhance by forwarding to GA4/Segment or a DB.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Basic validation
    if (!body || !body.cardId || !body.action) {
      return new Response("Invalid payload", { status: 400 });
    }
    // Server-side log (visible in Vercel logs)
    console.log("[dccr/click]", {
      action: body.action,
      cardId: body.cardId,
      cardName: body.cardName,
      path: body.path,
      ts: body.ts,
      answers: body.answers,
      referrer: body.referrer,
      ua: body.ua,
    });

    // TODO: (optional) Forward to GA4 Measurement Protocol
    // if (process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) { ... }

    return new Response(null, { status: 204 });
  } catch (e) {
    return new Response("Bad Request", { status: 400 });
  }
}