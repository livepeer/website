"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/dashboard/AuthContext";
import LoginPage from "@/components/dashboard/LoginPage";

export default function LoginRoute() {
  const { isConnected } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.replace("/dashboard");
    }
  }, [isConnected, router]);

  if (isConnected) return null;

  return <LoginPage />;
}
