import { NextResponse } from "next/server";

/**
 * Newsletter signup from the footer form.
 *
 * Adds the address to Resend as a contact, then to the website-signups
 * segment. The weekly send targets segments, not All Contacts, so the
 * segment is what gets a signup the next issue.
 *
 * Creating a contact that already exists returns 201 with the same id and
 * leaves it as it was — including `unsubscribed`. That is deliberate: there
 * is no double opt-in here, so a form anyone can type into must not
 * resubscribe someone who unsubscribed.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Per-IP throttle: 5 attempts per 10 minutes. In memory, so it is per
 * function instance and resets on a cold start — it stops a script looping
 * against a warm instance, not a distributed one. A durable limit needs a
 * Vercel Firewall rate-limit rule on /api/newsletter, set in the dashboard.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, number[]>();

function throttled(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  // Rejected attempts are not recorded, so an IP's history never holds more
  // than MAX_ATTEMPTS entries however hard it is hammered.
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(ip, recent);
    return true;
  }
  recent.push(now);
  attempts.set(ip, recent);
  // Keep the map from growing without bound on a long-lived instance.
  if (attempts.size > 10_000) attempts.clear();
  return false;
}

const FAILED = "Could not subscribe right now. Try again later.";

/** fetch has no timeout of its own, so a hung Resend call would hold the
 *  visitor's request open until the function limit. */
async function resend(path: string, apiKey: string, body?: unknown) {
  return fetch(`https://api.resend.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(8000),
  });
}

function failed() {
  return NextResponse.json({ error: FAILED }, { status: 502 });
}

export async function POST(request: Request): Promise<NextResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
  if (!apiKey || !segmentId) {
    return NextResponse.json(
      { error: "Newsletter signup is not configured." },
      { status: 503 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (throttled(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const data = (await request.json().catch(() => null)) as {
    email?: unknown;
    company?: unknown;
  } | null;

  // Honeypot: the footer renders a hidden `company` field people never see.
  // A bot that fills it gets the same answer as a person, and nothing is sent.
  if (data?.company) return NextResponse.json({ ok: true });

  const email =
    typeof data?.email === "string" ? data.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  // Status codes only: Resend's error bodies can echo the address, and the
  // logs shouldn't hold subscribers' emails.
  try {
    const created = await resend("/contacts", apiKey, { email });
    const contact = (await created.json().catch(() => ({}))) as {
      id?: string;
    };
    if (!created.ok || !contact.id) {
      console.error("newsletter: create contact failed", created.status);
      return failed();
    }

    const added = await resend(
      `/contacts/${contact.id}/segments/${segmentId}`,
      apiKey
    );
    if (!added.ok) {
      console.error("newsletter: add to segment failed", added.status);
      return failed();
    }
  } catch (error) {
    console.error(
      "newsletter: Resend unreachable",
      error instanceof Error ? error.name : "unknown"
    );
    return failed();
  }

  return NextResponse.json({ ok: true });
}
