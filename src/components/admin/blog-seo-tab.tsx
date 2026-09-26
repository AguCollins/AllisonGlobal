"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ───────────────────────── Types ─────────────────────────

export interface BlogSeoState {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  noindex: boolean;
  nofollow: boolean;
}

export interface BlogSeoTabProps {
  value: BlogSeoState;
  /** Called whenever any SEO field changes. */
  onChange: (next: BlogSeoState) => void;
  /** Title from the Content tab — used for SERP preview fallback. */
  title: string;
  /** Slug from the Content tab — used for the SERP preview URL. */
  slug: string;
  /** Featured image URL from the Media tab — used as OG image fallback. */
  featuredImage: string;
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

export function BlogSeoTab({
  value,
  onChange,
  title,
  slug,
  featuredImage,
}: BlogSeoTabProps) {
  function update<K extends keyof BlogSeoState>(
    key: K,
    next: BlogSeoState[K],
  ) {
    onChange({ ...value, [key]: next });
  }

  // Effective values — fall back to title/featured image when SEO fields empty
  const effectiveMetaTitle = value.metaTitle || title || "Untitled post";
  const effectiveMetaDescription =
    value.metaDescription ||
    "Add a meta description to control how this post appears in search results.";
  const effectiveOgTitle = value.ogTitle || effectiveMetaTitle;
  const effectiveOgDescription = value.ogDescription || effectiveMetaDescription;
  const effectiveOgImage = value.ogImage || featuredImage;
  const permalink = slug ? `/blog/${slug}` : "/blog/your-slug-here";

  const canonicalValid = isValidUrl(value.canonicalUrl);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search engine metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Meta title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaTitle">Meta title</Label>
              <CharacterCounter
                value={value.metaTitle.length}
                ideal={[50, 60]}
                label="recommended"
              />
            </div>
            <Input
              id="metaTitle"
              value={value.metaTitle}
              onChange={(e) => update("metaTitle", e.target.value)}
              className="h-10"
              placeholder="Defaults to the post title if empty"
              maxLength={120}
            />
          </div>

          {/* Meta description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaDescription">Meta description</Label>
              <CharacterCounter
                value={value.metaDescription.length}
                ideal={[150, 160]}
                label="recommended"
              />
            </div>
            <Textarea
              id="metaDescription"
              value={value.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)}
              rows={3}
              placeholder="One or two sentences summarising the post"
              maxLength={300}
            />
          </div>

          {/* Canonical URL */}
          <div className="space-y-2">
            <Label htmlFor="canonicalUrl">Canonical URL</Label>
            <Input
              id="canonicalUrl"
              value={value.canonicalUrl}
              onChange={(e) => update("canonicalUrl", e.target.value)}
              className="h-10"
              placeholder="https://allisonglobal.com/blog/your-slug"
              type="url"
              aria-invalid={!canonicalValid}
            />
            {!canonicalValid && (
              <p className="text-xs text-destructive">
                Please enter a valid URL (including https://).
              </p>
            )}
          </div>

          {/* noindex / nofollow */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Switch
                id="noindex"
                checked={value.noindex}
                onCheckedChange={(v) => update("noindex", v)}
              />
              <div>
                <Label htmlFor="noindex" className="cursor-pointer">
                  noindex
                </Label>
                <p className="text-xs text-muted-foreground">
                  Prevent search engines from indexing this post.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Switch
                id="nofollow"
                checked={value.nofollow}
                onCheckedChange={(v) => update("nofollow", v)}
              />
              <div>
                <Label htmlFor="nofollow" className="cursor-pointer">
                  nofollow
                </Label>
                <p className="text-xs text-muted-foreground">
                  Prevent search engines from following links in this post.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Open Graph (social sharing)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ogTitle">OG title</Label>
              <Input
                id="ogTitle"
                value={value.ogTitle}
                onChange={(e) => update("ogTitle", e.target.value)}
                className="h-10"
                placeholder="Defaults to meta title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ogDescription">OG description</Label>
              <Input
                id="ogDescription"
                value={value.ogDescription}
                onChange={(e) => update("ogDescription", e.target.value)}
                className="h-10"
                placeholder="Defaults to meta description"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ogImage">OG image URL</Label>
            <Input
              id="ogImage"
              value={value.ogImage}
              onChange={(e) => update("ogImage", e.target.value)}
              className="h-10"
              placeholder="https://… (recommended 1200×630)"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Recommended size: 1200 × 630 px. Falls back to the featured image
              if empty.
            </p>
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
                      (e.currentTarget as HTMLImageElement).style.opacity =
                        "0.3";
                    }}
                  />
                </div>
                <div className="space-y-1 p-3">
                  <p className="line-clamp-1 text-sm font-semibold text-foreground">
                    {effectiveOgTitle}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {effectiveOgDescription}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    allisonglobal.com{permalink}
                  </p>
                </div>
              </div>
            )}
          </div>
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
