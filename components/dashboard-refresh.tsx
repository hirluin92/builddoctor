"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function DashboardRefresh() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000); // Refresh ogni 30 secondi

    return () => clearInterval(interval);
  }, [router]);

  return null;
}

