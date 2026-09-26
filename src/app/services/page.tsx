import type { Metadata } from "next";
import {
  getCategories,
  getServices,
  getCompany,
  DatabaseUnavailableError,
  type CompanyInfo,
} from "@/lib/data-access";
import type { ServiceCategory, Service, Stat } from "@/lib/types";
import { ServicesView } from "@/components/views/services-view";
import { DataError } from "@/components/site/data-error";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services — ICT, Networking, Cybersecurity & Security Solutions",
  description:
    "Browse our full range of ICT and security services — structured cabling, networks, cybersecurity, CCTV, access control, fire safety and IT infrastructure, engineered under one team.",
};

export default async function Page() {
  let dbOk = true;
  let categories: ServiceCategory[] = [];
  let services: Service[] = [];
  let company: CompanyInfo | null = null;

  try {
    [categories, services, company] = await Promise.all([
      getCategories(),
      getServices(),
      getCompany(),
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

  const capabilityStats: Stat[] = company?.capabilityStats ?? [];

  return (
    <ServicesView
      categories={categories}
      services={services}
      capabilityStats={capabilityStats}
      heroImage=""
    />
  );
}
