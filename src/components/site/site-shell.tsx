import * as React from "react";
import { headers } from "next/headers";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import {
  getCompany,
  getNavigation,
  getCategories,
  getServices,
  getIndustries,
  type NavItem,
} from "@/lib/data-access";

/**
 * SiteShell renders the persistent Header + Footer around PUBLIC routes only.
 * This is a SERVER component that fetches ALL CMS data from the database and
 * passes it to the client-side Header and Footer components.
 *
 * Admin routes (/admin/*) have their own layout (AdminSidebar) and should
 * NOT show the public header/footer.
 *
 * If the database is unavailable, the public header/footer cannot render.
 * In that case we render children without chrome so the page's own error
 * boundary takes over.
 */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <main id="main" className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // Fetch all CMS data needed by header/footer in parallel.
  // If any fails (DB down), render children bare so the page error boundary shows.
  let nav: { main: NavItem[]; utility: NavItem[]; legal: NavItem[] };
  let company: Awaited<ReturnType<typeof getCompany>>;
  let categories: Awaited<ReturnType<typeof getCategories>>;
  let services: Awaited<ReturnType<typeof getServices>>;
  let industries: Awaited<ReturnType<typeof getIndustries>>;

  try {
    [nav, company, categories, services, industries] = await Promise.all([
      getNavigation(),
      getCompany(),
      getCategories(),
      getServices(),
      getIndustries(),
    ]);
  } catch {
    // DB unavailable — render bare so error.tsx can take over
    return (
      <div className="flex min-h-screen flex-col">
        <main id="main" className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // Filter to visible nav items, sorted by order
  const mainNav = nav.main.filter((n) => n.visible).sort((a, b) => a.order - b.order);
  const utilityNav = nav.utility.filter((n) => n.visible).sort((a, b) => a.order - b.order);
  const legalNav = nav.legal.filter((n) => n.visible).sort((a, b) => a.order - b.order);

  // Map categories for the header mega menu (only categories that have services)
  const serviceCategoriesForHeader = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    tagline: cat.tagline,
    services: services
      .filter((s) => s.categoryId === cat.id || s.categoryId === cat.slug)
      .map((s) => ({ slug: s.slug, name: s.name })),
  }));

  // Map data for footer
  const serviceCategoriesForFooter = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
  }));

  const industriesForFooter = industries.map((ind) => ({
    id: ind.id,
    name: ind.name,
  }));

  // Company info for header/footer
  const companyInfo = {
    name: company.name,
    legalName: company.legalName,
    shortPitch: company.shortPitch,
    longPitch: company.longPitch,
    contact: company.contact,
    location: company.location,
    social: company.social,
    foundedYear: company.foundedYear,
    foundedLabel: company.foundedLabel,
    rcNumber: company.rcNumber,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-foreground"
      >
        Skip to content
      </a>
      <Header
        navItems={mainNav}
        utilityNavItems={utilityNav}
        company={companyInfo}
        serviceCategories={serviceCategoriesForHeader}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer
        company={companyInfo}
        serviceCategories={serviceCategoriesForFooter}
        industries={industriesForFooter}
        mainNav={mainNav}
        utilityNav={utilityNav}
        legalNav={legalNav}
      />
    </div>
  );
}
