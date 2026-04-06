import type { Metadata } from "next";
import { AuthProvider } from "@/components/studio/AuthContext";

export const metadata: Metadata = {
  title: "Studio — Livepeer Developer Dashboard",
  description:
    "Browse AI capabilities, manage API keys, and monitor usage on the Livepeer network.",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-dark">{children}</div>
    </AuthProvider>
  );
}
