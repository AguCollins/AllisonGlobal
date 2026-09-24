import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/views/blog-post-view";
import { blogPosts, getPostBySlug } from "@/lib/data/blog";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const post = getPostBySlug(slug);
    if (!post) return { title: "Article not found" };
    return {
      title: post.title,
      description: post.excerpt,
    };
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getPostBySlug(slug)) notFound();
  return <BlogPostView />;
}
