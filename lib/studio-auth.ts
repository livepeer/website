import { createHash } from "crypto";

export type StudioAuthProvider = "github" | "google" | "email";

export interface StudioLoginProfile {
  provider: StudioAuthProvider;
  name: string;
  email: string;
  initials: string;
}

const MOCK_PROVIDER_PROFILES: Record<
  Exclude<StudioAuthProvider, "email">,
  { name: string; email: string }
> = {
  github: {
    name: "Studio Developer",
    email: "studio.github@example.com",
  },
  google: {
    name: "Studio Developer",
    email: "studio.google@example.com",
  },
};

export function toInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SU";
}

export function deriveExternalUserId(email: string): string {
  const digest = createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 24);
  return `ext_${digest}`;
}

export function resolveLoginProfile(input: {
  provider: StudioAuthProvider;
  email?: string;
  name?: string;
}): StudioLoginProfile {
  const provider = input.provider;
  const fallback = provider === "email" ? null : MOCK_PROVIDER_PROFILES[provider];

  const email = input.email?.trim() || fallback?.email || "studio.user@example.com";
  const displayName =
    input.name?.trim() || fallback?.name || email.split("@")[0] || "Studio User";

  return {
    provider,
    name: displayName,
    email,
    initials: toInitials(displayName),
  };
}
