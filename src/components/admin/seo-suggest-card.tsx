"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  generateSeoSuggestions,
  scoreSeoQuality,
  type SeoSuggestionInput,
} from "@/components/admin/seo-suggest";
import { cn } from "@/lib/utils";

// ───────────────────────────── Props ─────────────────────────────

export interface SeoSuggestCardProps {
  /** The content to analyze. */
  input: SeoSuggestionInput;
  /** Current SEO values (to compare with suggestions). */
  current: {
    metaTitle: string;
    metaDescription: string;
    ogTitle?: string;
    ogDescription?: string;
  };
  /** Called when the user accepts a suggestion field. */
  onAccept: (field: "metaTitle" | "metaDescription" | "ogTitle" | "ogDescription" | "all", value: string) => void;
}

// ───────────────────────────── Component ─────────────────────────────

export function SeoSuggestCard({ input, current, onAccept }: SeoSuggestCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  const suggestion = React.useMemo(() => {
    try {
      return generateSeoSuggestions(input);
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.title, input.excerpt, input.bodyText, input.category, input.tags]);

  const quality = React.useMemo(() => {
    try {
      return scoreSeoQuality({
        metaTitle: current.metaTitle,
        metaDescription: current.metaDescription,
        title: input.title,
        bodyText: input.bodyText,
        slug: input.title ? input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "",
        content: input.bodyText,
      });
    } catch {
      return null;
    }
  }, [current.metaTitle, current.metaDescription, input.title, input.bodyText]);

  if (dismissed || !suggestion) return null;

  // Check if there's anything to suggest (i.e., current values differ from suggestions)
  const hasSuggestion =
    (suggestion.metaTitle && suggestion.metaTitle !== current.metaTitle) ||
    (suggestion.metaDescription && suggestion.metaDescription !== current.metaDescription);

  if (!hasSuggestion && quality && quality.score >= 80) return null;

  const scoreColor =
    !quality ? "text-muted-foreground" :
    quality.status === "excellent" ? "text-emerald-600 dark:text-emerald-400" :
    quality.status === "good" ? "text-emerald-600 dark:text-emerald-400" :
    quality.status === "needs-attention" ? "text-amber-600 dark:text-amber-400" :
    "text-rose-600 dark:text-rose-400";

  const scoreBg =
    !quality ? "bg-muted" :
    quality.status === "excellent" || quality.status === "good" ? "bg-emerald-50 dark:bg-emerald-500/10" :
    quality.status === "needs-attention" ? "bg-amber-50 dark:bg-amber-500/10" :
    "bg-rose-50 dark:bg-rose-500/10";

  const statusLabel = quality ? quality.status.replace("-", " ") : "";

  return (
    <Card className={cn("border-brand/20", scoreBg)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand/15">
              <Sparkles className="size-4 text-brand" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Smart SEO Suggestions</CardTitle>
              {quality && (
                <p className={cn("text-xs font-medium capitalize", scoreColor)}>
                  SEO: {statusLabel} ({quality.score}/100)
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
              {expanded ? "Hide" : "Details"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setDismissed(true)}
              title="Dismiss"
            >
              <X className="size-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* One-click "apply all" */}
        {hasSuggestion && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={() => onAccept("all", "")}
            >
              <Check className="size-3.5" />
              Apply all suggestions
            </Button>
            <span className="text-xs text-muted-foreground">
              Auto-generated from your content
            </span>
          </div>
        )}

        {/* Individual suggestions */}
        {hasSuggestion && (
          <div className="space-y-2">
            <Separator />
            <SuggestionRow
              label="Meta Title"
              suggested={suggestion.metaTitle}
              current={current.metaTitle}
              ideal={[50, 60]}
              onAccept={() => onAccept("metaTitle", suggestion.metaTitle)}
            />
            <SuggestionRow
              label="Meta Description"
              suggested={suggestion.metaDescription}
              current={current.metaDescription}
              ideal={[150, 160]}
              onAccept={() => onAccept("metaDescription", suggestion.metaDescription)}
              multiline
            />
            {suggestion.ogTitle && suggestion.ogTitle !== current.ogTitle && (
              <SuggestionRow
                label="OG Title"
                suggested={suggestion.ogTitle}
                current={current.ogTitle || ""}
                ideal={[40, 80]}
                onAccept={() => onAccept("ogTitle", suggestion.ogTitle)}
              />
            )}
            {suggestion.ogDescription && suggestion.ogDescription !== current.ogDescription && (
              <SuggestionRow
                label="OG Description"
                suggested={suggestion.ogDescription}
                current={current.ogDescription || ""}
                ideal={[150, 200]}
                onAccept={() => onAccept("ogDescription", suggestion.ogDescription)}
                multiline
              />
            )}
          </div>
        )}

        {/* Quality checks (expandable) */}
        {expanded && quality && (
          <div className="space-y-2 rounded-lg border border-border/60 bg-background/50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <TrendingUp className="size-3.5" />
              SEO Quality Check — {quality.checks.filter((c) => c.passed).length}/{quality.checks.length} passed
            </div>
            {quality.checks.map((check, i) => {
              const iconColor = check.passed
                ? "text-emerald-600 dark:text-emerald-400"
                : check.severity === "error"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-amber-600 dark:text-amber-400";
              return (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs"
                >
                  {check.passed ? (
                    <CheckCircle2 className={cn("mt-0.5 size-3.5 shrink-0", iconColor)} />
                  ) : check.severity === "error" ? (
                    <AlertTriangle className={cn("mt-0.5 size-3.5 shrink-0", iconColor)} />
                  ) : (
                    <AlertTriangle className={cn("mt-0.5 size-3.5 shrink-0", iconColor)} />
                  )}
                  <div>
                    <span className="font-medium text-foreground">{check.label}</span>
                    <span className="ml-1.5 text-muted-foreground">{check.detail}</span>
                    {!check.passed && check.field && (
                      <span className="ml-1 text-[10px] text-muted-foreground/60">
                        ({check.field})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ───────────────────────────── Suggestion Row ─────────────────────────────

function SuggestionRow({
  label,
  suggested,
  current,
  ideal,
  onAccept,
  multiline = false,
}: {
  label: string;
  suggested: string;
  current: string;
  ideal: [number, number];
  onAccept: () => void;
  multiline?: boolean;
}) {
  const [showFull, setShowFull] = React.useState(false);
  if (!suggested || suggested === current) return null;

  const len = suggested.length;
  const isGood = len >= ideal[0] && len <= ideal[1];

  return (
    <div className="rounded-lg border border-border/60 bg-background/50 p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] uppercase">
            {label}
          </Badge>
          <span className={cn(
            "text-[10px] font-medium",
            isGood ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
          )}>
            {len} chars
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px] text-brand hover:text-brand"
          onClick={onAccept}
        >
          <Check className="size-3" />
          Use this
        </Button>
      </div>
      <p className={cn(
        "text-sm text-foreground/90",
        !multiline && "line-clamp-2",
        !showFull && multiline && "line-clamp-3",
      )}>
        {suggested}
      </p>
      {multiline && suggested.length > 120 && (
        <button
          type="button"
          className="mt-1 text-[11px] text-brand hover:underline"
          onClick={() => setShowFull(!showFull)}
        >
          {showFull ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
