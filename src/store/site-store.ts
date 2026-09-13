"use client";

import { create } from "zustand";
import type { ViewId, NavParam } from "@/lib/types";

interface SiteState {
  view: ViewId;
  params: NavParam;
  /** navigate to a view, optionally with params (slug, subject, anchor) */
  navigate: (view: ViewId, params?: NavParam) => void;
  /** navigate to a service detail page */
  goService: (slug: string) => void;
  /** navigate to an industry detail page */
  goIndustry: (id: string) => void;
  /** navigate to a blog post */
  goBlogPost: (slug: string) => void;
  /** open the quote view, optionally prefilling a subject */
  goQuote: (subject?: string) => void;
  /** open the contact view */
  goContact: () => void;
}

export const useSite = create<SiteState>((set) => ({
  view: "home",
  params: {},
  navigate: (view, params = {}) => {
    set({ view, params });
    // Scroll to top on view change (unless an anchor is specified)
    if (typeof window !== "undefined") {
      if (params.anchor) {
        // allow target view to render, then scroll
        setTimeout(() => {
          const el = document.getElementById(params.anchor!);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  },
  goService: (slug) =>
    set({ view: "service-detail", params: { slug } }),
  goIndustry: (id) =>
    set({ view: "industry-detail", params: { slug: id } }),
  goBlogPost: (slug) => set({ view: "blog-post", params: { slug } }),
  goQuote: (subject) =>
    set({ view: "quote", params: subject ? { subject } : {} }),
  goContact: () => set({ view: "contact", params: {} }),
}));

/** Convenience hook for the active view (re-render on view change). */
export function useView() {
  return useSite((s) => s.view);
}
