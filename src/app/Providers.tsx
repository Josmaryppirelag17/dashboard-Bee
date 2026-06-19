"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BeeToastProvider } from "@/context/BeeToastContext";
import { AuthProvider } from "@/context/AuthContext";
import OnboardingTour from "@/components/organisms/OnboardingTour";

const StructuredData = dynamic(
  () => import("@/lib/structured-data").then((m) => ({ default: m.StructuredData })),
  { ssr: false },
);

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const tid = requestIdleCallback(() => {
      import("@/lib/analytics").then(({ analytics }) => {
        analytics.pageView(window.location.pathname);
      });
    });
    return () => cancelIdleCallback(tid);
  }, []);

  return (
    <>
      <StructuredData />
      <ErrorBoundary>
        <AuthProvider>
          <BeeToastProvider>
            {children}
            <OnboardingTour />
          </BeeToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}
