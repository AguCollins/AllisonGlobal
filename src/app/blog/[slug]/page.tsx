import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getBlogPostBySlug,
  getBlogPosts,
  getRedirectForPath,
  DatabaseUnavailableError,
} from "@/lib/data-access";
import { DataError } from "@/components/site/data-error";
import { BlogPostView } from "@/components/views/blog-post-view";
import type { BlogPost } from "@/lib/types";

export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPostBySlug(slug);
    if (!post) return { title: "Article not found" };
    // The BlogPost type doesn't expose SEO fields, but the DB row may carry
    // them. Defensive cast for forward compatibility.
    const meta = post as BlogPost & {
      metaTitle?: string;
      metaDescription?: string;
    };
    return {
      title: meta.metaTitle || post.title,
      description: meta.metaDescription || post.excerpt,
    };
  } catch {
    return { title: "Article" };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let dbOk = true;
  let postExists = true;
  let post: BlogPost | undefined;
  let relatedPosts: BlogPost[] = [];

  try {
    post = await getBlogPostBySlug(slug);
    if (!post) {
      postExists = false;
    } else {
      const allPosts = await getBlogPosts();
      relatedPosts = allPosts.filter((p) => p.slug !== post!.slug).slice(0, 3);
    }
  } catch (e) {
    if (e instanceof DatabaseUnavailableError) {
      dbOk = false;
    } else {
      throw e;
    }
  }

  if (!dbOk) {
    return <DataError />;
  }

  if (!postExists || !post) {
    // Check for a redirect (e.g., slug was renamed) before 404ing
    try {
      const redirectEntry = await getRedirectForPath(`/blog/${slug}`);
      if (redirectEntry) {
        redirect(redirectEntry.to);
      }
    } catch {
      // DB error on redirect check — fall through to 404
    }
    notFound();
  }

  return (
    <BlogPostView post={post} relatedPosts={relatedPosts} heroImage="" />
  );
}
