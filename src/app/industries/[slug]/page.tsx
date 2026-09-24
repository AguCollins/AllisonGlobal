import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { industries } from "@/lib/data/industries";
import { getIndustryById, DatabaseUnavailableError } from "@/lib/data-access";
import { IndustryDetailView } from "@/components/views/industry-detail-view";

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.id }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const ind = await getIndustryById(slug);
    if (!ind) return { title: "Industry not found" };
    return { title: `${ind.name} — Sector Solutions`, description: ind.summary };
  } catch {
    return { title: "Industry" };
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let dbOk = true;
  let industryExists = true;

  try {
    const ind = await getIndustryById(slug);
    if (!ind) industryExists = false;
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

  if (!industryExists) notFound();
  return <IndustryDetailView />;
}
