import {
  ClipboardList,
  PencilRuler,
  Package,
  Wrench,
  Plug,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { ProcessStep } from "@/lib/types";

export const processSteps: ProcessStep[] = [
  {
    step: 1,
    id: "consultation",
    title: "Consultation & Site Assessment",
    summary:
      "We listen to your needs, walk your site and assess the real risks before recommending anything.",
    description:
      "Every engagement starts with understanding — your environment, your risks, your operations and your goals. A senior engineer visits your site, assesses the physical and technical landscape, and documents what you actually need. No generic packages, no upselling.",
    icon: ClipboardList,
    activities: [
      "Requirements and goals discussion",
      "Physical site walk-through and survey",
      "Risk and coverage assessment",
      "Existing infrastructure review",
      "Budget and timeline alignment",
    ],
    deliverable: "Site assessment report with recommended scope and priorities",
  },
  {
    step: 2,
    id: "design",
    title: "System Design & Engineering",
    summary:
      "We engineer a documented solution — equipment, layout, integration and configuration — before anything is installed.",
    description:
      "We translate the assessment into a proper design. Equipment selection, camera and sensor placement, network architecture, integration between systems, and a clear bill of materials — documented so you know exactly what you're getting and why.",
    icon: PencilRuler,
    activities: [
      "System architecture and topology",
      "Equipment selection and justification",
      "Placement and coverage design",
      "Integration and segmentation plan",
      "Bill of materials and proposal",
    ],
    deliverable: "Engineered design document with bill of materials and proposal",
  },
  {
    step: 3,
    id: "supply",
    title: "Supply & Procurement",
    summary:
      "We source genuine, warrantied equipment from the brands we deploy — not grey-market alternatives.",
    description:
      "We procure the specified equipment through proper channels — genuine products with manufacturer warranty. We don't substitute cheaper alternatives silently, and we handle logistics so you don't chase vendors.",
    icon: Package,
    activities: [
      "Genuine equipment procurement",
      "Warranty and serial documentation",
      "Logistics and delivery coordination",
      "Quality check on receipt",
      "Inventory against the design",
    ],
    deliverable: "Equipment delivered, verified and ready for installation",
  },
  {
    step: 4,
    id: "installation",
    title: "Professional Installation",
    summary:
      "Certified, clean installation by field engineers who treat your site with respect.",
    description:
      "Our installation team deploys the system to standard — cabling, mounting, wiring and configuration done properly. We work to minimise disruption, keep the site tidy, and install for reliability, not just appearance.",
    icon: Wrench,
    activities: [
      "Cabling, mounting and wiring",
      "Equipment installation and configuration",
      "Clean, labelled, documented work",
      "Minimal-disruption scheduling",
      "Quality control during install",
    ],
    deliverable: "Installed, configured system ready for commissioning",
  },
  {
    step: 5,
    id: "commissioning",
    title: "Integration & Commissioning",
    summary:
      "We test every component and integration end-to-end so the system works as one — not just individually.",
    description:
      "Installation is not completion. We commission the system — testing each component, each integration and each scenario. Cameras focused, access rules verified, alarms triggered, networks load-tested. You sign off on a working system, not a promise.",
    icon: Plug,
    activities: [
      "End-to-end component testing",
      "Integration and scenario testing",
      "Performance and coverage validation",
      "Security hardening review",
      "Client acceptance walkthrough",
    ],
    deliverable: "Commissioned, tested system with acceptance sign-off",
  },
  {
    step: 6,
    id: "handover",
    title: "Training, Handover & Ongoing Support",
    summary:
      "We hand over documentation, train your team, and stay for the long term with maintenance and support.",
    description:
      "We hand over a fully documented system — as-built drawings, credentials, manuals and a maintenance schedule — and train your team to use it. Then we stay, with preventive maintenance, monitoring and priority support that keep your systems working for years.",
    icon: GraduationCap,
    activities: [
      "As-built documentation handover",
      "Credentials and access transfer",
      "Team training and runbook",
      "Maintenance schedule setup",
      "Ongoing support and improvement",
    ],
    deliverable: "Documented, supported system with a long-term partnership",
  },
];
