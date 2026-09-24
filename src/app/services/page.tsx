import type { Metadata } from "next";
import { getServices, DatabaseUnavailableError } from "@/lib/data-access";
import { ServicesView } from "@/components/views/services-view";

export const metadata: Metadata = {
  title: "Services — ICT, Networking, Cybersecurity & Security Solutions",
  description:
    "Browse our full range of ICT and security services — structured cabling, networks, cybersecurity, CCTV, access control, fire safety and IT infrastructure, engineered under one team.",
};

export const revalidate = 3600;

export default async function Page() {
  let dbOk = true;
  try {
    await getServices();
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
          <p className="mt-2 text-muted-foreground">
            We're experiencing a technical issue. Please try again in a moment.
          </p>
        </div>
      </div>
    );
  }

  return <ServicesView />;
}
