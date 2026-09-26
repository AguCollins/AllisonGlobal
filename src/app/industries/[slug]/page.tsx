import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getIndustryBySlug,
  getServices,
  getProjects,
  DatabaseUnavailableError,
} from "@/lib/data-access";
import { DataError } from "@/components/site/data-error";
import { IndustryDetailView } from "@/components/views/industry-detail-view";
import type { Industry } from "@/lib/types";

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
    const ind = await getIndustryBySlug(slug);
    if (!ind) return { title: "Industry not found" };
    // The Industry type doesn't expose metaTitle/metaDescription, but the DB
    // row may carry them. Defensive cast for forward compatibility.
    const meta = ind as Industry & { metaTitle?: string; metaDescription?: string };
    return {
      title: meta.metaTitle || `${ind.name} — Sector Solutions`,
      description: meta.metaDescription || ind.summary,
    };
  } catch {
    return { title: "Industry" };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let dbOk = true;
  let industryExists = true;
  let industry: Industry | undefined;
  let services: Awaited<ReturnType<typeof getServices>> = [];
  let projects: Awaited<ReturnType<typeof getProjects>> = [];

  try {
    industry = await getIndustryBySlug(slug);
    if (!industry) {
      industryExists = false;
    } else {
      [services, projects] = await Promise.all([getServices(), getProjects()]);
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

  if (!industryExists || !industry) {
    notFound();
  }

  return (
    <IndustryDetailView
      industry={industry}
      services={services}
      projects={projects}
      heroImage=""
    />
  );
}
