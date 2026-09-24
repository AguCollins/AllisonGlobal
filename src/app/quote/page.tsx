import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteView } from "@/components/views/quote-view";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Tell us what you need — services, site, budget and timeline — and receive a clear, itemised proposal with no obligation.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <QuoteView />
    </Suspense>
  );
}
