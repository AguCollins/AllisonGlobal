import type { ContentBlock } from "@/components/blog/blog-block-renderer";
import type { LucideIcon } from "lucide-react";

/** All navigable views in the single-page application. */
export type ViewId =
  | "home"
  | "about"
  | "services"
  | "service-detail"
  | "solutions"
  | "industries"
  | "industry-detail"
  | "projects"
  | "process"
  | "support"
  | "why-choose-us"
  | "testimonials"
  | "faqs"
  | "blog"
  | "blog-post"
  | "contact"
  | "quote"
  | "careers"
  | "privacy"
  | "terms";

export interface NavParam {
  /** slug for service / industry / blog post */
  slug?: string;
  /** optional context, e.g. prefill quote subject */
  subject?: string;
  /** anchor / section id to scroll to within a view */
  anchor?: string;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  accent: string; // tailwind gradient classes
  services: string[]; // service slugs in this category
}

export interface ServiceFeature {
  title: string;
  description: string;
}

export interface Service {
  slug: string;
  name: string;
  categoryId: string;
  iconName: string;
  tagline: string;
  shortDescription: string;
  overview: string;
  problem: string[];
  solution: string;
  deliverables: ServiceFeature[];
  benefits: string[];
  tech: string[]; // technologies / platforms deployed
  relatedServices: string[]; // slugs
  relatedIndustries: string[]; // industry ids
  faqs?: { q: string; a: string }[];
  featured?: boolean;
}

export interface ProcessStep {
  step: number;
  id: string;
  title: string;
  summary: string;
  description: string;
  icon: LucideIcon;
  activities: string[];
  deliverable: string;
}

export interface Industry {
  id: string;
  name: string;
  iconName: string;
  tagline: string;
  summary: string;
  challenges: string[];
  solutions: string[]; // service slugs
  outcomes: string[];
  imageQuery: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  industry: string; // industry id
  services: string[]; // service slugs
  location: string;
  scope: string;
  description: string;
  highlights: string[];
  imageQuery: string;
  year: string;
  featured?: boolean;
}

export interface Solution {
  id: string;
  name: string;
  iconName: string;
  summary: string;
  description: string;
  components: string[]; // service slugs
  outcomes: string[];
  bestFor: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  authorName?: string;
  authorRole: string;
  sector: string; // industry id
  rating: number;
  projectType: string;
}

export interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  authorRole: string;
  imageQuery: string;
  /** Array of content blocks — typed blocks ({type, ...}) or legacy
   *  {heading?, body} blocks. Both shapes are rendered by the shared
   *  BlogBlockRenderer component. */
  content: ContentBlock[];
  tags: string[];
  featured?: boolean;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
}

export interface Stat {
  value: string;
  label: string;
  sub?: string;
}
