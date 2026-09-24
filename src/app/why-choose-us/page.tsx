import type { Metadata } from "next";
import { WhyChooseUsView } from "@/components/views/why-choose-us-view";

export const metadata: Metadata = {
  title: "Why Choose Us",
  description:
    "One partner for the full ICT and security stack — engineering-led, integrated, documented and supported for the long term.",
};

export default function Page() {
  return <WhyChooseUsView />;
}
