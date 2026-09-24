import {
  Home,
  Building2,
  GraduationCap,
  Stethoscope,
  Hotel,
  ShoppingBag,
  Warehouse,
  Factory,
  HardHat,
  Landmark,
  Church,
  PiggyBank,
  Store,
} from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- type-only import kept for clarity; LucideIcon is the canonical icon type used across the codebase
import type { LucideIcon } from "lucide-react";
import type { Industry } from "@/lib/types";

export const industries: Industry[] = [
  {
    id: "residential",
    name: "Residential & Estates",
    icon: Home,
    tagline: "Secure homes and residential estates",
    summary:
      "Smart, reliable security for homes and estates — CCTV, access control, alarms and networking that protect families without becoming complicated.",
    challenges: [
      "Perimeter and entry-point security for homes and estates",
      "Reliable Wi-Fi coverage across the property",
      "Fire and intrusion detection that alerts the family",
      "Access control for gates, domestic staff and visitors",
    ],
    solutions: ["cctv-installation", "access-control-systems", "burglar-alarm-systems", "intercom-systems", "wifi-installation", "fire-alarm-systems"],
    outcomes: [
      "Visible deterrent and evidence if incidents occur",
      "Controlled access for family, staff and visitors",
      "Reliable connectivity throughout the home",
      "Early warning for intrusion and fire",
    ],
    imageQuery: "modern smart home security camera and gate at dusk",
  },
  {
    id: "corporate",
    name: "Corporate Offices",
    icon: Building2,
    tagline: "Secure, connected, productive workplaces",
    summary:
      "Enterprise networking, cybersecurity, access control and surveillance engineered for productive, secure corporate environments.",
    challenges: [
      "Secure, segmented networks for staff, guests and devices",
      "Access control with audit trails across floors",
      "Cybersecurity defending company data and systems",
      "Surveillance and monitoring across the premises",
    ],
    solutions: ["lan-wan", "network-security", "access-control-systems", "cctv-installation", "firewall-endpoint-protection", "managed-services"],
    outcomes: [
      "Resilient, segmented corporate network",
      "Controlled, audited access across the building",
      "Defended data and endpoints",
      "Monitored premises with reliable footage",
    ],
    imageQuery: "modern corporate office building with security and networking",
  },
  {
    id: "education",
    name: "Schools & Universities",
    icon: GraduationCap,
    tagline: "Safe, connected campuses for learning",
    summary:
      "Campus-wide networking, surveillance, access control and cybersecurity that keep students, staff and data protected.",
    challenges: [
      "Campus-wide Wi-Fi and network coverage",
      "Surveillance across large, busy campuses",
      "Access control for labs, dorms and offices",
      "Cybersecurity protecting student and staff data",
    ],
    solutions: ["wifi-installation", "lan-wan", "cctv-installation", "access-control-systems", "network-security", "fire-alarm-systems"],
    outcomes: [
      "Reliable connectivity for students and staff",
      "Safer, monitored campus environments",
      "Controlled access to sensitive areas",
      "Protected institutional data",
    ],
    imageQuery: "university campus with security cameras and networking",
  },
  {
    id: "healthcare",
    name: "Hospitals & Healthcare",
    icon: Stethoscope,
    tagline: "Life-safety and data protection for healthcare",
    summary:
      "Fire safety, access control, surveillance and resilient IT for facilities where lives and sensitive data depend on reliability.",
    challenges: [
      "Fire detection and life-safety compliance",
      "Access control for pharmacies, records and restricted areas",
      "Surveillance for patient and staff safety",
      "Resilient IT and data protection",
    ],
    solutions: ["fire-alarm-systems", "access-control-systems", "cctv-installation", "server-data-centre", "network-security", "managed-services"],
    outcomes: [
      "Compliant, reliable life-safety systems",
      "Controlled access to sensitive areas",
      "Monitored premises for patient safety",
      "Resilient, protected patient data",
    ],
    imageQuery: "modern hospital corridor with safety and security systems",
  },
  {
    id: "hospitality",
    name: "Hotels & Hospitality",
    icon: Hotel,
    tagline: "Guest experience built on security",
    summary:
      "Surveillance, access control, fire safety and seamless Wi-Fi that protect guests and staff while elevating the guest experience.",
    challenges: [
      "Guest Wi-Fi that's fast and isolated from operations",
      "Access control for rooms, floors and back-of-house",
      "Surveillance of public and service areas",
      "Fire safety across guest floors and kitchens",
    ],
    solutions: ["wifi-installation", "access-control-systems", "cctv-installation", "fire-alarm-systems", "intercom-systems", "network-security"],
    outcomes: [
      "Seamless, secure guest connectivity",
      "Controlled access across the property",
      "Safer guests and staff",
      "Compliant fire and life safety",
    ],
    imageQuery: "modern hotel lobby with discreet security and access systems",
  },
  {
    id: "retail",
    name: "Retail Stores",
    icon: ShoppingBag,
    tagline: "Loss prevention and connected retail",
    summary:
      "CCTV, alarms, access control and networking that reduce shrinkage, protect staff and keep retail operations running.",
    challenges: [
      "Shrinkage and theft at point of sale and stockrooms",
      "Alarm and intrusion detection out of hours",
      "Multi-site surveillance and viewing",
      "Reliable POS and inventory network",
    ],
    solutions: ["cctv-installation", "burglar-alarm-systems", "access-control-systems", "lan-wan", "video-monitoring", "perimeter-intrusion"],
    outcomes: [
      "Reduced shrinkage and clearer evidence",
      "Early intrusion detection and alerts",
      "Multi-site oversight from one platform",
      "Reliable retail network",
    ],
    imageQuery: "retail store interior with discreet security cameras",
  },
  {
    id: "warehouse",
    name: "Warehouses & Logistics",
    icon: Warehouse,
    tagline: "Protect inventory and operations",
    summary:
      "Perimeter and surveillance systems, access control and resilient networking for warehouses and logistics facilities.",
    challenges: [
      "Large perimeters that are hard to monitor",
      "Inventory theft and stock movement tracking",
      "Access control for staff and vehicles",
      "Resilient network across large facilities",
    ],
    solutions: ["perimeter-intrusion", "cctv-installation", "access-control-systems", "structured-cabling", "burglar-alarm-systems", "fire-alarm-systems"],
    outcomes: [
      "Early perimeter detection",
      "Clear surveillance of inventory areas",
      "Controlled access for people and vehicles",
      "Resilient operations network",
    ],
    imageQuery: "large warehouse logistics facility with perimeter security cameras",
  },
  {
    id: "industrial",
    name: "Manufacturing & Industrial",
    icon: Factory,
    tagline: "Secure and resilient industrial operations",
    summary:
      "Rugged networking, perimeter security, surveillance and fire safety engineered for demanding industrial environments.",
    challenges: [
      "Harsh environments that defeat standard equipment",
      "Large perimeters and high-value assets",
      "Fire and safety compliance for industrial sites",
      "Networks spanning large industrial facilities",
    ],
    solutions: ["perimeter-intrusion", "cctv-installation", "fire-detection-safety", "structured-cabling", "access-control-systems", "network-installation"],
    outcomes: [
      "Rugged, reliable security infrastructure",
      "Protected perimeters and assets",
      "Compliant fire and life safety",
      "Resilient industrial networks",
    ],
    imageQuery: "industrial manufacturing plant with perimeter security systems",
  },
  {
    id: "construction",
    name: "Construction Sites",
    icon: HardHat,
    tagline: "Temporary security that works",
    summary:
      "Mobile surveillance, perimeter detection and alarms that secure construction sites and equipment during the build.",
    challenges: [
      "Theft of materials and equipment on site",
      "Temporary perimeters that change as work progresses",
      "No fixed infrastructure for power or network",
      "Need for remote monitoring of live sites",
    ],
    solutions: ["cctv-installation", "video-monitoring", "perimeter-intrusion", "burglar-alarm-systems", "wifi-installation"],
    outcomes: [
      "Deterrent and evidence against theft",
      "Flexible security that adapts to the site",
      "Remote monitoring without fixed infrastructure",
      "Lower losses during construction",
    ],
    imageQuery: "construction site with mobile security cameras and barriers at night",
  },
  {
    id: "government",
    name: "Government & Public Sector",
    icon: Landmark,
    tagline: "Secure and compliant public infrastructure",
    summary:
      "Security and IT infrastructure engineered for government and public institutions, with compliance and reliability at the core.",
    challenges: [
      "Strict compliance and audit requirements",
      "Protection of sensitive public data",
      "Controlled access to government facilities",
      "Resilient, reliable public infrastructure",
    ],
    solutions: ["network-security", "access-control-systems", "cctv-installation", "security-assessment", "server-data-centre", "fire-alarm-systems"],
    outcomes: [
      "Compliant, auditable security posture",
      "Protected sensitive data",
      "Controlled, monitored access",
      "Resilient public-sector infrastructure",
    ],
    imageQuery: "government building with security and access control systems",
  },
  {
    id: "religious",
    name: "Religious Organizations",
    icon: Church,
    tagline: "Safe, welcoming places of worship",
    summary:
      "Surveillance, access control, fire safety and AV networking that protect congregations and places of worship.",
    challenges: [
      "Surveillance of large gathering spaces",
      "Access control for offices and valuable areas",
      "Fire safety for crowded gatherings",
      "AV and network for services and streaming",
    ],
    solutions: ["cctv-installation", "access-control-systems", "fire-alarm-systems", "wifi-installation", "intercom-systems", "burglar-alarm-systems"],
    outcomes: [
      "Safer gatherings and premises",
      "Controlled access to sensitive areas",
      "Compliant fire safety",
      "Connected services and outreach",
    ],
    imageQuery: "large place of worship interior with discreet security systems",
  },
  {
    id: "finance",
    name: "Financial Institutions",
    icon: PiggyBank,
    tagline: "Security and compliance for finance",
    summary:
      "Cybersecurity, surveillance, access control and resilient IT for banks and financial institutions where trust and compliance are everything.",
    challenges: [
      "Stringent regulatory and compliance demands",
      "Protection of financial data and systems",
      "Surveillance and access control for branches and vaults",
      "Resilient, always-on IT infrastructure",
    ],
    solutions: ["network-security", "firewall-endpoint-protection", "cctv-installation", "access-control-systems", "server-data-centre", "security-assessment"],
    outcomes: [
      "Defensible, compliant security posture",
      "Protected financial data",
      "Controlled, surveilled facilities",
      "Resilient, recoverable infrastructure",
    ],
    imageQuery: "modern bank interior with security cameras and access control",
  },
  {
    id: "smb",
    name: "Small & Medium Businesses",
    icon: Store,
    tagline: "Enterprise-grade security, right-sized",
    summary:
      "Right-sized networking, security and IT support that give SMBs enterprise-grade protection without enterprise-grade complexity.",
    challenges: [
      "Limited in-house IT and security expertise",
      "Need for protection without big budgets",
      "Reliable IT support without a full team",
      "Scalable systems that grow with the business",
    ],
    solutions: ["managed-services", "computer-it-support", "network-installation", "cctv-installation", "firewall-endpoint-protection", "wifi-installation"],
    outcomes: [
      "Professional IT and security without an in-house team",
      "Predictable, manageable costs",
      "Reliable day-to-day operations",
      "Systems that scale with growth",
    ],
    imageQuery: "small business office with networking and security systems",
  },
];

export const industryMap: Record<string, Industry> = Object.fromEntries(
  industries.map((i) => [i.id, i]),
);

export function getIndustryById(id: string): Industry | undefined {
  return industryMap[id];
}
