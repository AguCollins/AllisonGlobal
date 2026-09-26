import type { Metadata } from "next";
import { FaqsView } from "@/components/views/faqs-view";
import { DataError } from "@/components/site/data-error";
import {
  getFaqs,
  getCompany,
  DatabaseUnavailableError,
  type CompanyInfo,
} from "@/lib/data-access";
import type { Faq } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to the questions we hear most — about services, process, support, security, coverage and more.",
};

export default async function Page() {
  let dbOk = true;
  let faqs: Faq[] = [];
  let company: CompanyInfo | null = null;

  try {
    [faqs, company] = await Promise.all([
      getFaqs(),
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

  if (!company) {
    return (
      <DataError message="FAQ content is not available. Please check back shortly." />
    );
  }

  return <FaqsView faqs={faqs} company={company} heroImage="" />;
}
