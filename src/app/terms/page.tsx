import type { Metadata } from "next";
import { TermsView } from "@/components/views/terms-view";
import { DataError } from "@/components/site/data-error";
import {
  getLegalTerms,
  getCompany,
  DatabaseUnavailableError,
  type LegalDocument,
  type CompanyInfo,
} from "@/lib/data-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that govern your use of the Allison Global website and the engagement of our services.",
  robots: { index: false, follow: true },
};

export default async function Page() {
  let dbOk = true;
  let document: LegalDocument | null = null;
  let company: CompanyInfo | null = null;

  try {
    [document, company] = await Promise.all([
      getLegalTerms(),
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
      <DataError message="Terms & Conditions document is not available. Please check back shortly." />
    );
  }

  return (
    <TermsView
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
