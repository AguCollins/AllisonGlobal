"use client";

import * as React from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

/**
 * SiteShell renders the persistent Header + Footer around every route.
 * Lives in the root layout so every page inherits it.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-foreground"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
