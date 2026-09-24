import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/data/blog";
import { getBlogPostBySlug, DatabaseUnavailableError } from "@/lib/data-access";
import { BlogPostView } from "@/components/views/blog-post-view";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPostBySlug(slug);
    if (!post) return { title: "Article not found" };
    return { title: post.title, description: post.excerpt };
  } catch {
    return { title: "Article" };
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let dbOk = true;
  let postExists = true;

  try {
    const post = await getBlogPostBySlug(slug);
    if (!post) postExists = false;
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

  if (!postExists) notFound();
  return <BlogPostView />;
}
