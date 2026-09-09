import type { Metadata } from "next";

import { ReportingBoard } from "@/components/livepeer-ui/reporting-board";
import { PLACEHOLDER_INITIATIVES } from "@/lib/reporting";

export const metadata: Metadata = {
  title: "Reporting | Livepeer",
  description:
    "Every project the Livepeer network funds, its health, and when its lead last reported.",
};

// A mock to be looked at before it is decided: placeholder rows in
// lib/reporting.ts, and a fixed "now" so the computed states are stable
// while it is reviewed. If it ships, the rows come from Notion and now is
// the request time. Not linked from anywhere yet.
export default function ReportingPage() {
  return (
    <ReportingBoard
      projects={PLACEHOLDER_INITIATIVES}
      now={new Date("2026-09-09T00:00:00Z")}
    />
  );
}
