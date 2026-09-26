import {
  getCompany,
  getCategories,
  getServices,
  getIndustries,
  getProjects,
  getProcessSteps,
  getTestimonials,
  getBlogPosts,
  DatabaseUnavailableError,
  type CompanyInfo,
  type ProcessStepRecord,
} from "@/lib/data-access";
import type {
  ServiceCategory,
  Service,
  Industry,
  Project,
  Testimonial,
  BlogPost,
} from "@/lib/types";
import { DataError } from "@/components/site/data-error";
import { HomeView } from "@/components/views/home-view";

export const dynamic = "force-dynamic";

export default async function Page() {
  let dbOk = true;
  let company: CompanyInfo | null = null;
  let categories: ServiceCategory[] = [];
  let services: Service[] = [];
  let industries: Industry[] = [];
  let projects: Project[] = [];
  let processSteps: ProcessStepRecord[] = [];
  let testimonials: Testimonial[] = [];
  let blogPosts: BlogPost[] = [];

  try {
    [
      company,
      categories,
      services,
      industries,
      projects,
      processSteps,
      testimonials,
      blogPosts,
    ] = await Promise.all([
      getCompany(),
      getCategories(),
      getServices(),
      getIndustries(),
      getProjects(),
      getProcessSteps(),
      getTestimonials(),
      getBlogPosts(),
    ]);
  } catch (e) {
    if (e instanceof DatabaseUnavailableError) {
      dbOk = false;
    } else {
      throw e;
    }
  }

  if (!dbOk || !company) {
    return <DataError message="Home content is not available. Please check back shortly." />;
  }

  return (
    <HomeView
      company={company}
      categories={categories}
      services={services}
      industries={industries}
      projects={projects}
      processSteps={processSteps}
      testimonials={testimonials}
      blogPosts={blogPosts}
      heroImage=""
    />
  );
}
