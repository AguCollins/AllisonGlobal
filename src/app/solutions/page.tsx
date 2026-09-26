import type { Metadata } from "next";
import {
  getSolutions,
  getServices,
  getIndustries,
  DatabaseUnavailableError,
} from "@/lib/data-access";
import type { Solution, Service, Industry } from "@/lib/types";
import { SolutionsView } from "@/components/views/solutions-view";
import { DataError } from "@/components/site/data-error";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Solutions — Outcomes, Not Products",
  description: "Explore bundled solutions that solve real problems — unified security, resilient networks, cyber defence, life safety, smart buildings and managed IT.",
};

export default async function Page() {
  let dbOk = true;
  let solutions: Solution[] = [];
  let services: Service[] = [];
  let industries: Industry[] = [];

  try {
    [solutions, services, industries] = await Promise.all([
      getSolutions(),
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

  return (
    <SolutionsView
      solutions={solutions}
      services={services}
      industries={industries}
      heroImage=""
    />
  );
}
