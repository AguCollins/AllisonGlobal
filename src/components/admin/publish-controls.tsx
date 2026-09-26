"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Save,
  Eye,
  Send,
  EyeOff,
  CheckCircle2,
  Clock,
  Archive,
  FileText,
  Loader2,
} from "lucide-react";

// ───────────────────────── Types ─────────────────────────

export type PublishStatus = "draft" | "published" | "scheduled" | "archived";

export interface PublishControlsProps {
  status: PublishStatus;
  onStatusChange: (status: PublishStatus) => void;
  scheduledAt?: string | null;
  onScheduledAtChange: (date: string | null) => void;
  featured: boolean;
  onFeaturedChange: (featured: boolean) => void;
  onSave: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  saving: boolean;
  publishing?: boolean;
  dirty: boolean;
  lastSavedAt?: Date | null;
  /** Whether this is a new item (no ID yet) */
  isNew?: boolean;
}

// ───────────────────────── Component ─────────────────────────

const STATUS_CONFIG: Record<PublishStatus, { label: string; icon: typeof FileText; color: string }> = {
  draft: { label: "Draft", icon: FileText, color: "text-amber-600 dark:text-amber-400" },
  published: { label: "Published", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
  scheduled: { label: "Scheduled", icon: Clock, color: "text-blue-600 dark:text-blue-400" },
  archived: { label: "Archived", icon: Archive, color: "text-muted-foreground" },
};

export function PublishControls({
  status,
  onStatusChange,
  scheduledAt,
  onScheduledAtChange,
  featured,
  onFeaturedChange,
  onSave,
  onPublish,
  onPreview,
  saving,
  publishing = false,
  dirty,
  lastSavedAt,
  isNew,
}: PublishControlsProps) {
  const StatusIcon = STATUS_CONFIG[status].icon;
  const formattedLastSaved = lastSavedAt
    ? new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" }).format(lastSavedAt)
    : null;

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <StatusIcon className={cn("size-4", STATUS_CONFIG[status].color)} />
            Status: <span className={cn("font-semibold capitalize", STATUS_CONFIG[status].color)}>{STATUS_CONFIG[status].label}</span>
          </Label>
          <Select value={status} onValueChange={(v) => onStatusChange(v as PublishStatus)}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-amber-600" />
                  Draft — not visible publicly
                </div>
              </SelectItem>
              <SelectItem value="published">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  Published — visible on the public site
                </div>
              </SelectItem>
              <SelectItem value="scheduled">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-blue-600" />
                  Scheduled — auto-publish at a future time
                </div>
              </SelectItem>
              <SelectItem value="archived">
                <div className="flex items-center gap-2">
                  <Archive className="size-4 text-muted-foreground" />
                  Archived — hidden from the public site
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {status === "scheduled" && (
          <div className="space-y-2">
            <Label htmlFor="scheduled-at">Publish date & time</Label>
            <Input
              id="scheduled-at"
              type="datetime-local"
              value={scheduledAt ? scheduledAt.slice(0, 16) : ""}
              onChange={(e) => onScheduledAtChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              This post will automatically become visible at the scheduled time.
            </p>
          </div>
        )}

        {/* Featured toggle */}
        <label className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/30">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => onFeaturedChange(e.target.checked)}
            className="size-4 accent-brand"
          />
          <div>
            <span className="text-sm font-medium">Featured</span>
            <p className="text-xs text-muted-foreground">
              Show this in featured/highlighted sections
            </p>
          </div>
        </label>

        {/* Action buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={onSave}
              disabled={saving || !dirty}
              variant="outline"
              className="flex-1"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save {status === "draft" ? "draft" : "changes"}
            </Button>
            {onPreview && (
              <Button
                type="button"
                onClick={onPreview}
                variant="ghost"
                size="icon"
                className="size-10"
                title="Preview"
              >
                <Eye className="size-4" />
              </Button>
            )}
          </div>
          {status !== "published" && onPublish && (
            <Button
              type="button"
              onClick={onPublish}
              disabled={publishing || !dirty && !isNew}
              className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {publishing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Publish now
            </Button>
          )}
          {status === "published" && (
            <Button
              type="button"
              onClick={() => onStatusChange("draft")}
              variant="outline"
              className="w-full"
            >
              <EyeOff className="size-4" />
              Unpublish
            </Button>
          )}
        </div>

        {/* Last saved */}
        {formattedLastSaved && (
          <p className="text-xs text-muted-foreground">
            Last saved: {formattedLastSaved}
          </p>
        )}
        {dirty && (
          <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            ● Unsaved changes
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
