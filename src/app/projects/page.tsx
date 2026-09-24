import type { Metadata } from "next";
import { getProjects, DatabaseUnavailableError } from "@/lib/data-access";
import { ProjectsView } from "@/components/views/projects-view";

export const metadata: Metadata = {
  title: "Projects & Portfolio",
  description: "Representative engagements across industries — CCTV rollouts, network builds, fire safety, access control and managed IT, each engineered and documented.",
};

export const revalidate = 3600;

export default async function Page() {
  let dbOk = true;
  try {
    await getProjects();
  } catch (e) {
    if (e instanceof DatabaseUnavailableError) {
      dbOk = false;
    } else {
      throw e;
    }
  }

  if (!dbOk) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Content temporarily unavailable</h1>
          <p className="mt-2 text-muted-foreground">Please try again in a moment.</p>
        </div>
      </div>
    );
  }

  return <ProjectsView />;
}
