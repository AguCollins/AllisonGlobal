import type { Metadata } from "next";
import { IndustriesView } from "@/components/views/industries-view";

export const metadata: Metadata = {
  title: "Industries We Serve",
  description:
    "From homes and offices to hospitals, hotels, factories and construction sites — see how we tailor ICT and security solutions to your sector.",
};

export default function Page() {
  return <IndustriesView />;
}
