import type { Metadata } from "next";
import { FaqsView } from "@/components/views/faqs-view";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to the questions we hear most — about services, process, support, security, coverage and more.",
};

export default function Page() {
  return <FaqsView />;
}
