import type { Metadata } from "next";
import { SupportView } from "@/components/views/support-view";
import { DataError } from "@/components/site/data-error";
import {
  getCompany,
  getCategories,
  DatabaseUnavailableError,
  type CompanyInfo,
} from "@/lib/data-access";
import type { ServiceCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Maintenance & Support",
  description:
    "Keep your IT and security systems healthy with preventive maintenance, monitoring, priority support and managed services under one agreement.",
};

export default async function Page() {
  let dbOk = true;
  let company: CompanyInfo | null = null;
  let categories: ServiceCategory[] = [];

  try {
    [company, categories] = await Promise.all([
      getCompany(),
      getCategories(),
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
      <DataError message="Support content is not available. Please check back shortly." />
    );
  }

  return <SupportView company={company} categories={categories} heroImage="" />;
}
