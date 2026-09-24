import type { Metadata } from "next";
import { ProcessView } from "@/components/views/process-view";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "Every engagement follows an engineering-led path — from site assessment to design, supply, installation, commissioning and long-term support.",
};

export default function Page() {
  return <ProcessView />;
}
