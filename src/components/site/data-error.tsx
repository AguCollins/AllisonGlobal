/**
 * Shared error state for when the database is unavailable.
 * Used by public route pages when data-access throws DatabaseUnavailableError.
 */
import Link from "next/link";
import { AlertCircle, ArrowRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/site/primitives";

export function DataError({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 opacity-80">
        <LogoMark />
      </div>
      <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
        Content temporarily unavailable
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {message ||
          "We're unable to load this page's content right now. Our team has been notified — please try again in a moment."}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Link href="/">
            Back to home
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <a href="tel:+2349152158801">
            <PhoneCall className="size-4" />
            Call us
          </a>
        </Button>
      </div>
    </div>
  );
}

/** Lightweight inline error for sections within a page */
export function SectionError({ title }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
      <AlertCircle className="mb-3 size-6 text-destructive" />
      <p className="text-sm font-medium text-foreground">
        {title || "This section could not be loaded."}
      </p>
    </div>
  );
}
