"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Lock,
  Unlock,
  RefreshCw,
  Check,
  AlertCircle,
} from "lucide-react";

// ───────────────────────── Helpers ─────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word chars
    .replace(/[\s_]+/g, "-") // spaces/underscores → hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// ───────────────────────── Component ─────────────────────────

export interface SlugInputProps {
  /** Current slug value */
  value: string;
  /** Called when slug changes */
  onChange: (slug: string) => void;
  /** Source text to auto-generate from (e.g., post title, service name) */
  sourceText: string;
  /** Path prefix for preview (e.g., "/blog/", "/services/") */
  pathPrefix?: string;
  /** Whether the slug is locked (manual edit disabled) */
  locked?: boolean;
  /** Called when lock state changes */
  onLockChange?: (locked: boolean) => void;
  /** Whether the slug already exists (duplicate detection) */
  isDuplicate?: boolean;
  /** Max length */
  maxLength?: number;
  label?: string;
}

export function SlugInput({
  value,
  onChange,
  sourceText,
  pathPrefix = "/",
  locked = false,
  onLockChange,
  isDuplicate = false,
  maxLength = 80,
  label = "Slug",
}: SlugInputProps) {
  const [manualEdited, setManualEdited] = React.useState(false);

  // Auto-generate from source text unless manually edited or locked
  React.useEffect(() => {
    if (!manualEdited && !locked) {
      onChange(slugify(sourceText));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceText, locked]);

  const valid = isValidSlug(value);
  const tooLong = value.length > maxLength;
  const showError = !valid && value.length > 0;
  const permalink = `${pathPrefix}${value || "your-slug"}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="slug-input">{label}</Label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => onLockChange?.(!locked)}
            title={locked ? "Unlock slug (auto-generate from title)" : "Lock slug (prevent auto-generation)"}
          >
            {locked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
            {locked ? "Locked" : "Auto"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => {
              onChange(slugify(sourceText));
              setManualEdited(false);
            }}
            title="Regenerate from title"
            disabled={!sourceText}
          >
            <RefreshCw className="size-3" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          id="slug-input"
          value={value}
          onChange={(e) => {
            setManualEdited(true);
            // Sanitize as user types
            onChange(slugify(e.target.value));
          }}
          className={cn(
            "h-10 font-mono text-sm",
            (showError || tooLong || isDuplicate) && "border-destructive focus-visible:ring-destructive",
          )}
          placeholder="auto-generated-from-title"
          maxLength={maxLength + 10}
          disabled={locked}
        />
        {valid && !tooLong && !isDuplicate && value && (
          <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        )}
      </div>
      {/* Permalink preview */}
      {value && (
        <p className="text-xs text-muted-foreground">
          <span className="text-muted-foreground/60">Permalink:</span>{" "}
          <span className="font-mono text-brand">{permalink}</span>
        </p>
      )}
      {/* Error messages */}
      {showError && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3" />
          Slug must be lowercase with hyphens only
        </p>
      )}
      {tooLong && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3" />
          Slug is too long ({value.length}/{maxLength} chars)
        </p>
      )}
      {isDuplicate && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3" />
          This slug is already in use — choose another
        </p>
      )}
    </div>
  );
}
