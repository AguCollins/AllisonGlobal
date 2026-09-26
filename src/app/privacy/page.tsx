import type { Metadata } from "next";
import { PrivacyView } from "@/components/views/privacy-view";
import { DataError } from "@/components/site/data-error";
import {
  getLegalPrivacy,
  getCompany,
  DatabaseUnavailableError,
  type LegalDocument,
  type CompanyInfo,
} from "@/lib/data-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Allison Global collects, uses and protects your personal data when you interact with our website and services.",
  robots: { index: false, follow: true },
};

export default async function Page() {
  let dbOk = true;
  let document: LegalDocument | null = null;
  let company: CompanyInfo | null = null;

  try {
    [document, company] = await Promise.all([
      getLegalPrivacy(),
      getCompany(),
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

  if (!document || !company) {
    return (
      <DataError message="Privacy policy is not available. Please check back shortly." />
    );
  }

  return (
    <PrivacyView
      document={document}
      heroImage=""
      company={{
        contact: {
          phoneDisplay: company.contact.phoneDisplay,
          phoneIntl: company.contact.phoneIntl,
          email: company.contact.email,
        },
      }}
    />
  );
}
