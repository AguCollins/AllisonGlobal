import type { Metadata } from "next";
import { WhyChooseUsView } from "@/components/views/why-choose-us-view";
import { DataError } from "@/components/site/data-error";
import {
  getCompany,
  getIndustries,
  DatabaseUnavailableError,
  type CompanyInfo,
} from "@/lib/data-access";
import type { Industry } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Why Choose Us",
  description:
    "One partner for the full ICT and security stack — engineering-led, integrated, documented and supported for the long term.",
};

export default async function Page() {
  let dbOk = true;
  let company: CompanyInfo | null = null;
  let industries: Industry[] = [];

  try {
    [company, industries] = await Promise.all([
      getCompany(),
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
      <DataError message="This page's content is not available. Please check back shortly." />
    );
  }

  return (
    <WhyChooseUsView
      differentiators={company.differentiators ?? []}
      guarantees={company.guarantees ?? []}
      industries={industries}
      heroImage=""
      phoneIntl={company.contact.phoneIntl}
      phoneDisplay={company.contact.phoneDisplay}
    />
  );
}
