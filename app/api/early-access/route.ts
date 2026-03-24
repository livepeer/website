import { NextResponse } from "next/server";

const API_KEY = process.env.MAILCHIMP_API_KEY!;
const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID!;
const TAG = process.env.MAILCHIMP_TAG || "v2 Website Signups";

// Extract datacenter from API key (e.g. "us16" from "xxx-us16")
const DC = API_KEY?.split("-").pop();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Add member to audience (or update if already exists)
    const res = await fetch(
      `https://${DC}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status: "subscribed",
          tags: [TAG],
        }),
      }
    );

    // 400 with "Member Exists" is fine — they're already subscribed
    if (!res.ok) {
      const data = await res.json();
      if (data.title !== "Member Exists") {
        console.error("Mailchimp error:", data);
        return NextResponse.json(
          { error: "Failed to subscribe" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Early access signup failed:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
