import type { Metadata } from "next";
import { PrivacyView } from "@/components/views/privacy-view";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Allison Global collects, uses and protects your personal data when you interact with our website and services.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <PrivacyView />;
}
