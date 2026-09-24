import type { Metadata } from "next";
import { TermsView } from "@/components/views/terms-view";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that govern your use of the Allison Global website and the engagement of our services.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <TermsView />;
}
