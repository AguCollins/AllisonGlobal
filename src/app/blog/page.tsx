import type { Metadata } from "next";
import { getBlogPosts, DatabaseUnavailableError } from "@/lib/data-access";
import { BlogView } from "@/components/views/blog-view";

export const metadata: Metadata = {
  title: "Insights & Resources",
  description: "Practical, plain-language guidance from our engineers on CCTV, cybersecurity, networking, fire safety and IT infrastructure.",
};

export const revalidate = 3600;

export default async function Page() {
  let dbOk = true;
  try {
    await getBlogPosts();
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

  return <BlogView />;
}
