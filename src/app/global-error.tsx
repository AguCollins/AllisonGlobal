"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Global error boundary — catches errors that occur above the root layout
 * (e.g. during layout rendering itself). Must render its own <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[app] global error", error.message, error.digest);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#0b2a27",
          color: "#fff",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div style={{ maxWidth: 440, textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                margin: "0 auto 1.5rem",
                borderRadius: 16,
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={28} />
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>
              Something went wrong
            </h1>
            <p style={{ marginTop: 12, opacity: 0.75, lineHeight: 1.6 }}>
              The site hit an unexpected error. Please try again — if it
              persists, call us on +234 915 215 8801.
            </p>
            <div
              style={{
                marginTop: 28,
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={reset}
                style={{
                  height: 44,
                  padding: "0 22px",
                  borderRadius: 8,
                  border: "none",
                  background: "#d4a64a",
                  color: "#0b2a27",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  height: 44,
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 22px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Back to home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
