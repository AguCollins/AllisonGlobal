import type { Metadata } from "next";
import { TestimonialsView } from "@/components/views/testimonials-view";

export const metadata: Metadata = {
  title: "Testimonials & Client Feedback",
  description:
    "Representative client feedback by role and sector — what working with an engineering-led, integrated security partner actually feels like.",
};

export default function Page() {
  return <TestimonialsView />;
}
