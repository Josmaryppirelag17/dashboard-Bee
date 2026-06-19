"use client";

import { useEffect } from "react";
import { createLogger } from "@/lib/logger";

const log = createLogger("error-page");

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error("Error page rendered", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf6ee] px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#e28800]">500</h1>
        <h2 className="mt-4 text-xl font-semibold text-[#100f0d]">Something went wrong</h2>
        <p className="mt-2 text-[#5e5b52]">An unexpected error occurred. Please try again.</p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-[#e28800] px-6 py-3 font-bold text-white transition-colors hover:bg-[#c97300]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
