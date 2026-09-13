import type { Faq } from "@/lib/types";

export const faqs: Faq[] = [
  // Services & scope
  {
    id: "f1",
    category: "Services & Scope",
    question: "What services does Allison Global offer?",
    answer:
      "We cover six core domains: Network & Connectivity, Cybersecurity, Surveillance & Monitoring, Access Control & Automation, Alarm & Fire Safety, and IT Infrastructure & Support. Each spans multiple specialist services — from structured cabling to managed IT — so your network, security and IT systems are handled by one engineering-led team.",
  },
  {
    id: "f2",
    category: "Services & Scope",
    question: "Do you work on both homes and businesses?",
    answer:
      "Yes. We serve homes and residential estates, offices, businesses, institutions and industries. The scale differs, but the engineering approach is the same — assess, design, install, integrate and support. Explore our Industries section for sector-specific guidance.",
  },
  {
    id: "f3",
    category: "Services & Scope",
    question: "Can you integrate CCTV, access control, alarms and networking?",
    answer:
      "Absolutely — integration is a core strength. Many security issues come from systems that don't talk to each other. We design CCTV, access control, alarms and networking to work as one platform, so an event on one system triggers the right response across the others.",
  },
  {
    id: "f4",
    category: "Services & Scope",
    question: "Do you supply the equipment, or only install?",
    answer:
      "We do both. We assess, design, supply, install, integrate and maintain. Equipment is sourced through proper channels as genuine, warrantied product — we don't silently substitute cheaper alternatives.",
  },
  // Process & engagement
  {
    id: "f5",
    category: "Process & Engagement",
    question: "How does a project typically start?",
    answer:
      "It starts with a consultation and site assessment. A senior engineer visits your site, understands your needs and risks, and documents what's actually required. You then receive a clear proposal with scope, equipment and pricing before any work begins.",
  },
  {
    id: "f6",
    category: "Process & Engagement",
    question: "Do you provide documentation after installation?",
    answer:
      "Yes — every project is handed over with as-built documentation, system diagrams, credentials, manuals and a maintenance schedule. We believe a system you can't document or manage isn't truly finished.",
  },
  {
    id: "f7",
    category: "Process & Engagement",
    question: "Can you work with equipment we already have?",
    answer:
      "In many cases, yes. During the assessment we review your existing infrastructure and advise what can be retained, upgraded or replaced. We won't push a full rip-and-replace where integration is the smarter move.",
  },
  {
    id: "f8",
    category: "Process & Engagement",
    question: "How long does a typical installation take?",
    answer:
      "It depends on scope. A small CCTV or access control install can take a day or two; a full office network or multi-site rollout takes longer and is phased to minimise disruption. You'll get a clear timeline in your proposal.",
  },
  // Support & maintenance
  {
    id: "f9",
    category: "Support & Maintenance",
    question: "Do you offer ongoing support and maintenance?",
    answer:
      "Yes — through our Managed Services & Technical Support plans. We provide preventive maintenance, monitoring, priority support and ongoing improvement under a predictable agreement, so your systems stay healthy long after installation.",
  },
  {
    id: "f10",
    category: "Support & Maintenance",
    question: "How quickly can you respond to support requests?",
    answer:
      "Managed-support clients have defined response-time SLAs, with a target priority response of under 4 hours for critical issues. For ad-hoc support, we respond as quickly as our engineering schedule allows and prioritise urgent security issues.",
  },
  {
    id: "f11",
    category: "Support & Maintenance",
    question: "Is there a warranty on your installations?",
    answer:
      "Installations are covered by a workmanship warranty so defects in our installation work are put right. Equipment itself carries the manufacturer's warranty, which we help you manage and claim where needed.",
  },
  // Security & data
  {
    id: "f12",
    category: "Security & Data",
    question: "How do you keep our network and data secure?",
    answer:
      "Security is built in, not bolted on. We design segmented networks, deploy next-gen firewalls and endpoint protection, follow least-privilege access, and document credentials securely. For clients under managed support, we apply ongoing patching and monitoring.",
  },
  {
    id: "f13",
    category: "Security & Data",
    question: "Can you help us with cybersecurity if we have no in-house team?",
    answer:
      "Yes — that's exactly what our Cybersecurity services and Managed Services are designed for. We act as your security partner: assessing risk, deploying defences, and monitoring and maintaining them, so you don't need an in-house security team to be protected.",
  },
  {
    id: "f14",
    category: "Security & Data",
    question: "Do you offer security assessments and audits?",
    answer:
      "Yes. Our Security Assessment & Consultation service evaluates your network, systems and physical security against real threats and produces a prioritised, jargon-free remediation roadmap — ideal if you're unsure where your risks actually lie.",
  },
  // Location & coverage
  {
    id: "f15",
    category: "Location & Coverage",
    question: "Where are you based, and which areas do you cover?",
    answer:
      "We're headquartered in Lagos, Nigeria, and deliver projects nationwide with rapid-response support across major Nigerian cities. For sites outside our immediate area, we plan travel and logistics as part of the project.",
  },
  {
    id: "f16",
    category: "Location & Coverage",
    question: "Can you support multiple sites across different locations?",
    answer:
      "Yes. We frequently deploy unified surveillance, networking and security across multiple branches or sites, with centralised management and monitoring so you get one view and one accountable partner across locations.",
  },
];

export const faqCategories = Array.from(
  new Set(faqs.map((f) => f.category)),
);
