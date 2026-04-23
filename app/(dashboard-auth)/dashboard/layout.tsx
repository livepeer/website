import type { Metadata } from "next";
import { AuthProvider } from "@/components/dashboard/AuthContext";

export const metadata: Metadata = {
  title: "Sign in — Livepeer Developer Dashboard",
  description:
    "Sign in or create an account to access the Livepeer Developer Dashboard.",
};

export default function DashboardAuthLayout({
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
