"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/studio/AuthContext";
import LoginPage from "@/components/studio/LoginPage";

function LoginRouteInner() {
  const { isConnected, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deviceFlow = searchParams.get("flow") === "device";

  useEffect(() => {
    if (!isLoading && isConnected && !deviceFlow) {
      router.replace("/studio");
    }
  }, [isConnected, isLoading, deviceFlow, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-green-bright"
          role="status"
          aria-label="Checking session"
        />
      </div>
    );
  }

  if (isConnected && !deviceFlow) {
    return null;
  }

  return <LoginPage />;
}

export default function LoginRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-dark">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-green-bright"
            role="status"
            aria-label="Loading"
          />
        </div>
      }
    >
      <LoginRouteInner />
    </Suspense>
  );
}
