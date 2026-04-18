"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/studio/AuthContext";
import LoginPage from "@/components/studio/LoginPage";

export default function LoginRoute() {
  const { isConnected, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isConnected) {
      router.replace("/studio");
    }
  }, [isConnected, isLoading, router]);

  if (isLoading || isConnected) return null;

  return <LoginPage />;
}
