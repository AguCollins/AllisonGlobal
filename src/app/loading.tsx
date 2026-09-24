import { LogoMark } from "@/components/site/primitives";

/**
 * Root Suspense fallback — shown while route segments or their data load.
 * Kept lightweight (no images/animations) so it renders instantly.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <div className="opacity-60">
          <LogoMark withText={false} />
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <span className="size-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          Loading…
        </div>
      </div>
    </div>
  );
}
