"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/site/primitives";

/**
 * Root error boundary — catches errors thrown by any route segment that
 * doesn't have its own error.tsx. Renders a branded recovery screen and
 * lets the user retry without losing the rest of the app shell.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log to the server/observability pipeline (no secrets surfaced to user).
    console.error("[app] unhandled error", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" />
        </div>
        <div className="mb-3 flex justify-center">
          <LogoMark withText={false} />
        </div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          We hit an unexpected error while loading this page. Please try again —
          if the problem persists, reach us directly and we’ll help right away.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-6 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
          >
            <RotateCcw className="size-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-6 text-sm font-semibold transition-colors hover:bg-accent"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
