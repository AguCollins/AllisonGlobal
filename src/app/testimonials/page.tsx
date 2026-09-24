import type { Metadata } from "next";
import { getTestimonials, DatabaseUnavailableError } from "@/lib/data-access";
import { TestimonialsView } from "@/components/views/testimonials-view";

export const metadata: Metadata = {
  title: "Testimonials & Client Feedback",
  description: "Representative client feedback by role and sector — what working with an engineering-led, integrated security partner actually feels like.",
};

export const revalidate = 3600;

export default async function Page() {
  let dbOk = true;
  try {
    await getTestimonials();
  } catch (e) {
    if (e instanceof DatabaseUnavailableError) {
      dbOk = false;
    } else {
      throw e;
    }
  }

  if (!dbOk) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Content temporarily unavailable</h1>
          <p className="mt-2 text-muted-foreground">Please try again in a moment.</p>
        </div>
      </div>
    );
  }

  return <TestimonialsView />;
}
