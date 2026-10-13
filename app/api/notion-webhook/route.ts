import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { revalidateNotionSurfaces } from "../notion-surfaces";

/**
 * Notion tells us something changed, instead of us waiting to notice.
 *
 * This is a webhook subscription on the integration itself, which is not the
 * same thing as an automation inside the database. Automations exist to
 * perform actions and deliberately do not run on API edits, so an agent
 * updating a commitment triggers nothing. Webhooks are delivery rather than
 * action, and their payload identifies the author as `person`, `bot` or
 * `agent` — a distinction that would be pointless if bot edits produced no
 * events. Worth confirming by test rather than by reading: make an edit
 * through the API and see whether one arrives.
 *
 * Subscribing is an admin job, in the connection's Webhooks tab. See the
 * setup notes in content/roadmap/README.md.
 */

/**
 * Notion's handshake: on subscribing, it POSTs a one-off `verification_token`
 * rather than an event. That token is then the signing key for every event
 * after it, so it has to be captured and configured — it is not recoverable
 * later. Logged loudly for that reason: the setup step is "read it out of the
 * deployment logs and paste it into Vercel", and a quiet log makes that step
 * look impossible.
 *
 * It is a secret, and it goes to the log on purpose: the log is the only place
 * this endpoint can put it — the site has no store, and Notion shows it
 * nowhere. What holding it buys is the right to call this route, whose whole
 * effect is a page rebuilt early; and anyone who can read the deployment log
 * is a member of the project who can already read its environment, secret
 * included. It is written once, at the handshake, and never on an event.
 */
function handleVerification(token: string): NextResponse {
  console.log(
    `[notion-webhook] verification_token=${token}\n` +
      `[notion-webhook] Save this as NOTION_WEBHOOK_SECRET, then paste it ` +
      `into Notion's Webhooks tab to confirm the subscription. Events are ` +
      `rejected until it is set.`
  );
  return NextResponse.json({ received: true });
}

/**
 * HMAC-SHA256 of the raw body, keyed by the verification token.
 *
 * The raw text matters: re-serialising the parsed JSON would reorder or
 * reformat it and never match. Compared in constant time out of habit rather
 * than need — the consequence of forging one of these is a page rebuilt
 * early, not a page rewritten.
 */
function signatureMatches(raw: string, header: string, secret: string) {
  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<NextResponse> {
  const raw = await request.text();

  let body: { verification_token?: string; type?: string };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Body is not JSON." }, { status: 400 });
  }

  // The handshake arrives before there is a secret to verify against, so it
  // has to be handled before the signature check rather than after it.
  if (body.verification_token) {
    return handleVerification(body.verification_token);
  }

  const secret = process.env.NOTION_WEBHOOK_SECRET;
  if (!secret) {
    console.warn(
      "[notion-webhook] Event received but NOTION_WEBHOOK_SECRET is unset, " +
        "so it cannot be verified. Re-run the subscription handshake."
    );
    return NextResponse.json(
      { error: "NOTION_WEBHOOK_SECRET is not configured." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("x-notion-signature") ?? "";
  if (!signatureMatches(raw, signature, secret)) {
    // Logged rather than silent: a signature scheme that is subtly wrong
    // rejects every event and otherwise looks exactly like a webhook nobody
    // is sending to.
    console.warn(
      `[notion-webhook] Rejected ${body.type ?? "an event"}: signature did ` +
        `not match. If this is every event, NOTION_WEBHOOK_SECRET is stale — ` +
        `re-subscribe and capture the new token.`
    );
    return NextResponse.json({ error: "Bad signature." }, { status: 401 });
  }

  // Which database the event came from is not worth working out: the
  // integration sees six, an edit to one can move text on several addresses,
  // and one call clears every address rendered from any of them — the same
  // list the manual endpoint uses (../notion-surfaces.ts). Revalidating is
  // idempotent and costs a rebuild at worst.
  const paths = revalidateNotionSurfaces();
  return NextResponse.json({ revalidated: true, paths, type: body.type });
}
