import type { Job } from "@/lib/types";

export const jobs: Job[] = [
  {
    id: "j1",
    title: "Network & Security Engineer",
    department: "Engineering",
    location: "Lagos, Nigeria (field-based)",
    type: "Full-time",
    summary:
      "Design, deploy and support network and cybersecurity infrastructure for our clients — from structured cabling and switching to firewalls and endpoint protection.",
    responsibilities: [
      "Design and deploy LAN/WAN, Wi-Fi and network security solutions",
      "Configure firewalls, switches, routers and endpoint protection",
      "Conduct site assessments and produce technical documentation",
      "Commission and integrate systems end-to-end",
      "Provide field support and troubleshooting for clients",
    ],
    requirements: [
      "Degree in Electrical/Electronics Engineering, Computer Engineering or related field",
      "Hands-on experience with enterprise networking and security",
      "Familiarity with VLANs, routing, VPNs and next-gen firewalls",
      "Strong troubleshooting and documentation discipline",
    ],
    niceToHave: [
      "Vendor certifications (Cisco, Fortinet, Ubiquiti)",
      "Experience with surveillance and access control integration",
    ],
  },
  {
    id: "j2",
    title: "Surveillance & Access Control Technician",
    department: "Installation",
    location: "Lagos, Nigeria (field-based)",
    type: "Full-time",
    summary:
      "Install and commission CCTV, access control, intercom and alarm systems to standard across client sites, with clean, documented work.",
    responsibilities: [
      "Install CCTV, access control, intercom and alarm systems",
      "Mount and wire equipment cleanly and to standard",
      "Configure and commission systems end-to-end",
      "Test and validate coverage, recording and integration",
      "Produce handover documentation",
    ],
    requirements: [
      "Proven field experience installing CCTV and access control",
      "Comfortable working at heights and across site types",
      "Strong attention to cabling quality and finish",
      "Customer-facing professionalism",
    ],
    niceToHave: [
      "Experience with Hikvision, Dahua, ZKTeco platforms",
      "Structured cabling and basic networking knowledge",
    ],
  },
  {
    id: "j3",
    title: "IT Support Specialist",
    department: "Managed Services",
    location: "Lagos, Nigeria",
    type: "Full-time",
    summary:
      "Provide responsive remote and on-site IT support to managed-service clients — resolving issues fast and getting to root causes, not just symptoms.",
    responsibilities: [
      "Provide remote and on-site IT support to clients",
      "Manage workstations, accounts and day-to-day IT operations",
      "Monitor systems and respond to alerts",
      "Document issues, resolutions and client environments",
      "Escalate and coordinate complex issues",
    ],
    requirements: [
      "Experience in IT helpdesk or support roles",
      "Strong Windows and basic server/networking knowledge",
      "Excellent communication and customer service",
      "Methodical troubleshooting approach",
    ],
    niceToHave: [
      "Familiarity with RMM and ticketing platforms",
      "Experience supporting small businesses",
    ],
  },
  {
    id: "j4",
    title: "Sales & Solutions Consultant",
    department: "Business Development",
    location: "Lagos, Nigeria",
    type: "Full-time",
    summary:
      "Engage prospective clients, understand their needs, and connect them with the right Allison Global solutions — backed by our engineering team.",
    responsibilities: [
      "Engage and qualify inbound and outbound prospects",
      "Conduct needs analysis and propose solutions",
      "Coordinate site assessments with engineering",
      "Prepare proposals and close engagements",
      "Build and maintain client relationships",
    ],
    requirements: [
      "Proven B2B sales experience, preferably in IT or security",
      "Strong consultative selling and relationship-building",
      "Ability to understand technical solutions and translate for clients",
      "Self-driven and target-oriented",
    ],
    niceToHave: [
      "Existing network in Nigerian corporate or institutional sectors",
      "Technical background or certifications",
    ],
  },
];

export const careersIntro =
  "Allison Global is an engineering-led technology and security solutions partner. We're building a team that takes ownership of outcomes — engineers, technicians and consultants who treat every client's systems as their own. If you value clean work, honest counsel and long-term partnership, we'd like to hear from you.";

export const careersPerks = [
  {
    title: "Engineering-led culture",
    description:
      "Work alongside an Electrical & Electronics Engineer and a team that values proper design over shortcuts.",
    icon: "Cpu",
  },
  {
    title: "Real ownership",
    description:
      "Take ownership of projects end-to-end — from assessment to handover and beyond.",
    icon: "Target",
  },
  {
    title: "Diverse engagements",
    description:
      "Work across networking, cybersecurity, surveillance, access control and IT — not a narrow specialty.",
    icon: "Layers",
  },
  {
    title: "Continuous growth",
    description:
      "We invest in training and exposure to enterprise-grade technologies and real field experience.",
    icon: "TrendingUp",
  },
];
