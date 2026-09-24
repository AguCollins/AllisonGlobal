import Link from "next/link";
import type { Metadata } from "next";
import { Compass, ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Compass className="size-7" />
        </div>
        <div className="mb-3 flex justify-center">
          <LogoMark withText={false} />
        </div>
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-brand">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
          We couldn’t find that page
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          The link may be broken or the page may have moved. Try one of these
          instead.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-6 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <Link
            href="/services"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-semibold transition-colors hover:bg-accent"
          >
            Browse services
          </Link>
        </div>
      </div>
    </div>
  );
}
