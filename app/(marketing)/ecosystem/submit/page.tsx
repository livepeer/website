"use client";

import { useState } from "react";
import Link from "next/link";
import { ECOSYSTEM_CATEGORIES } from "@/lib/ecosystem-data";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import FilterPill from "@/components/ui/FilterPill";

const CATEGORIES = ECOSYSTEM_CATEGORIES.filter((c) => c !== "All");

export default function SubmitAppPage() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const issueUrl = new URL("https://github.com/livepeer/naap/issues/new");
    issueUrl.searchParams.set("template", "ecosystem-submission.yml");
    issueUrl.searchParams.set("title", `Add ${name}`);
    issueUrl.searchParams.set("app-name", name);
    issueUrl.searchParams.set("website", url);
    issueUrl.searchParams.set("description", description);
    issueUrl.searchParams.set("categories", categories.join(", "));
    issueUrl.searchParams.set("contact", email);

    window.open(issueUrl.toString(), "_blank");
  };

  const isValid = name && url && description && categories.length > 0 && email;

  return (
    <PageHero>
      <Container className="max-w-2xl">
        <div className="mb-8 flex items-center gap-2 font-mono text-sm text-white/30">
          <Link
            href="/ecosystem"
            className="transition-colors hover:text-white/60"
          >
            Ecosystem
          </Link>
          <span>›</span>
          <span className="text-white/50">Submit</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Submit your app
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/40">
          Built something on Livepeer? Submit your app to be featured in the
          ecosystem directory. This will open a GitHub issue for review.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label
              htmlFor="app-name"
              className="mb-2 block text-sm font-medium text-white/60"
            >
              App name
            </label>
            <input
              id="app-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Livepeer App"
              className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="website-url"
              className="mb-2 block text-sm font-medium text-white/60"
            >
              Website URL
            </label>
            <input
              id="website-url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://myapp.com"
              className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="app-description"
              className="mb-2 block text-sm font-medium text-white/60"
            >
              Description
            </label>
            <textarea
              id="app-description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of what your app does and how it uses Livepeer..."
              rows={4}
              className="w-full resize-none rounded-lg border border-dark-border bg-dark-card px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">
              Categories
            </label>
            <div
              className="flex flex-wrap gap-2 select-none"
              role="group"
              aria-label="Select categories"
            >
              {CATEGORIES.map((cat) => (
                <FilterPill
                  key={cat}
                  label={cat}
                  isActive={categories.includes(cat)}
                  onToggle={() =>
                    setCategories((prev) =>
                      prev.includes(cat)
                        ? prev.filter((c) => c !== cat)
                        : [...prev, cat]
                    )
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="mb-2 block text-sm font-medium text-white/60"
            >
              Contact email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            variant="white"
            size="lg"
            disabled={!isValid}
            className="w-full font-semibold"
          >
            Submit via GitHub
          </Button>
        </form>
      </Container>
    </PageHero>
  );
}
