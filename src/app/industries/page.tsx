import type { Metadata } from "next";
import { getIndustries, DatabaseUnavailableError } from "@/lib/data-access";
import { IndustriesView } from "@/components/views/industries-view";

export const metadata: Metadata = {
  title: "Industries We Serve",
  description: "From homes and offices to hospitals, hotels, factories and construction sites — see how we tailor ICT and security solutions to your sector.",
};

export const revalidate = 3600;

export default async function Page() {
  let dbOk = true;
  try {
    await getIndustries();
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

  return <IndustriesView />;
}
