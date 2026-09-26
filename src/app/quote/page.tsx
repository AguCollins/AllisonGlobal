import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteView } from "@/components/views/quote-view";
import { DataError } from "@/components/site/data-error";
import {
  getCompany,
  getCategories,
  getServices,
  getIndustries,
  DatabaseUnavailableError,
  type CompanyInfo,
} from "@/lib/data-access";
import type { ServiceCategory, Service, Industry } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Tell us what you need — services, site, budget and timeline — and receive a clear, itemised proposal with no obligation.",
};

export default async function Page() {
  let dbOk = true;
  let company: CompanyInfo | null = null;
  let categories: ServiceCategory[] = [];
  let services: Service[] = [];
  let industries: Industry[] = [];

  try {
    [company, categories, services, industries] = await Promise.all([
      getCompany(),
      getCategories(),
      getServices(),
      getIndustries(),
    ]);
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

  if (!company) {
    return (
      <DataError message="Quote form is not available. Please check back shortly." />
    );
  }

  return (
    <Suspense fallback={null}>
      <QuoteView
        company={company}
        categories={categories}
        services={services}
        industries={industries}
        heroImage=""
      />
    </Suspense>
  );
}
