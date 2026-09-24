import type { Metadata } from "next";
import { SolutionsView } from "@/components/views/solutions-view";

export const metadata: Metadata = {
  title: "Solutions — Outcomes, Not Products",
  description:
    "Explore bundled solutions that solve real problems — unified security, resilient networks, cyber defence, life safety, smart buildings and managed IT.",
};

export default function Page() {
  return <SolutionsView />;
}
