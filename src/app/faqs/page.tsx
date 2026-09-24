import type { Metadata } from "next";
import { getFaqs, DatabaseUnavailableError } from "@/lib/data-access";
import { FaqsView } from "@/components/views/faqs-view";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to the questions we hear most — about services, process, support, security, coverage and more.",
};

export const revalidate = 3600;

export default async function Page() {
  let dbOk = true;
  try {
    await getFaqs();
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

  return <FaqsView />;
}
