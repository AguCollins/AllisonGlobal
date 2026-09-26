"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// ───────────────────────── Types ─────────────────────────

export interface RepeatableFieldProps<T> {
  /** Current items */
  items: T[];
  /** Called when items change */
  onChange: (items: T[]) => void;
  /** Create a new empty item */
  createEmpty: () => T;
  /** Render the item editor */
  renderItem: (item: T, index: number, update: (next: T) => void) => React.ReactNode;
  /** Label for the add button */
  addLabel?: string;
  /** Min items (can't delete below this) */
  minItems?: number;
  /** Max items */
  maxItems?: number;
  /** Show drag handles (reordering) */
  reorderable?: boolean;
  /** Label for the section */
  label?: string;
  /** Description/help text */
  description?: string;
}

// ───────────────────────── Component ─────────────────────────

export function RepeatableField<T>({
  items,
  onChange,
  createEmpty,
  renderItem,
  addLabel = "Add item",
  minItems = 0,
  maxItems,
  reorderable = true,
  label,
  description,
}: RepeatableFieldProps<T>) {
  function add() {
    if (maxItems && items.length >= maxItems) return;
    onChange([...items, createEmpty()]);
  }

  function remove(index: number) {
    if (items.length <= minItems) return;
    onChange(items.filter((_, i) => i !== index));
  }

  function move(index: number, direction: "up" | "down") {
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const next = [...items];
    [next[index], next[swapIdx]] = [next[swapIdx], next[index]];
    onChange(next);
  }

  function update(index: number, value: T) {
    onChange(items.map((item, i) => (i === index ? value : item)));
  }

  return (
    <div className="space-y-3">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No items yet. Click "{addLabel}" to add one.
          </div>
        )}
        {items.map((item, index) => (
          <Card key={index} className="border-border/60">
            <CardContent className="flex items-start gap-2 p-3">
              {reorderable && (
                <div className="flex flex-col">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => move(index, "up")}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <ArrowUp className="size-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => move(index, "down")}
                    disabled={index === items.length - 1}
                    title="Move down"
                  >
                    <ArrowDown className="size-3" />
                  </Button>
                </div>
              )}
              <div className="flex-1 space-y-2">
                {renderItem(item, index, (next) => update(index, next))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-destructive hover:text-destructive"
                onClick={() => remove(index)}
                disabled={items.length <= minItems}
                title="Remove"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        disabled={maxItems !== undefined && items.length >= maxItems}
        className="gap-1.5"
      >
        <Plus className="size-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}

// ───────────────────────── Convenience: String list ─────────────────────────

export function StringListField({
  items,
  onChange,
  label,
  description,
  addLabel = "Add item",
  placeholder = "Enter value...",
  multiline = false,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  label?: string;
  description?: string;
  addLabel?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <RepeatableField
      items={items}
      onChange={onChange}
      createEmpty={() => ""}
      renderItem={(item, _i, update) =>
        multiline ? (
          <Textarea
            value={item}
            onChange={(e) => update(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="text-sm"
          />
        ) : (
          <Input
            value={item}
            onChange={(e) => update(e.target.value)}
            placeholder={placeholder}
            className="h-9 text-sm"
          />
        )
      }
      addLabel={addLabel}
      label={label}
      description={description}
      minItems={0}
    />
  );
}

// ───────────────────────── Convenience: Title+Description list ─────────────────────────

export interface TitledItem {
  title: string;
  description: string;
}

export function TitledListField({
  items,
  onChange,
  label,
  description,
  addLabel = "Add item",
  titlePlaceholder = "Title",
  descPlaceholder = "Description",
}: {
  items: TitledItem[];
  onChange: (items: TitledItem[]) => void;
  label?: string;
  description?: string;
  addLabel?: string;
  titlePlaceholder?: string;
  descPlaceholder?: string;
}) {
  return (
    <RepeatableField
      items={items}
      onChange={onChange}
      createEmpty={() => ({ title: "", description: "" })}
      renderItem={(item, _i, update) => (
        <div className="space-y-1.5">
          <Input
            value={item.title}
            onChange={(e) => update({ ...item, title: e.target.value })}
            placeholder={titlePlaceholder}
            className="h-9 text-sm font-medium"
          />
          <Textarea
            value={item.description}
            onChange={(e) => update({ ...item, description: e.target.value })}
            placeholder={descPlaceholder}
            rows={2}
            className="text-sm"
          />
        </div>
      )}
      addLabel={addLabel}
      label={label}
      description={description}
      minItems={0}
    />
  );
}
