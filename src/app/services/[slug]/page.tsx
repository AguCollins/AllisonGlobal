import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceBySlug, getServices, getCategories, getIndustries } from "@/lib/data-access";
import { ServiceDetailView } from "@/components/views/service-detail-view";

export const revalidate = 3600;

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.name,
    description: service.shortDescription,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  // Fetch related data in parallel
  const [allServices, allCategories, allIndustries] = await Promise.all([
    getServices(),
    getCategories(),
    getIndustries(),
  ]);

  const category = allCategories.find((c) => c.id === service.categoryId || c.slug === service.categoryId);
  const relatedServices = service.relatedServices
    .map((s) => allServices.find((x) => x.slug === s))
    .filter(Boolean) as typeof allServices;
  const relatedIndustries = service.relatedIndustries
    .map((id) => allIndustries.find((i) => i.id === id))
    .filter(Boolean) as typeof allIndustries;

  return (
    <ServiceDetailView
      service={service}
      category={category}
      relatedServices={relatedServices}
      relatedIndustries={relatedIndustries}
    />
  );
}
