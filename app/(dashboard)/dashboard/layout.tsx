import type { Metadata } from "next";
import { AuthProvider } from "@/components/dashboard/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export const metadata: Metadata = {
  title: "Developer Dashboard — Livepeer",
  description:
    "Browse AI capabilities, manage API keys, and monitor usage on the Livepeer network.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-dark">
        <DashboardHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </AuthProvider>
  );
}
