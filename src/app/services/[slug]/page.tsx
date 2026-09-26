import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getServiceBySlug,
  getRelatedServices,
  getCategories,
  getIndustries,
  getProcessSteps,
  getCompany,
  DatabaseUnavailableError,
  type CompanyInfo,
  type ProcessStepRecord,
} from "@/lib/data-access";
import type { Service, ServiceCategory, Industry } from "@/lib/types";
import { ServiceDetailView } from "@/components/views/service-detail-view";
import { DataError } from "@/components/site/data-error";

export const revalidate = 3600;

// ISR: return [] so newly-created DB rows are auto-discovered without a
// redeploy. The page is regenerated on the first request to a new slug.
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
    const service = await getServiceBySlug(slug);
    if (!service) return { title: "Service not found" };
    // The Service type doesn't currently expose metaTitle/metaDescription
    // (mapService doesn't map them). Defensive cast in case the type is
    // extended later — fall back to name/shortDescription otherwise.
    const meta = service as Service & {
      metaTitle?: string;
      metaDescription?: string;
    };
    return {
      title: meta.metaTitle || service.name,
      description: meta.metaDescription || service.shortDescription,
    };
  } catch {
    return { title: "Service" };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let dbOk = true;
  let serviceExists = true;
  let service: Service | undefined;
  let relatedServices: Service[] = [];
  let categories: ServiceCategory[] = [];
  let industries: Industry[] = [];
  let processSteps: ProcessStepRecord[] = [];
  let company: CompanyInfo | null = null;

  try {
    service = await getServiceBySlug(slug);
    if (!service) {
      serviceExists = false;
    } else {
      // Fetch the rest in parallel — we know the slug resolves.
      [relatedServices, categories, industries, processSteps, company] = await Promise.all([
        getRelatedServices(slug),
        getCategories(),
        getIndustries(),
        getProcessSteps(),
        getCompany(),
      ]);
    }
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      dbOk = false;
    } else {
      throw err;
    }
  }

  if (!dbOk) {
    return <DataError />;
  }

  if (!serviceExists) {
    notFound();
  }

  // `service` is guaranteed defined when serviceExists is true, but TS can't
  // narrow through the try/catch. Use a runtime guard.
  if (!service || !company) {
    return (
      <DataError message="This service is not available. Please check back shortly." />
    );
  }

  return (
    <ServiceDetailView
      service={service}
      relatedServices={relatedServices}
      categories={categories}
      industries={industries}
      processSteps={processSteps}
      company={company}
      heroImage=""
    />
  );
}
