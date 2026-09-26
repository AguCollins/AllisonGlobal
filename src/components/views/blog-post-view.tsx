"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ArrowRight,
  Clock,
  Calendar,
  Tag,
  User,
  PhoneCall,
  MessageSquare,
} from "lucide-react";
import {
  Section,
  SectionHeader,
  Reveal,
  Stagger,
  staggerItem,
  NavButton,
} from "@/components/site/primitives";
import {
  PageHero,
  ConversionPathCTA,
  BlogCard,
  ProjectImage,
} from "@/components/site/sections";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogBlockRenderer } from "@/components/blog/blog-block-renderer";
import type { BlogPost } from "@/lib/types";

export interface BlogPostViewProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
  heroImage: string;
}

export function BlogPostView({
  post,
  relatedPosts,
  heroImage: _heroImage,
}: BlogPostViewProps) {
  return (
    <>
      <PageHero
        eyebrow={post.category}
        title={post.title}
        subtitle={post.excerpt}
        icon={BookOpen}
        backgroundImage={post.imageQuery}
        breadcrumb={[
          { label: "Home", view: "home" },
          { label: "Insights", view: "blog" },
          { label: post.title },
        ]}
      />

      <Section className="pt-12 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
          {/* Main article column */}
          <article className="lg:col-span-2">
            {/* Hero image */}
            <Reveal>
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
                <ProjectImage query={post.imageQuery} alt={post.title} url={post.imageQuery} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute left-4 top-4">
                  <Badge className="bg-background/90 text-foreground backdrop-blur">
                    {post.category}
                  </Badge>
                </div>
              </div>
            </Reveal>

            {/* Author / meta bar */}
            <Reveal className="mt-6">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  <User className="size-4 text-brand" />
                  {post.author}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="size-4 text-brand" />
                  {new Date(post.date).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="size-4 text-brand" />
                  {post.readTime}
                </span>
              </div>
            </Reveal>

            {/* Body content */}
            <Reveal className="mt-8">
              <div className="mx-auto max-w-3xl">
                <BlogBlockRenderer blocks={post.content} />
              </div>
            </Reveal>

            {/* Tags */}
            {post.tags.length > 0 && (
              <Reveal className="mt-10">
                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-6">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Tag className="size-3.5" />
                    Tags
                  </span>
                  {post.tags.map((t) => (
                    <Badge key={t} variant="outline" className="font-normal text-muted-foreground">
                      {t}
                    </Badge>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Inline share / CTA */}
            <Reveal className="mt-10">
              <div className="flex flex-col items-start gap-4 rounded-xl border border-brand/20 bg-emerald-50/50 p-6 dark:bg-emerald-500/5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold">
                    Need this for your site?
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Our engineers can assess your environment and recommend concrete next steps.
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row">
                  <NavButton view="contact" size="sm" className="gap-1.5">
                    Talk to an expert
                    <ArrowRight className="size-4" />
                  </NavButton>
                  <NavButton view="quote" size="sm" variant="outline">
                    Request a quote
                  </NavButton>
                </div>
              </div>
            </Reveal>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="space-y-6 lg:sticky lg:top-24">
              {/* Author card */}
              <Reveal>
                <Card className="border-border/70">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand ring-1 ring-brand/20">
                        <User className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-semibold leading-tight">
                          {post.author}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {post.authorRole}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      Allison Global brings together ICT, networking, cybersecurity and
                      electronic security under one engineering-led team — so the
                      systems we discuss in this article can be specified, integrated
                      and supported end-to-end.
                    </p>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Meta card */}
              <Reveal delay={0.05}>
                <Card className="border-border/70">
                  <CardContent className="p-6">
                    <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Article details
                    </h3>
                    <dl className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="inline-flex items-center gap-2 text-muted-foreground">
                          <Calendar className="size-4" />
                          Published
                        </dt>
                        <dd className="font-medium">
                          {new Date(post.date).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="inline-flex items-center gap-2 text-muted-foreground">
                          <Clock className="size-4" />
                          Read time
                        </dt>
                        <dd className="font-medium">{post.readTime}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="inline-flex items-center gap-2 text-muted-foreground">
                          <Tag className="size-4" />
                          Category
                        </dt>
                        <dd className="font-medium">{post.category}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Sticky need-help CTA */}
              <Reveal delay={0.1}>
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 text-white">
                  <div className="absolute inset-0 bg-grid-dark opacity-40" />
                  <div className="relative">
                    <h3 className="font-display text-lg font-semibold">
                      Need help applying this?
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      Speak with an engineer about your site, risks and goals. One
                      conversation is usually all it takes.
                    </p>
                    <div className="mt-5 flex flex-col gap-2">
                      <NavButton
                        view="contact"
                        className="gap-1.5 bg-gold text-gold-foreground hover:bg-gold/90"
                      >
                        <MessageSquare className="size-4" />
                        Talk to an expert
                      </NavButton>
                      <a
                        href="tel:+2349152158801"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                      >
                        <PhoneCall className="size-4" />
                        0915 215 8801
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </aside>
        </div>
      </Section>

      {/* Related insights */}
      {relatedPosts.length > 0 && (
        <Section className="bg-muted/30">
          <SectionHeader
            eyebrow="Keep reading"
            title="Related insights"
            subtitle="More practical guidance from our engineering team across networking, cybersecurity, surveillance and IT."
          />
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((p) => (
              <motion.div key={p.slug} variants={staggerItem}>
                <BlogCard post={p} imageUrl={p.imageQuery} />
              </motion.div>
            ))}
          </Stagger>
        </Section>
      )}

      <ConversionPathCTA />
    </>
  );
}
