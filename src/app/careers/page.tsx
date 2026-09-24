import type { Metadata } from "next";
import { CareersView } from "@/components/views/careers-view";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Build a career engineering trust. Join an engineering-led team across networking, security, surveillance, IT support and business development.",
};

export default function Page() {
  return <CareersView />;
}
