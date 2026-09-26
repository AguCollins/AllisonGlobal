"use client";

import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Resolve a lucide icon name string to the actual LucideIcon component.
 * Falls back to ShieldCheck if the name is not found.
 *
 * This runs CLIENT-SIDE so that icon names (plain strings) can be passed
 * from server components to client components without serialization issues.
 */
export function resolveIcon(name: string): LucideIcon {
  if (!name) return Icons.ShieldCheck;
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon || Icons.ShieldCheck;
}

/**
 * Icon component — renders a lucide icon by name.
 * Usage: <Icon name="Network" className="size-5" />
 */
export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const LucideIcon = resolveIcon(name);
  // LucideIcon is a stable reference resolved from the lucide-react library,
  // not a component created during render.
  // eslint-disable-next-line react-hooks/static-components
  return <LucideIcon className={className} />;
}
