import type { Project } from "@/lib/types";

/**
 * Representative project case studies.
 *
 * These describe the *type, scope and outcome* of engagements Allison Global
 * undertakes. They are illustrative of our capability and are presented as
 * representative case studies rather than named client endorsements.
 */
export const projects: Project[] = [
  {
    id: "p-001",
    title: "Multi-Site Retail Surveillance & Alarm Rollout",
    category: "Surveillance & Alarms",
    industry: "retail",
    services: ["cctv-installation", "burglar-alarm-systems", "video-monitoring", "lan-wan"],
    location: "Lagos & Ogun",
    scope: "8 retail locations · unified monitoring",
    description:
      "A regional retail chain needed consistent surveillance and intrusion detection across eight branches, viewable from a central location. We standardised CCTV and alarm systems across all sites and unified them on a single monitoring platform, reducing after-hours losses and giving management real-time visibility.",
    highlights: [
      "Standardised CCTV and alarms across 8 branches",
      "Centralised multi-site monitoring platform",
      "Out-of-hours intrusion alerts to management",
      "Reduced shrinkage and faster incident review",
    ],
    imageQuery: "retail store surveillance camera system installation",
    year: "2024",
    featured: true,
  },
  {
    id: "p-002",
    title: "Corporate Office Network & Cybersecurity Build",
    category: "Network & Cybersecurity",
    industry: "corporate",
    services: ["structured-cabling", "lan-wan", "network-security", "firewall-endpoint-protection", "access-control-systems"],
    location: "Lagos (Victoria Island)",
    scope: "6-floor HQ · 300+ users",
    description:
      "A growing professional-services firm needed a secure, segmented network for a new headquarters. We engineered the cabling, switching, firewalling and access control for a six-floor office, with separate networks for staff, guests and building systems, plus endpoint protection across all workstations.",
    highlights: [
      "Structured cabling and managed switching across 6 floors",
      "Segmented networks for staff, guests and building systems",
      "Next-gen firewall and endpoint protection deployed",
      "Access control with audit trail across the building",
    ],
    imageQuery: "modern corporate office server room and network racks",
    year: "2024",
    featured: true,
  },
  {
    id: "p-003",
    title: "Hotel Fire Safety & Guest Access Integration",
    category: "Fire Safety & Access",
    industry: "hospitality",
    services: ["fire-alarm-systems", "access-control-systems", "intercom-systems", "cctv-installation"],
    location: "Lekki, Lagos",
    scope: "Boutique hotel · 60 rooms",
    description:
      "A boutique hotel required compliant fire detection and guest access control that didn't compromise the guest experience. We installed an addressable fire alarm system integrated with door access for safe evacuation, plus discreet surveillance and video intercoms at the entrance.",
    highlights: [
      "Addressable fire alarm system with full coverage",
      "Door access integrated with fire-alarm evacuation release",
      "Discreet surveillance of public and service areas",
      "Video intercom with remote gate unlock",
    ],
    imageQuery: "boutique hotel lobby fire safety and access control systems",
    year: "2023",
    featured: true,
  },
  {
    id: "p-004",
    title: "Warehouse Perimeter & Inventory Protection",
    category: "Perimeter & Surveillance",
    industry: "warehouse",
    services: ["perimeter-intrusion", "cctv-installation", "access-control-systems", "burglar-alarm-systems"],
    location: "Agbara, Ogun",
    scope: "Large logistics warehouse",
    description:
      "A logistics operator was losing inventory to perimeter breaches. We deployed active infrared beam detection along the perimeter, integrated with CCTV that triggers recording on breach, plus access control for staff and vehicle entry and an intrusion alarm system.",
    highlights: [
      "Perimeter beam detection along the full boundary",
      "CCTV triggered recording on perimeter breach",
      "Access control for staff and vehicles",
      "Integrated alarm and alerting",
    ],
    imageQuery: "warehouse perimeter security infrared beam cameras at night",
    year: "2023",
  },
  {
    id: "p-005",
    title: "School Campus Wi-Fi & Surveillance",
    category: "Networking & Surveillance",
    industry: "education",
    services: ["wifi-installation", "cctv-installation", "lan-wan", "access-control-systems"],
    location: "Ibadan, Oyo",
    scope: "Campus · multiple buildings",
    description:
      "A school needed campus-wide Wi-Fi for staff and students, plus surveillance to improve safety. We heat-mapped and deployed enterprise Wi-Fi across all buildings, installed CCTV at key areas, and added access control to labs and administrative offices.",
    highlights: [
      "Heat-mapped enterprise Wi-Fi across the campus",
      "Segmented networks for staff, students and guests",
      "CCTV coverage of key campus areas",
      "Access control for labs and offices",
    ],
    imageQuery: "school campus wifi access points and security cameras",
    year: "2024",
  },
  {
    id: "p-006",
    title: "Hospital Server Room & Resilient IT",
    category: "IT Infrastructure",
    industry: "healthcare",
    services: ["server-data-centre", "network-security", "computer-it-support", "fire-detection-safety"],
    location: "Surulere, Lagos",
    scope: "Hospital data centre",
    description:
      "A hospital needed resilient IT infrastructure for patient systems and data. We built out the server room with proper racks, UPS, cooling and backup, hardened the network, and put the IT estate under managed support — protecting both uptime and patient data.",
    highlights: [
      "Server room fit-out with racks, UPS and cooling",
      "Backup and recovery strategy with tested restore",
      "Network hardening and segmentation",
      "Ongoing managed IT support",
    ],
    imageQuery: "hospital server room with racks ups and cooling",
    year: "2023",
  },
  {
    id: "p-007",
    title: "Construction Site Mobile Surveillance",
    category: "Surveillance",
    industry: "construction",
    services: ["cctv-installation", "video-monitoring", "perimeter-intrusion", "burglar-alarm-systems"],
    location: "Eko Atlantic, Lagos",
    scope: "Live construction site",
    description:
      "A developer was losing materials to night-time theft on a live construction site. We deployed mobile surveillance with perimeter detection and remote monitoring — equipment that could move as the site progressed — deterring theft and providing evidence.",
    highlights: [
      "Mobile surveillance adaptable to site changes",
      "Perimeter detection with remote alerts",
      "No fixed infrastructure required",
      "Reduced material losses",
    ],
    imageQuery: "construction site mobile surveillance cameras at night",
    year: "2024",
  },
  {
    id: "p-008",
    title: "Estate Access Control & Smart Security",
    category: "Access & Surveillance",
    industry: "residential",
    services: ["access-control-systems", "cctv-installation", "intercom-systems", "burglar-alarm-systems", "wifi-installation"],
    location: "Lekki Phase 1, Lagos",
    scope: "Gated residential estate",
    description:
      "A gated estate wanted controlled access for residents, staff and visitors, plus surveillance at entry points and common areas. We deployed access control and video intercoms at the gates, CCTV across common areas, and reliable estate-wide Wi-Fi for management and residents.",
    highlights: [
      "Gate access control with video intercoms",
      "Resident and visitor credential management",
      "CCTV coverage of entry and common areas",
      "Estate-wide Wi-Fi for management",
    ],
    imageQuery: "gated residential estate gate access control and cameras",
    year: "2023",
  },
  {
    id: "p-009",
    title: "Manufacturing Plant Fire Safety & Network",
    category: "Fire Safety & Network",
    industry: "industrial",
    services: ["fire-detection-safety", "fire-alarm-systems", "structured-cabling", "cctv-installation"],
    location: "Ikeja, Lagos",
    scope: "Manufacturing facility",
    description:
      "A manufacturing plant needed compliant fire safety and a reliable network across a large industrial facility. We engineered a comprehensive fire detection and safety system, structured cabling for the production floor, and surveillance of key operational areas.",
    highlights: [
      "Comprehensive fire detection and safety systems",
      "Structured cabling across the production floor",
      "Surveillance of operational and asset areas",
      "Compliance-ready documentation",
    ],
    imageQuery: "manufacturing plant fire safety and network infrastructure",
    year: "2024",
  },
];

export function projectsByIndustry(industryId: string): Project[] {
  return projects.filter((p) => p.industry === industryId);
}

export function projectsByCategory(category: string): Project[] {
  return projects.filter((p) => p.category === category);
}

export const projectCategories = Array.from(
  new Set(projects.map((p) => p.category)),
);
