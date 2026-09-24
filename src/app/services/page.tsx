import type { Metadata } from "next";
import { getServices, getCategories } from "@/lib/data-access";
import { ServicesView } from "@/components/views/services-view";

export const metadata: Metadata = {
  title: "Services — ICT, Networking, Cybersecurity & Security Solutions",
  description:
    "Browse our full range of ICT and security services — structured cabling, networks, cybersecurity, CCTV, access control, fire safety and IT infrastructure, engineered under one team.",
};

// Revalidate every hour (ISR) — admin changes trigger immediate revalidation via revalidatePath.
export const revalidate = 3600;

export default async function Page() {
  const [services, categories] = await Promise.all([
    getServices(),
    getCategories(),
  ]);

  return <ServicesView services={services} categories={categories} />;
}
