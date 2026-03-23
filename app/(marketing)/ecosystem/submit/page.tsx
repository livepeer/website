"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ECOSYSTEM_CATEGORIES } from "@/lib/ecosystem-data";

const CATEGORIES = ECOSYSTEM_CATEGORIES.filter((c) => c !== "All");

export default function SubmitAppPage() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [email, setEmail] = useState("");

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const body = [
      `**App Name:** ${name}`,
      `**Website:** ${url}`,
      `**Description:** ${description}`,
      `**Categories:** ${categories.join(", ")}`,
      `**Contact:** ${email}`,
    ].join("\n");

    const issueUrl = new URL(
      "https://github.com/livepeer/naap/issues/new",
    );
    issueUrl.searchParams.set("title", `[Ecosystem] Add ${name}`);
    issueUrl.searchParams.set("body", body);
    issueUrl.searchParams.set("labels", "ecosystem");

    window.open(issueUrl.toString(), "_blank");
  };

  const isValid = name && url && description && categories.length > 0 && email;

  return (
    <section className="mx-auto max-w-2xl px-6 pt-32 pb-24">
      <Link
        href="/ecosystem"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/60"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Ecosystem
      </Link>

      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Submit your app
      </h1>
      <p className="mt-4 text-base leading-relaxed text-white/40">
        Built something on Livepeer? Submit your app to be featured in the
        ecosystem directory. This will open a GitHub issue for review.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        {/* App name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white/60">
            App name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Livepeer App"
            className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none"
          />
        </div>

        {/* Website URL */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white/60">
            Website URL
          </label>
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://myapp.com"
            className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white/60">
            Description
          </label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description of what your app does and how it uses Livepeer..."
            rows={4}
            className="w-full resize-none rounded-lg border border-dark-border bg-dark-card px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white/60">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`rounded-sm border px-3 py-1.5 text-sm transition-colors ${
                  categories.includes(cat)
                    ? "border-white/20 bg-white/10 font-medium text-white"
                    : "border-dark-border text-white/40 hover:border-white/10 hover:text-white/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Contact email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white/60">
            Contact email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid}
          className="w-full rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Submit via GitHub
        </button>
      </form>
    </section>
  );
}
