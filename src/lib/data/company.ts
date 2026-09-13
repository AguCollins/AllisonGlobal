/**
 * Allison Global — company identity & contact.
 * Original brand. CEO/Founder: Agu Chisom Alvin (Electrical & Electronics Engineer).
 */
export const company = {
  name: "Allison Global",
  legalName: "Allison Global Technologies",
  tagline: "Engineering Trust. Securing Futures.",
  descriptor:
    "ICT, Networking, Cybersecurity & Electronic Security Solutions",
  foundedYear: "2017",
  shortPitch:
    "A Nigerian technology and security solutions partner. We assess, design, supply, install, integrate and maintain the systems that keep your people, data and property secure — under one accountable team.",
  longPitch:
    "Allison Global is a technology and security solutions partner serving homes, offices, businesses, institutions and industries across Nigeria. We bring together ICT, networking, cybersecurity and electronic security under one engineering-led team — so your infrastructure, surveillance, access control and fire safety systems are designed to work as one, not as isolated products. From the first site assessment to long-term managed support, we own the outcome.",
  location: {
    city: "Lagos",
    country: "Nigeria",
    coverage:
      "Headquartered in Lagos, delivering projects nationwide with rapid-response support across major Nigerian cities.",
    addressLine: "Lagos, Nigeria",
  },
  contact: {
    phone: "09152158801",
    phoneDisplay: "+234 915 215 8801",
    phoneIntl: "+2349152158801",
    email: "hello@allisonglobal.tech",
    salesEmail: "sales@allisonglobal.tech",
    supportEmail: "support@allisonglobal.tech",
    whatsapp: "2349152158801",
    hours: "Mon–Sat: 8:00am – 6:00pm · Emergency support 24/7",
  },
  social: {
    linkedin: "#",
    facebook: "#",
    instagram: "#",
    x: "#",
  },
  founder: {
    name: "Agu Chisom Alvin",
    title: "Founder & Chief Executive Officer",
    discipline: "Electrical & Electronics Engineer",
    bio: "Agu Chisom Alvin is an Electrical & Electronics Engineer who founded Allison Global to close a gap he kept seeing on site: organisations buying good equipment, then losing value because nobody engineered the whole system end-to-end. He leads Allison Global with a field-first, engineering-led approach — every project is treated as a system, not a shopping list, and every client gets a single accountable partner from assessment through to long-term support.",
    phone: "09152158801",
  },
};

/** Primary navigation. The Services item opens a mega-menu (handled in header). */
export const mainNav = [
  { label: "Home", view: "home" as const },
  { label: "About", view: "about" as const },
  { label: "Services", view: "services" as const, hasMega: true },
  { label: "Solutions", view: "solutions" as const },
  { label: "Industries", view: "industries" as const },
  { label: "Projects", view: "projects" as const },
  { label: "Insights", view: "blog" as const },
  { label: "Contact", view: "contact" as const },
];

/** Secondary/utility nav items (footer + more menu). */
export const utilityNav = [
  { label: "Our Process", view: "process" as const },
  { label: "Why Choose Us", view: "why-choose-us" as const },
  { label: "Maintenance & Support", view: "support" as const },
  { label: "Testimonials", view: "testimonials" as const },
  { label: "FAQs", view: "faqs" as const },
  { label: "Careers", view: "careers" as const },
];

export const legalNav = [
  { label: "Privacy Policy", view: "privacy" as const },
  { label: "Terms & Conditions", view: "terms" as const },
];

/** Core company values. */
export const values = [
  {
    title: "Engineering First",
    description:
      "We design before we deploy. Every system is specified, documented and engineered to your site — not assembled from whatever is in stock.",
    icon: "Ruler",
  },
  {
    title: "Single Accountability",
    description:
      "One partner owns your network, security, surveillance, access and fire systems. No finger-pointing between vendors when something matters.",
    icon: "Handshake",
  },
  {
    title: "Security by Default",
    description:
      "Protection is built in — hardened networks, segmented systems, monitored alerts — not bolted on after installation.",
    icon: "ShieldCheck",
  },
  {
    title: "Long-Term Partnership",
    description:
      "We stay after handover. Preventive maintenance, rapid response and continuous improvement keep your systems working for years.",
    icon: "HeartHandshake",
  },
  {
    title: "Honest Counsel",
    description:
      "We tell you what your site actually needs — and what it doesn't. Recommendations are driven by risk and value, not commission.",
    icon: "BadgeCheck",
  },
  {
    title: "Local Presence, Global Standards",
    description:
      "Nigerian-based, on the ground, with engineering standards and technology choices aligned to international best practice.",
    icon: "Globe",
  },
];

/** Capability stats — framed honestly around capability, not fabricated claims. */
export const capabilityStats = [
  { value: "6", label: "Core service domains", sub: "under one team" },
  { value: "24+", label: "Specialist services", sub: "across ICT & security" },
  { value: "13", label: "Industries served", sub: "homes to institutions" },
  { value: "< 4h", label: "Target response time", sub: "for priority support" },
];

/** Service guarantees — honest commitments we can stand behind. */
export const guarantees = [
  {
    title: "Documented Handover",
    description:
      "Every project is delivered with as-built documentation, system diagrams, credentials and a maintenance schedule.",
    icon: "FileCheck",
  },
  {
    title: "Workmanship Warranty",
    description:
      "Installations are covered by a workmanship warranty so defects in our installation work are put right, not argued over.",
    icon: "ShieldCheck",
  },
  {
    title: "Priority Support SLA",
    description:
      "Managed-support clients get defined response-time targets and a direct line to engineers who know your site.",
    icon: "Clock",
  },
  {
    title: "Vendor-Neutral Advice",
    description:
      "We specify the right equipment for the job from the brands we genuinely deploy — not the one paying the highest margin.",
    icon: "Scale",
  },
];

/** Technology platforms we deploy (competence, not claimed certification). */
export const technologyPlatforms = [
  { name: "Hikvision", domain: "Surveillance" },
  { name: "Dahua", domain: "Surveillance" },
  { name: "Ubiquiti UniFi", domain: "Networking" },
  { name: "Cisco", domain: "Networking" },
  { name: "MikroTik", domain: "Networking" },
  { name: "Fortinet FortiGate", domain: "Network Security" },
  { name: "SonicWall", domain: "Network Security" },
  { name: "ZKTeco", domain: "Access Control & Biometrics" },
  { name: "Honeywell", domain: "Fire & Intrusion" },
  { name: "Bosch", domain: "Security & Audio" },
  { name: "APC by Schneider", domain: "Power & Data Centre" },
  { name: "Microsoft", domain: "IT Infrastructure" },
  { name: "Veeam", domain: "Backup & Recovery" },
  { name: "Bitdefender", domain: "Endpoint Security" },
];

/** Why choose us — differentiators. */
export const differentiators = [
  {
    title: "One partner, full stack",
    description:
      "Networking, cybersecurity, CCTV, access control, alarms, fire safety and IT infrastructure — engineered together by one accountable team instead of five disconnected vendors.",
    icon: "Layers",
  },
  {
    title: "Engineering-led, field-tested",
    description:
      "Led by an Electrical & Electronics Engineer, our work is grounded in proper design, load calculations, cable specs and signal integrity — not guesswork.",
    icon: "Cpu",
  },
  {
    title: "Designed for your site",
    description:
      "We assess your environment, risk profile and growth plans, then design systems that fit — not generic packages pushed onto every client.",
    icon: "Map",
  },
  {
    title: "Integrated, not isolated",
    description:
      "CCTV that talks to access control, networks that carry surveillance cleanly, alarms that escalate to your phone. Systems that work as one.",
    icon: "Network",
  },
  {
    title: "Rapid local response",
    description:
      "Based in Nigeria with field engineers who can get to your site fast — critical when a camera, firewall or door access system goes down.",
    icon: "Zap",
  },
  {
    title: "Lifecycle support",
    description:
      "Preventive maintenance, monitoring and managed services that keep systems healthy long after the installers have left.",
    icon: "LifeBuoy",
  },
  {
    title: "Honest specification",
    description:
      "We specify equipment that fits the risk and the budget — and we'll tell you when a cheaper option is enough, or when it isn't.",
    icon: "Scale",
  },
  {
    title: "Documented & transferable",
    description:
      "As-built drawings, credentials, manuals and maintenance schedules, so your systems are manageable — by us or anyone who follows.",
    icon: "FileCheck",
  },
];
