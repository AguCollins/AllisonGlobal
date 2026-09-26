"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaPicker } from "@/components/admin/media-picker";
import { SeoSuggestCard } from "@/components/admin/seo-suggest-card";
import { generateSeoSuggestions } from "@/components/admin/seo-suggest";

// ───────────────────────── Types ─────────────────────────

/**
 * Shared SEO state used by Service and Project editors.
 * (Blog posts use their own BlogSeoState which adds ogTitle/ogDescription/nofollow.)
 */
export interface SeoState {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
  noindex: boolean;
}

export interface SeoTabProps {
  value: SeoState;
  /** Called whenever any SEO field changes. */
  onChange: (next: SeoState) => void;
  /** Title from the Content tab — used for SERP preview fallback. */
  title: string;
  /** Slug from the Content tab — used for the SERP preview URL. */
  slug: string;
  /** Path prefix for the SERP preview (e.g. "/services/" or "/projects/"). */
  pathPrefix: string;
  /** Featured/hero image URL from the Content tab — used as OG fallback. */
  fallbackImage?: string;
  /** Body text content for SEO analysis (overview/description). */
  bodyText?: string;
  /** Excerpt/short description for SEO suggestions. */
  excerpt?: string;
  /** Category label for SEO suggestions. */
  category?: string;
}

// ───────────────────────── Helpers ─────────────────────────

type IndicatorState = "good" | "warn" | "bad" | "empty";

function getIndicator(len: number, ideal: [number, number]): IndicatorState {
  if (len === 0) return "empty";
  if (len < ideal[0]) return "warn";
  if (len > ideal[1]) return "bad";
  return "good";
}

const INDICATOR_STYLES: Record<IndicatorState, string> = {
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  bad: "bg-rose-500",
  empty: "bg-muted-foreground/30",
};

function CharacterCounter({
  value,
  ideal,
  label,
}: {
  value: number;
  ideal: [number, number];
  label: string;
}) {
  const state = getIndicator(value, ideal);
  const rec = `${ideal[0]}–${ideal[1]}`;
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span
        className={`inline-block size-2 rounded-full ${INDICATOR_STYLES[state]}`}
        aria-hidden
      />
      <span>
        {value}/{rec} {label}
      </span>
    </div>
  );
}

function isValidUrl(value: string): boolean {
  if (!value.trim()) return true; // empty is valid (optional)
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// ───────────────────────── Component ─────────────────────────

export function SeoTab({
  value,
  onChange,
  title,
  slug,
  pathPrefix,
  fallbackImage,
  bodyText,
  excerpt,
  category,
}: SeoTabProps) {
  function update<K extends keyof SeoState>(key: K, next: SeoState[K]) {
    onChange({ ...value, [key]: next });
  }

  const effectiveMetaTitle =
    value.metaTitle || title || "Untitled — add a meta title";
  const effectiveMetaDescription =
    value.metaDescription ||
    "Add a meta description to control how this page appears in search results.";
  const effectiveOgImage = value.ogImage || fallbackImage || "";
  const safePrefix = pathPrefix.startsWith("/") ? pathPrefix : `/${pathPrefix}`;
  const permalink = slug
    ? `${safePrefix}${slug}`
    : `${safePrefix}your-slug-here`;

  const canonicalValid = isValidUrl(value.canonicalUrl);

  return (
    <div className="space-y-6">
      {/* Smart SEO Suggestions */}
      <SeoSuggestCard
        input={{
          title,
          excerpt,
          bodyText,
          category,
        }}
        current={{
          metaTitle: value.metaTitle,
          metaDescription: value.metaDescription,
        }}
        onAccept={(field, val) => {
          if (field === "all") {
            const s = generateSeoSuggestions({ title, excerpt, bodyText, category });
            if (s) {
              onChange({
                ...value,
                metaTitle: s.metaTitle,
                metaDescription: s.metaDescription,
              });
            }
          } else {
            onChange({ ...value, [field]: val });
          }
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Search engine metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Meta title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-metaTitle">Meta title</Label>
              <CharacterCounter
                value={value.metaTitle.length}
                ideal={[50, 60]}
                label="recommended"
              />
            </div>
            <Input
              id="seo-metaTitle"
              value={value.metaTitle}
              onChange={(e) => update("metaTitle", e.target.value)}
              className="h-10"
              placeholder="Defaults to the page title if empty"
              maxLength={120}
            />
          </div>

          {/* Meta description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-metaDescription">Meta description</Label>
              <CharacterCounter
                value={value.metaDescription.length}
                ideal={[150, 160]}
                label="recommended"
              />
            </div>
            <Textarea
              id="seo-metaDescription"
              value={value.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)}
              rows={3}
              placeholder="One or two sentences summarising the page"
              maxLength={300}
            />
          </div>

          {/* Canonical URL */}
          <div className="space-y-2">
            <Label htmlFor="seo-canonicalUrl">Canonical URL</Label>
            <Input
              id="seo-canonicalUrl"
              value={value.canonicalUrl}
              onChange={(e) => update("canonicalUrl", e.target.value)}
              className="h-10"
              placeholder={`https://allisonglobal.com${safePrefix}your-slug`}
              type="url"
              aria-invalid={!canonicalValid}
            />
            {!canonicalValid && (
              <p className="text-xs text-destructive">
                Please enter a valid URL (including https://).
              </p>
            )}
          </div>

          {/* noindex */}
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Switch
              id="seo-noindex"
              checked={value.noindex}
              onCheckedChange={(v) => update("noindex", v)}
            />
            <div>
              <Label htmlFor="seo-noindex" className="cursor-pointer">
                noindex
              </Label>
              <p className="text-xs text-muted-foreground">
                Prevent search engines from indexing this page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Open Graph (social sharing)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-ogImage">OG image</Label>
            <div className="flex items-center gap-2">
              <Input
                id="seo-ogImage"
                value={value.ogImage}
                onChange={(e) => update("ogImage", e.target.value)}
                className="h-10"
                placeholder="https://… (recommended 1200×630)"
                type="url"
              />
              <MediaPicker
                value={value.ogImage}
                onSelect={(url) => update("ogImage", url)}
                defaultCategory="general"
                compact
                label="Pick from media library"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended size: 1200 × 630 px. Falls back to the hero image if
              empty.
            </p>
          </div>

          {effectiveOgImage && (
            <div className="overflow-hidden rounded-md border border-border">
              <div
                className="relative w-full"
                style={{ aspectRatio: "1200 / 630" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={effectiveOgImage}
                  alt="Open Graph preview"
                  className="absolute inset-0 size-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                  }}
                />
              </div>
              <div className="space-y-1 p-3">
                <p className="line-clamp-1 text-sm font-semibold text-foreground">
                  {effectiveMetaTitle}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {effectiveMetaDescription}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  allisonglobal.com{permalink}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SERP preview */}
      <Card>
        <CardHeader>
          <CardTitle>Google SERP preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xl space-y-1.5 rounded-lg border border-border bg-background p-4">
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              https://allisonglobal.com{permalink}
            </p>
            <p className="text-xl font-medium leading-tight text-[#1a0dab] dark:text-[#8ab4f8]">
              {effectiveMetaTitle}
            </p>
            <p className="text-sm text-muted-foreground">
              {effectiveMetaDescription}
            </p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Preview is approximate. Google may truncate titles beyond ~60
            characters and descriptions beyond ~160 characters.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
