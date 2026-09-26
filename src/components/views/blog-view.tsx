"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Sparkles, Clock, User } from "lucide-react";
import {
  Section,
  SectionHeader,
  Reveal,
  Stagger,
  staggerItem,
  NavButton,
  NavLink,
} from "@/components/site/primitives";
import {
  PageHero,
  ConversionPathCTA,
  BlogCard,
  ProjectImage,
} from "@/components/site/sections";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

const HERO_IMAGE = "https://www.ui.com/microsite/static/fedex-forum-poster-CWYupQKP.jpg";
const ALL = "All";

export interface BlogViewProps {
  posts: BlogPost[];
  heroImage: string;
}

export function BlogView({ posts, heroImage }: BlogViewProps) {
  const heroBg = heroImage || HERO_IMAGE;
  const blogCategories = React.useMemo(
    () => [...new Set(posts.map((p) => p.category))],
    [posts],
  );
  const [active, setActive] = React.useState<string>(ALL);
  const featured = React.useMemo(
    () => posts.find((p) => p.featured) ?? posts[0],
    [posts],
  );
  const filtered = React.useMemo(() => {
    const list = active === ALL
      ? posts
      : posts.filter((p) => p.category === active);
    // Always exclude the featured post from the grid (it appears above).
    return list.filter((p) => p.slug !== featured?.slug);
  }, [active, featured, posts]);

  if (posts.length === 0) {
    return (
      <>
        <PageHero
          backgroundImage={heroBg}
          eyebrow="Insights & Resources"
          title="Practical guidance from our engineers"
          subtitle="Learn how to choose, secure and maintain the systems that protect your business — in plain language."
          icon={BookOpen}
          breadcrumb={[{ label: "Home", view: "home" }, { label: "Insights" }]}
        />
        <Section>
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
            No articles published yet. Check back soon for insights.
          </div>
        </Section>
        <ConversionPathCTA />
      </>
    );
  }

  return (
    <>
      <PageHero
        backgroundImage={heroBg}
        eyebrow="Insights & Resources"
        title="Practical guidance from our engineers"
        subtitle="Learn how to choose, secure and maintain the systems that protect your business — in plain language."
        icon={BookOpen}
        breadcrumb={[{ label: "Home", view: "home" }, { label: "Insights" }]}
      />

      {featured && <FeaturedPost post={featured} />}

      <Section id="insights">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="The library"
            title="All insights"
            subtitle="Filter by topic to find guidance relevant to your environment, risk profile and stage of growth."
          />
        </div>

        {/* Category filter pills */}
        <Reveal className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            {[ALL, ...blogCategories].map((cat) => {
              const isActive = active === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActive(cat)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "border-brand bg-brand text-brand-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground",
                  )}
                  aria-pressed={isActive}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </Reveal>

        {filtered.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No articles in this category yet. Try another topic or reach out — we may be working on one.
            </p>
          </div>
        ) : (
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <motion.div key={post.slug} variants={staggerItem}>
                <BlogCard post={post} imageUrl={post.imageQuery} />
              </motion.div>
            ))}
          </Stagger>
        )}
      </Section>

      <Section className="bg-muted/30">
        <SectionHeader
          align="center"
          eyebrow="Topics we cover"
          title="Practical territory, not buzzwords"
          subtitle="We write about the systems and decisions our clients face every day — engineering-grounded, vendor-neutral and rooted in real Nigerian site conditions."
        />
        <Reveal className="mt-10">
          <div className="flex flex-wrap justify-center gap-3">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActive(cat);
                  document
                    .getElementById("insights")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md hover:shadow-emerald-500/5"
              >
                <span className="size-1.5 rounded-full bg-brand" />
                {cat}
              </button>
            ))}
            {["CCTV", "Network Security", "Infrastructure", "Compliance", "SME", "Maintenance"].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </Reveal>
      </Section>

      <ConversionPathCTA />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Featured post — larger hero card                                    */
/* ------------------------------------------------------------------ */
function FeaturedPost({ post }: { post: BlogPost }) {
  const date = new Date(post.date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <Section className="pb-0">
      <Reveal>
        <div className="rounded-2xl border border-border bg-card p-2 shadow-sm">
          <div className="grid gap-0 overflow-hidden rounded-xl lg:grid-cols-2">
            <NavLink
              view="blog-post"
              slug={post.slug}
              className="group relative block aspect-[16/10] w-full overflow-hidden lg:aspect-auto"
            >
              <ProjectImage query={post.imageQuery} alt={post.title} url={post.imageQuery} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <Badge className="bg-gold text-gold-foreground shadow">
                  <Sparkles className="size-3" />
                  Featured
                </Badge>
                <Badge variant="secondary" className="bg-background/85 text-foreground backdrop-blur">
                  {post.category}
                </Badge>
              </div>
            </NavLink>

            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <User className="size-3.5" />
                  {post.author}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {post.readTime}
                </span>
                <span>{date}</span>
              </div>
              <h2 className="mt-3 text-balance font-display text-2xl font-bold leading-tight sm:text-3xl">
                {post.title}
              </h2>
              <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <NavButton view="blog-post" slug={post.slug} className="gap-1.5">
                  Read the article
                  <ArrowRight className="size-4" />
                </NavButton>
                <span className="text-xs text-muted-foreground">
                  by {post.author} · {post.authorRole}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
