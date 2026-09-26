import type { Metadata } from "next";
import {
  getProjects,
  getIndustries,
  getServices,
  DatabaseUnavailableError,
} from "@/lib/data-access";
import type { Project, Industry, Service } from "@/lib/types";
import { ProjectsView } from "@/components/views/projects-view";
import { DataError } from "@/components/site/data-error";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects & Portfolio",
  description: "Representative engagements across industries — CCTV rollouts, network builds, fire safety, access control and managed IT, each engineered and documented.",
};

export default async function Page() {
  let dbOk = true;
  let projects: Project[] = [];
  let industries: Industry[] = [];
  let services: Service[] = [];

  try {
    [projects, industries, services] = await Promise.all([
      getProjects(),
      getIndustries(),
      getServices(),
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
    <ProjectsView
      projects={projects}
      industries={industries}
      services={services}
      heroImage=""
    />
  );
}
