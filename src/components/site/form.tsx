"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Shared form primitives used by the contact and quote views.
 *
 * Accessibility: each `Field` generates a stable `id` and associates the
 * `<Label htmlFor>` with its child control, plus links error messages via
 * `aria-describedby` and sets `aria-invalid` on the control when invalid.
 *
 * To wire a control up, spread `fieldProps(id, invalid, errorId)` onto it
 * (Input/Textarea/Select all accept `id` + standard aria attributes).
 */

let fieldSeq = 0;
function useFieldId(prefix = "field") {
  const [id] = React.useState(
    () => `${prefix}-${++fieldSeq}-${Math.random().toString(36).slice(2, 7)}`,
  );
  return id;
}

export function Field({
  label,
  error,
  required,
  children,
  hint,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => React.ReactNode;
  hint?: string;
}) {
  const id = useFieldId("f");
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const invalid = !!error;
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children({
        id,
        "aria-invalid": invalid,
        "aria-describedby": describedBy,
      })}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Shared section wrapper used in the quote form. */
export function FormSection({
  icon: Icon,
  title,
  subtitle,
  step,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  step?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/70 bg-card p-6 sm:p-7", className)}>
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-3">
          {step !== undefined && (
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10 font-display text-sm font-bold text-brand">
              {step}
            </div>
          )}
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background text-brand ring-1 ring-border">
            <Icon className="size-5" />
          </span>
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
