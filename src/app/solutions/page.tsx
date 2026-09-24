import type { Metadata } from "next";
import { getSolutions, DatabaseUnavailableError } from "@/lib/data-access";
import { SolutionsView } from "@/components/views/solutions-view";

export const metadata: Metadata = {
  title: "Solutions — Outcomes, Not Products",
  description: "Explore bundled solutions that solve real problems — unified security, resilient networks, cyber defence, life safety, smart buildings and managed IT.",
};

export const revalidate = 3600;

export default async function Page() {
  let dbOk = true;
  try {
    await getSolutions();
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

  return <SolutionsView />;
}
