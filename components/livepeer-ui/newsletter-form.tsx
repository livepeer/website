"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "idle" | "sending" | "done" | "error";

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setError("");

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        company: form.get("company"),
      }),
    }).catch(() => null);

    if (res?.ok) {
      setStatus("done");
      return;
    }
    const data = (await res?.json().catch(() => null)) as {
      error?: string;
    } | null;
    setError(data?.error ?? "Could not subscribe right now. Try again later.");
    setStatus("error");
  }

  // Neutral on purpose: an address that unsubscribed earlier stays
  // unsubscribed (see the route), so this must not promise an issue.
  if (status === "done") {
    return (
      <div>
        <p className="text-sm font-medium">Newsletter</p>
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          Thanks for signing up.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xs">
      {/* The column's heading is the field's visible label (design.md:
          every input has a visible label). */}
      <label
        htmlFor="newsletter-email"
        className="mb-4 block text-sm font-medium"
      >
        Newsletter
      </label>
      {/* Wraps the button under the field when the footer column is too
          narrow for both (the 3-column tablet range). */}
      <div className="flex flex-wrap gap-2">
        <Input
          className="w-auto min-w-40 flex-1"
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          aria-invalid={status === "error" || undefined}
          aria-describedby={status === "error" ? "newsletter-error" : undefined}
        />
        {/* Honeypot — hidden from people and assistive tech; see the route. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <Button type="submit" disabled={status === "sending"}>
          Subscribe
        </Button>
      </div>
      {status === "error" && (
        <p
          id="newsletter-error"
          className="mt-2 text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  );
}
