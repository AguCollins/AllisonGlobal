import type { Metadata } from "next";
import { SupportView } from "@/components/views/support-view";

export const metadata: Metadata = {
  title: "Maintenance & Support",
  description:
    "Keep your IT and security systems healthy with preventive maintenance, monitoring, priority support and managed services under one agreement.",
};

export default function Page() {
  return <SupportView />;
}
