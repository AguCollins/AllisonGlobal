import type { Metadata } from "next";
import {
  getIndustries,
  getCompany,
  DatabaseUnavailableError,
  type CompanyInfo,
} from "@/lib/data-access";
import type { Industry, Stat } from "@/lib/types";
import { IndustriesView } from "@/components/views/industries-view";
import { DataError } from "@/components/site/data-error";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Industries We Serve",
  description: "From homes and offices to hospitals, hotels, factories and construction sites — see how we tailor ICT and security solutions to your sector.",
};

export default async function Page() {
  let dbOk = true;
  let industries: Industry[] = [];
  let company: CompanyInfo | null = null;

  try {
    [industries, company] = await Promise.all([getIndustries(), getCompany()]);
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
    <IndustriesView
      industries={industries}
      capabilityStats={capabilityStats}
      heroImage=""
    />
  );
}
