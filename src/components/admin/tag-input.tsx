"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ───────────────────────── Component ─────────────────────────

export interface TagInputProps {
  /** Current tags */
  value: string[];
  /** Called when tags change */
  onChange: (tags: string[]) => void;
  /** Label for the field */
  label?: string;
  /** Placeholder for the input */
  placeholder?: string;
  /** Max number of tags */
  maxTags?: number;
  /** Suggested tags (shown as quick-add chips) */
  suggestions?: string[];
  /** Max length per tag */
  maxLength?: number;
}

export function TagInput({
  value,
  onChange,
  label = "Tags",
  placeholder = "Type a tag and press Enter...",
  maxTags = 10,
  suggestions = [],
  maxLength = 30,
}: TagInputProps) {
  const [input, setInput] = React.useState("");

  function addTag(tag: string) {
    const clean = tag.trim().toLowerCase().replace(/,/g, "");
    if (!clean) return;
    if (clean.length > maxLength) return;
    if (value.includes(clean)) return;
    if (value.length >= maxTags) return;
    onChange([...value, clean]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  const availableSuggestions = suggestions.filter((s) => !value.includes(s));

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-sm",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0",
        )}
      >
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 bg-brand/10 text-brand"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-destructive"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="h-7 flex-1 border-0 px-0 shadow-none focus-visible:ring-0"
          disabled={value.length >= maxTags}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxTags} tags · press Enter to add
        </p>
      </div>
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {availableSuggestions.slice(0, 6).map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => addTag(sug)}
              className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-brand hover:text-brand"
            >
              + {sug}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
