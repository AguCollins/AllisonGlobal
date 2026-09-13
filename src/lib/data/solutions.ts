import {
  ShieldCheck,
  Building2,
  Network,
  Video,
  Flame,
  ServerCog,
  type LucideIcon,
} from "lucide-react";
import type { Solution } from "@/lib/types";

/**
 * Cross-cutting solutions — bundles of services that solve common client problems.
 * These create natural cross-sell paths between service categories.
 */
export const solutions: Solution[] = [
  {
    id: "unified-security",
    name: "Unified Security & Surveillance",
    icon: ShieldCheck,
    summary:
      "CCTV, access control, alarms and monitoring integrated into one security platform.",
    description:
      "Most security issues come from systems that don't talk to each other — a camera that doesn't trigger recording when a door is forced, an alarm that doesn't show you the scene. We integrate surveillance, access control, alarms and monitoring into one platform so your security works as a single, responsive system.",
    components: ["cctv-installation", "access-control-systems", "burglar-alarm-systems", "video-monitoring", "perimeter-intrusion"],
    outcomes: [
      "Incidents detected, recorded and alerted in one flow",
      "Single platform instead of disconnected systems",
      "Faster, better-coordinated response",
      "Clearer evidence and audit trails",
    ],
    bestFor: ["corporate", "warehouse", "industrial", "retail", "residential"],
  },
  {
    id: "resilient-network",
    name: "Resilient Network Infrastructure",
    icon: Network,
    summary:
      "Cabling, switching, routing and Wi-Fi engineered for performance, security and growth.",
    description:
      "Everything runs on your network — phones, CCTV, access control, IT, guest Wi-Fi. We engineer a resilient network foundation with structured cabling, managed switching, segmentation and wireless — so everything that depends on it works reliably.",
    components: ["structured-cabling", "lan-wan", "wifi-installation", "network-installation", "network-maintenance"],
    outcomes: [
      "Reliable connectivity for every system and user",
      "Clean segmentation of voice, data, surveillance and guests",
      "Future-proofed headroom for growth",
      "Documented, supportable infrastructure",
    ],
    bestFor: ["corporate", "education", "healthcare", "industrial", "hospitality"],
  },
  {
    id: "cyber-defence",
    name: "Cyber Defence Programme",
    icon: ShieldCheck,
    summary:
      "Layered cybersecurity — assessment, firewalls, endpoint protection and monitoring.",
    description:
      "Cyber threats target the network, the endpoints and the people. We build a layered cyber-defence programme — assessment, next-gen firewalls, endpoint protection, intrusion detection and ongoing monitoring — so your business is defended in depth, not at the edge alone.",
    components: ["security-assessment", "network-security", "firewall-endpoint-protection", "intrusion-detection", "managed-services"],
    outcomes: [
      "Defensible, documented security posture",
      "Blocked malware, ransomware and intrusion attempts",
      "Visibility and alerting on threats",
      "Stronger compliance position",
    ],
    bestFor: ["finance", "corporate", "government", "healthcare", "smb"],
  },
  {
    id: "life-safety",
    name: "Life Safety & Fire Protection",
    icon: Flame,
    summary:
      "Fire detection, alarm and safety systems engineered for compliance and rapid evacuation.",
    description:
      "Life-safety systems protect people first. We engineer comprehensive fire detection, alarm and safety solutions — detectors, call points, sounders, emergency lighting and integration — so your premises are protected and compliant.",
    components: ["fire-alarm-systems", "fire-detection-safety", "door-access-systems", "managed-services"],
    outcomes: [
      "Early, reliable fire detection",
      "Compliant, insurable life-safety systems",
      "Safe, coordinated evacuation",
      "Documented for inspection",
    ],
    bestFor: ["hospitality", "healthcare", "education", "industrial", "warehouse"],
  },
  {
    id: "smart-building",
    name: "Smart Building Integration",
    icon: Building2,
    summary:
      "Security, automation, lighting and energy unified into one manageable platform.",
    description:
      "Modern buildings shouldn't run on a dozen disconnected systems. We integrate security, access, surveillance, lighting, climate and energy into one smart-building platform — simpler to operate, more efficient, and more secure.",
    components: ["smart-building-solutions", "access-control-systems", "intercom-systems", "cctv-installation", "wifi-installation"],
    outcomes: [
      "One interface for building operations",
      "Lower energy costs through automation",
      "Better security and comfort",
      "Scalable architecture",
    ],
    bestFor: ["corporate", "hospitality", "residential", "government", "healthcare"],
  },
  {
    id: "managed-it",
    name: "Managed IT & Security",
    icon: ServerCog,
    summary:
      "Your IT and security under continuous care — monitoring, maintenance and support.",
    description:
      "The best systems keep working because someone is looking after them. We manage your IT and security under one agreement — proactive monitoring, preventive maintenance, priority support and ongoing improvement — for predictable costs and fewer surprises.",
    components: ["managed-services", "computer-it-support", "network-maintenance", "network-security", "systems-installation-maintenance"],
    outcomes: [
      "Predictable costs, fewer surprises",
      "Healthier systems that fail less",
      "Prioritised, faster response",
      "A strategic partner, not just a vendor",
    ],
    bestFor: ["corporate", "smb", "finance", "healthcare", "education"],
  },
];

export const solutionMap: Record<string, Solution> = Object.fromEntries(
  solutions.map((s) => [s.id, s]),
);
