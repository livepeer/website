"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Pencil } from "lucide-react";
import { useAuth } from "@/components/dashboard/AuthContext";
import Dialog from "@/components/ui/Dialog";
import { SectionRow, FieldLabel } from "./SectionRow";

const PROVIDER_LABELS = {
  github: { name: "GitHub" },
  google: { name: "Google" },
  email: { name: "Email" },
} as const;

function GitHubGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}


export default function AccountTab() {
  const { user, updateUser, disconnect } = useAuth();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Local edit state
  const [emailDraft, setEmailDraft] = useState(user?.email ?? "");
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");
  const [savedFlash, setSavedFlash] = useState<"email" | "name" | "password" | null>(
    null,
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const isOAuth = user.provider !== "email";
  const providerInfo = PROVIDER_LABELS[user.provider];

  const flashSaved = (key: "email" | "name" | "password") => {
    setSavedFlash(key);
    setTimeout(() => setSavedFlash((s) => (s === key ? null : s)), 1500);
  };

  const handleEmailSave = () => {
    if (!emailDraft || emailDraft === user.email) return;
    updateUser({ email: emailDraft });
    flashSaved("email");
  };

  const handleNameSave = () => {
    if (!nameDraft || nameDraft === user.name) return;
    updateUser({ name: nameDraft, initials: getInitials(nameDraft) });
    flashSaved("name");
  };

  const handlePasswordSave = () => {
    flashSaved("password");
  };

  const handleAvatarPick = () => {
    setAvatarError(null);
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpe?g)$/.test(file.type)) {
      setAvatarError("Avatar must be a PNG or JPG image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Avatar must be 2MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateUser({ avatarUrl: reader.result as string });
    };
    reader.onerror = () => {
      setAvatarError("Could not read the selected file.");
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarRemove = () => {
    setAvatarError(null);
    updateUser({ avatarUrl: undefined });
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(false);
    disconnect();
    router.replace("/dashboard/login");
  };

  return (
    <div className="px-5 lg:px-6">
      <div className="divide-y divide-white/[0.06]">
        {/* Email — always editable */}
        <SectionRow
          title="Email"
          description="Set or update the email address where you will receive notifications about your account."
        >
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="email"
              type="email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white transition-colors focus:border-white/20 focus:bg-white/[0.05] focus:outline-none sm:flex-1 sm:py-2"
            />
            <button
              type="button"
              onClick={handleEmailSave}
              disabled={!emailDraft || emailDraft === user.email}
              className="w-full rounded-md border border-white/[0.12] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:shrink-0 sm:py-2"
            >
              {savedFlash === "email" ? "Saved" : "Update"}
            </button>
          </div>
        </SectionRow>

        {/* Profile — provider-aware */}
        {isOAuth ? (
          <SectionRow
            title="Profile"
            description={`Your name and avatar come from your ${providerInfo.name} profile. To update them, visit your ${providerInfo.name} account settings.`}
          >
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-dark-surface px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-bright/15 text-sm font-semibold text-green-bright ring-1 ring-green-bright/25">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`${user.name} avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="mt-0.5 truncate text-xs text-white/40">
                  {user.email}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/60">
                {user.provider === "github" ? (
                  <GitHubGlyph className="h-3 w-3" />
                ) : (
                  <GoogleGlyph className="h-3 w-3" />
                )}
                {providerInfo.name}
              </span>
            </div>
          </SectionRow>
        ) : (
          <>
            {/* Display name */}
            <SectionRow
              title="Display name"
              description="The name shown on your profile and in the Developer Dashboard header."
            >
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="name"
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white transition-colors focus:border-white/20 focus:bg-white/[0.05] focus:outline-none sm:flex-1 sm:py-2"
                />
                <button
                  type="button"
                  onClick={handleNameSave}
                  disabled={!nameDraft || nameDraft === user.name}
                  className="w-full rounded-md border border-white/[0.12] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:shrink-0 sm:py-2"
                >
                  {savedFlash === "name" ? "Saved" : "Update"}
                </button>
              </div>
            </SectionRow>

            {/* Avatar */}
            <SectionRow
              title="Avatar"
              description="Click the avatar to upload a new image. PNG or JPG, max 2MB."
            >
              <div className="flex h-full items-center gap-4 md:min-h-[4rem]">
                <button
                  type="button"
                  onClick={handleAvatarPick}
                  aria-label={
                    user.avatarUrl ? "Change avatar" : "Upload avatar"
                  }
                  className={`group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-bright/15 text-base font-semibold text-green-bright ring-1 transition-all hover:ring-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright focus-visible:ring-offset-2 focus-visible:ring-offset-dark ${
                    user.avatarUrl ? "ring-white/10" : "ring-white/15"
                  }`}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span aria-hidden="true">{user.initials}</span>
                  )}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    <Pencil className="h-4 w-4 text-white" />
                  </span>
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                {user.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleAvatarRemove}
                    className="text-sm text-white/50 transition-colors hover:text-white/80"
                  >
                    Remove
                  </button>
                )}
              </div>
              {avatarError && (
                <p className="mt-2 text-xs text-red-400">{avatarError}</p>
              )}
            </SectionRow>

            {/* Password */}
            <SectionRow
              title="Password"
              description="Change the password used to sign in to your account."
            >
              <div className="space-y-3">
                <div>
                  <FieldLabel htmlFor="current-password">
                    Current password
                  </FieldLabel>
                  <input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 transition-colors focus:border-white/20 focus:bg-white/[0.05] focus:outline-none sm:py-2"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="new-password">New password</FieldLabel>
                  <input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 transition-colors focus:border-white/20 focus:bg-white/[0.05] focus:outline-none sm:py-2"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handlePasswordSave}
                    className="rounded-md border border-white/[0.12] px-3.5 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    {savedFlash === "password" ? "Saved" : "Change password"}
                  </button>
                </div>
              </div>
            </SectionRow>
          </>
        )}
      </div>

      {/* Danger zone — intentionally outside the divide-y for emphasis */}
      <section className="mt-12 mb-10">
        <h2 className="text-base font-medium text-white/55">Danger zone</h2>
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/[0.03] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Delete account</p>
              <p className="mt-0.5 text-xs text-white/50">
                Permanently delete your account, API tokens, and all payment provider
                connections. This cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="shrink-0 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
            >
              Delete account
            </button>
          </div>
        </div>
      </section>

      {/* Delete confirmation dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Delete account
              </h3>
              <p className="text-sm text-white/50">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-white/[0.06] bg-dark-surface p-4">
            <p className="text-sm text-white/60">
              What happens when you delete your account:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-white/40">
              <li>Your API tokens will be revoked immediately</li>
              <li>All connected payment providers will be disconnected</li>
              <li>Your usage history will be permanently deleted</li>
              <li>This action is irreversible</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-white/50 transition-colors hover:bg-white/[0.04]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              Delete account
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
