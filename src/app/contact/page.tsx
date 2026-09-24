import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactView } from "@/components/views/contact-view";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Talk to our engineering team about your site, risks and goals. Call, email, WhatsApp or send a message — we reply within one business day.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ContactView />
    </Suspense>
  );
}
