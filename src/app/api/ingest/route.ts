import { NextResponse } from "next/server";

/**
 * Analytics ingest endpoint.
 * Accepts events from trackEvent() and forwards to external analytics or logs in dev.
 * Stateless tokens: PATCH for invite status is a no-op; use this endpoint to record events.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const event = body.event as string | undefined;
    const properties = (body.properties ?? {}) as Record<string, unknown>;

    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", event, properties);
    }

    // Production: forward to Segment, Mixpanel, etc. via NEXT_PUBLIC_ANALYTICS_FORWARD_URL
    const forwardUrl = process.env.NEXT_PUBLIC_ANALYTICS_FORWARD_URL;
    if (forwardUrl && event) {
      await fetch(forwardUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, timestamp: new Date().toISOString() }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
