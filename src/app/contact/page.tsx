import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactView } from "@/components/views/contact-view";
import { DataError } from "@/components/site/data-error";
import {
  getCompany,
  getIndustries,
  DatabaseUnavailableError,
  type CompanyInfo,
} from "@/lib/data-access";
import type { Industry } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Talk to our engineering team about your site, risks and goals. Call, email, WhatsApp or send a message — we reply within one business day.",
};

export default async function Page() {
  let dbOk = true;
  let company: CompanyInfo | null = null;
  let industries: Industry[] = [];

  try {
    [company, industries] = await Promise.all([
      getCompany(),
      getIndustries(),
    ]);
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      dbOk = false;
    } else {
      throw err;
    }
  }

  if (!dbOk) {
    return <DataError />;
  }

  if (!company) {
    return (
      <DataError message="Contact content is not available. Please check back shortly." />
    );
  }

  return (
    <Suspense fallback={null}>
      <ContactView company={company} industries={industries} heroImage="" />
    </Suspense>
  );
}
