import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services } from "@/lib/data/services";
import { getServiceBySlug, DatabaseUnavailableError } from "@/lib/data-access";
import { ServiceDetailView } from "@/components/views/service-detail-view";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const service = await getServiceBySlug(slug);
    if (!service) return { title: "Service not found" };
    return { title: service.name, description: service.shortDescription };
  } catch {
    return { title: "Service" };
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let dbOk = true;
  let serviceExists = true;

  try {
    const service = await getServiceBySlug(slug);
    if (!service) serviceExists = false;
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

  if (!serviceExists) notFound();
  return <ServiceDetailView />;
}
