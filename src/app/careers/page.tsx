import type { Metadata } from "next";
import { CareersView } from "@/components/views/careers-view";
import { DataError } from "@/components/site/data-error";
import {
  getCareers,
  getCompany,
  DatabaseUnavailableError,
  type CareersContent,
  type CompanyInfo,
} from "@/lib/data-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Build a career engineering trust. Join an engineering-led team across networking, security, surveillance, IT support and business development.",
};

export default async function Page() {
  let dbOk = true;
  let careers: CareersContent | null = null;
  let company: CompanyInfo | null = null;

  try {
    [careers, company] = await Promise.all([
      getCareers(),
      getCompany(),
    ]);
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      dbOk = false;
    } else {
      throw err;
    }
  }

  if (!dbOk || !careers || !company) {
    return <DataError />;
  }

  return (
    <CareersView
      careers={careers}
      heroImage=""
      company={{
        contact: {
          phoneDisplay: company.contact.phoneDisplay,
          phoneIntl: company.contact.phoneIntl,
          email: company.contact.email,
        },
        founder: {
          name: company.founder.name,
          title: company.founder.title,
        },
        location: {
          city: company.location.city,
          country: company.location.country,
        },
      }}
    />
  );
}
