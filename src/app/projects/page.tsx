import type { Metadata } from "next";
import { getProjects } from "@/lib/data-access";
import { ProjectsView } from "@/components/views/projects-view";

export const metadata: Metadata = {
  title: "Projects & Portfolio",
  description:
    "Representative engagements across industries — CCTV rollouts, network builds, fire safety, access control and managed IT, each engineered and documented.",
};

export const revalidate = 3600;

export default async function Page() {
  const projects = await getProjects();
  return <ProjectsView projects={projects} />;
}
