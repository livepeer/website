"use client";

import { Suspense, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { User, Key, Wallet, Activity } from "lucide-react";
import { useAuth } from "@/components/dashboard/AuthContext";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import DashboardSectionSelect from "@/components/dashboard/DashboardSectionSelect";
import AccountTab from "@/components/dashboard/settings/AccountTab";
import ApiKeysTab from "@/components/dashboard/settings/ApiKeysTab";
import PaymentTab from "@/components/dashboard/settings/PaymentTab";
import UsageTab from "@/components/dashboard/settings/UsageTab";

type SettingsTab = "account" | "tokens" | "usage" | "billing";

const VALID_TABS: SettingsTab[] = ["account", "tokens", "billing", "usage"];

const TABS: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
  { key: "account", label: "Account", icon: User },
  { key: "tokens", label: "API Tokens", icon: Key },
  { key: "billing", label: "Billing", icon: Wallet },
  { key: "usage", label: "Usage", icon: Activity },
];

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const { isConnected, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Auth gate
  useEffect(() => {
    if (!isLoading && !isConnected) {
      router.replace("/dashboard/login");
    }
  }, [isConnected, isLoading, router]);

  const rawTab = searchParams.get("tab");
  const tab: SettingsTab = VALID_TABS.includes(rawTab as SettingsTab)
    ? (rawTab as SettingsTab)
    : "account";

  const setTab = useCallback(
    (key: SettingsTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (key === "account") {
        params.delete("tab");
      } else {
        params.set("tab", key);
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  if (isLoading || !isConnected) return null;

  return (
    <main id="main-content" className="flex flex-1 flex-col">
      {/* Mobile section picker */}
      <DashboardSectionSelect
        ariaLabel="Settings"
        sections={TABS.map(({ key, label, icon }) => ({ key, label, icon }))}
        activeKey={tab}
        onChange={setTab}
      />


      <div className="flex flex-1 min-h-[calc(100vh-3rem-2.75rem)]">
        {/* Sidebar */}
        <div className="hidden w-[260px] flex-shrink-0 self-stretch border-r border-white/10 bg-shell lg:block">
          <div className="sticky top-12 max-h-[calc(100vh-3rem)] overflow-y-auto px-5 pt-6 pb-5 space-y-4">
            <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wider text-white/50">
              Settings
            </p>
            <div className="space-y-1">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    tab === key
                      ? "bg-white/[0.08] font-medium text-white"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content + Footer */}
        <div className="flex flex-1 flex-col overflow-y-auto bg-dark">
          <div
            className={`w-full flex-1 ${
              tab === "usage" ? "max-w-5xl" : "max-w-3xl"
            }`}
          >

            {tab === "account" && <AccountTab />}
            {tab === "tokens" && <ApiKeysTab />}
            {tab === "usage" && <UsageTab />}
            {tab === "billing" && <PaymentTab />}
          </div>
          <DashboardFooter />
        </div>
      </div>
    </main>
  );
}
