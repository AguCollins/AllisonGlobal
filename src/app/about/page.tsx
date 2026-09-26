import type { Metadata } from "next";
import { AboutView } from "@/components/views/about-view";
import { DataError } from "@/components/site/data-error";
import {
  getCompany,
  DatabaseUnavailableError,
  type CompanyInfo,
} from "@/lib/data-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Allison Global is a Nigerian, engineering-led ICT and security solutions partner — founded by Agu Chisom Alvin to design, install and maintain systems end-to-end, not as disconnected products.",
};

export default async function Page() {
  let dbOk = true;
  let company: CompanyInfo | null = null;

  try {
    company = await getCompany();
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
      <DataError message="About content is not available. Please check back shortly." />
    );
  }

  return <AboutView company={company} heroImage="" />;
}
