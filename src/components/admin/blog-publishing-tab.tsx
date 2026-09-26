"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Rocket } from "lucide-react";
import {
  arrayToCsv,
  csvToArray,
} from "@/components/admin/shared";

// ───────────────────────── Types ─────────────────────────

export type BlogStatus = "draft" | "published" | "scheduled" | "archived";

export interface BlogPublishingState {
  status: BlogStatus;
  scheduledAt: string | null; // ISO string for API; datetime-local string for input
  featured: boolean;
  tags: string[];
  readTime: string;
  date: string; // yyyy-mm-dd
  author: string;
  authorRole: string;
}

export interface BlogPublishingTabProps {
  value: BlogPublishingState;
  onChange: (next: BlogPublishingState) => void;
  /** Slug for "preview on site" link. */
  slug: string;
  /** Whether the post has been saved (has an ID). */
  isSaved: boolean;
  /** Triggered by the "Publish now" button. */
  onPublishNow: () => void;
  /** True while a publish-now request is in flight. */
  publishingNow: boolean;
}

// ───────────────────────── Helpers ─────────────────────────

const STATUS_OPTIONS: { value: BlogStatus; label: string; badgeClass: string }[] = [
  {
    value: "draft",
    label: "Draft",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  {
    value: "published",
    label: "Published",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  {
    value: "scheduled",
    label: "Scheduled",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  },
  {
    value: "archived",
    label: "Archived",
    badgeClass: "bg-muted text-muted-foreground",
  },
];

/** Convert a Date (or ISO string) into the value expected by a
 *  datetime-local <input>: yyyy-MM-ddTHH:mm in local time. */
export function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert a datetime-local input value to an ISO string. */
export function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function StatusBadge({ status }: { status: BlogStatus }) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status);
  if (!opt) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${opt.badgeClass}`}
    >
      {opt.label}
    </span>
  );
}

// ───────────────────────── Component ─────────────────────────

export function BlogPublishingTab({
  value,
  onChange,
  slug,
  isSaved,
  onPublishNow,
  publishingNow,
}: BlogPublishingTabProps) {
  function update<K extends keyof BlogPublishingState>(
    key: K,
    next: BlogPublishingState[K],
  ) {
    onChange({ ...value, [key]: next });
  }

  const showSchedule = value.status === "scheduled";
  const canPublishNow = isSaved && (value.status === "draft" || value.status === "scheduled");
  const previewHref = slug ? `/blog/${slug}` : "/blog";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Status &amp; visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={value.status}
                onValueChange={(v) => update("status", v as BlogStatus)}
              >
                <SelectTrigger id="status" className="h-10 w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Current</Label>
              <div className="flex h-10 items-center">
                <StatusBadge status={value.status} />
              </div>
            </div>
          </div>

          {showSchedule && (
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Scheduled publish date &amp; time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={toDatetimeLocal(value.scheduledAt)}
                onChange={(e) =>
                  update("scheduledAt", fromDatetimeLocal(e.target.value))
                }
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                The post will go live automatically at this time (server-side
                cron checks every minute).
              </p>
            </div>
          )}

          {/* Featured toggle */}
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Switch
              id="featured"
              checked={value.featured}
              onCheckedChange={(v) => update("featured", v)}
            />
            <div>
              <Label htmlFor="featured" className="cursor-pointer">
                Featured post
              </Label>
              <p className="text-xs text-muted-foreground">
                Featured posts appear prominently on the blog home page.
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-10"
              asChild
              disabled={!isSaved || !slug}
            >
              <a href={previewHref} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                Preview on site
              </a>
            </Button>
            {canPublishNow && (
              <Button
                type="button"
                className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={onPublishNow}
                disabled={publishingNow}
              >
                <Rocket className="size-4" />
                {publishingNow ? "Publishing…" : "Publish now"}
              </Button>
            )}
          </div>
          {!isSaved && (
            <p className="text-xs text-muted-foreground">
              Save the post once to enable preview and publish-now actions.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Author + meta */}
      <Card>
        <CardHeader>
          <CardTitle>Author &amp; date</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={value.author}
              onChange={(e) => update("author", e.target.value)}
              className="h-10"
              placeholder="Author name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="authorRole">Author role</Label>
            <Input
              id="authorRole"
              value={value.authorRole}
              onChange={(e) => update("authorRole", e.target.value)}
              className="h-10"
              placeholder="e.g. Lead Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="readTime">Read time</Label>
            <Input
              id="readTime"
              value={value.readTime}
              onChange={(e) => update("readTime", e.target.value)}
              className="h-10"
              placeholder="5 min read"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Publication date</Label>
            <Input
              id="date"
              type="date"
              value={value.date}
              onChange={(e) => update("date", e.target.value)}
              className="h-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={arrayToCsv(value.tags)}
            onChange={(e) => update("tags", csvToArray(e.target.value))}
            className="h-10"
            placeholder="CCTV, Surveillance, Security"
          />
          {value.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {value.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
