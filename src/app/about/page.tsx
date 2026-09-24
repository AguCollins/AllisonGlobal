import type { Metadata } from "next";
import { AboutView } from "@/components/views/about-view";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Allison Global is a Nigerian, engineering-led ICT and security solutions partner — founded by Agu Chisom Alvin to design, install and maintain systems end-to-end, not as disconnected products.",
};

export default function Page() {
  return <AboutView />;
}
