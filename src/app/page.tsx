"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useSite } from "@/store/site-store";
import { SiteShell } from "@/components/site/site-shell";
import { HomeView } from "@/components/views/home-view";

// Lazy-load all secondary views for code-splitting & performance.
const AboutView = dynamic(() => import("@/components/views/about-view").then((m) => m.AboutView));
const ServicesView = dynamic(() => import("@/components/views/services-view").then((m) => m.ServicesView));
const ServiceDetailView = dynamic(() => import("@/components/views/service-detail-view").then((m) => m.ServiceDetailView));
const SolutionsView = dynamic(() => import("@/components/views/solutions-view").then((m) => m.SolutionsView));
const IndustriesView = dynamic(() => import("@/components/views/industries-view").then((m) => m.IndustriesView));
const IndustryDetailView = dynamic(() => import("@/components/views/industry-detail-view").then((m) => m.IndustryDetailView));
const ProjectsView = dynamic(() => import("@/components/views/projects-view").then((m) => m.ProjectsView));
const ProcessView = dynamic(() => import("@/components/views/process-view").then((m) => m.ProcessView));
const SupportView = dynamic(() => import("@/components/views/support-view").then((m) => m.SupportView));
const WhyChooseUsView = dynamic(() => import("@/components/views/why-choose-us-view").then((m) => m.WhyChooseUsView));
const TestimonialsView = dynamic(() => import("@/components/views/testimonials-view").then((m) => m.TestimonialsView));
const FaqsView = dynamic(() => import("@/components/views/faqs-view").then((m) => m.FaqsView));
const BlogView = dynamic(() => import("@/components/views/blog-view").then((m) => m.BlogView));
const BlogPostView = dynamic(() => import("@/components/views/blog-post-view").then((m) => m.BlogPostView));
const ContactView = dynamic(() => import("@/components/views/contact-view").then((m) => m.ContactView));
const QuoteView = dynamic(() => import("@/components/views/quote-view").then((m) => m.QuoteView));
const CareersView = dynamic(() => import("@/components/views/careers-view").then((m) => m.CareersView));
const PrivacyView = dynamic(() => import("@/components/views/privacy-view").then((m) => m.PrivacyView));
const TermsView = dynamic(() => import("@/components/views/terms-view").then((m) => m.TermsView));

function ViewFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  );
}

export default function Page() {
  const { view, params } = useSite();

  const renderView = () => {
    switch (view) {
      case "home":
        return <HomeView />;
      case "about":
        return <AboutView />;
      case "services":
        return <ServicesView />;
      case "service-detail":
        return <ServiceDetailView slug={params.slug} />;
      case "solutions":
        return <SolutionsView />;
      case "industries":
        return <IndustriesView />;
      case "industry-detail":
        return <IndustryDetailView id={params.slug} />;
      case "projects":
        return <ProjectsView />;
      case "process":
        return <ProcessView />;
      case "support":
        return <SupportView />;
      case "why-choose-us":
        return <WhyChooseUsView />;
      case "testimonials":
        return <TestimonialsView />;
      case "faqs":
        return <FaqsView />;
      case "blog":
        return <BlogView />;
      case "blog-post":
        return <BlogPostView slug={params.slug} />;
      case "contact":
        return <ContactView initialSubject={params.subject} />;
      case "quote":
        return <QuoteView initialSubject={params.subject} />;
      case "careers":
        return <CareersView />;
      case "privacy":
        return <PrivacyView />;
      case "terms":
        return <TermsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <SiteShell>
      <React.Suspense fallback={<ViewFallback />}>{renderView()}</React.Suspense>
    </SiteShell>
  );
}
