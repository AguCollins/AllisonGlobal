import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/data-access";
import { BlogView } from "@/components/views/blog-view";

export const metadata: Metadata = {
  title: "Insights & Resources",
  description:
    "Practical, plain-language guidance from our engineers on CCTV, cybersecurity, networking, fire safety and IT infrastructure.",
};

export const revalidate = 3600;

export default async function Page() {
  const posts = await getBlogPosts();
  return <BlogView posts={posts} />;
}
