import type { Metadata } from "next";
import { getTestimonials, getIndustries, DatabaseUnavailableError } from "@/lib/data-access";
import type { Testimonial, Industry } from "@/lib/types";
import { TestimonialsView } from "@/components/views/testimonials-view";
import { DataError } from "@/components/site/data-error";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Testimonials & Client Feedback",
  description: "Representative client feedback by role and sector — what working with an engineering-led, integrated security partner actually feels like.",
};

export default async function Page() {
  let dbOk = true;
  let testimonials: Testimonial[] = [];
  let industries: Industry[] = [];

  try {
    [testimonials, industries] = await Promise.all([
      getTestimonials(),
      getIndustries(),
    ]);
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      dbOk = false;
    } else {
      throw err;
    }
  }

  if (!dbOk) {
    return <DataError />;
  }

  return (
    <TestimonialsView testimonials={testimonials} industries={industries} heroImage="" />
  );
}
