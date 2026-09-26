import type { Metadata } from "next";
import { getBlogPosts, DatabaseUnavailableError } from "@/lib/data-access";
import type { BlogPost } from "@/lib/types";
import { BlogView } from "@/components/views/blog-view";
import { DataError } from "@/components/site/data-error";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Insights & Resources",
  description: "Practical, plain-language guidance from our engineers on CCTV, cybersecurity, networking, fire safety and IT infrastructure.",
};

export default async function Page() {
  let dbOk = true;
  let posts: BlogPost[] = [];

  try {
    posts = await getBlogPosts();
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

  return <BlogView posts={posts} heroImage="" />;
}
