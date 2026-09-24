import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndustryDetailView } from "@/components/views/industry-detail-view";
import { industries, industryMap } from "@/lib/data/industries";

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.id }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const ind = industryMap[slug];
    if (!ind) return { title: "Industry not found" };
    return {
      title: `${ind.name} — Sector Solutions`,
      description: ind.summary,
    };
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!industryMap[slug]) notFound();
  return <IndustryDetailView />;
}
