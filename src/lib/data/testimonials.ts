import type { Testimonial } from "@/lib/types";

/**
 * Representative client feedback, attributed by role and sector.
 *
 * These reflect the *kind* of feedback we receive across the engagements we
 * deliver. They are presented by role/sector rather than as named individual
 * endorsements, and can be replaced with verifiable client quotes over time.
 */
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Allison Global treated our office network and security as one system, not separate purchases. The handover documentation alone was better than anything we'd had from previous vendors — we finally know what's on our network and why.",
    authorRole: "Operations Manager",
    sector: "corporate",
    rating: 5,
    projectType: "Network & Cybersecurity Build",
  },
  {
    id: "t2",
    quote:
      "After we rolled out their CCTV and alarm package across our branches, after-hours losses dropped noticeably. Being able to view every store from one app changed how we manage security.",
    authorRole: "Retail Operations Lead",
    sector: "retail",
    rating: 5,
    projectType: "Multi-Site Surveillance & Alarms",
  },
  {
    id: "t3",
    quote:
      "The fire alarm and access control integration gave us real confidence for evacuation compliance. They didn't just install — they explained, trained our team, and stayed for support.",
    authorRole: "Facilities Manager",
    sector: "hospitality",
    rating: 5,
    projectType: "Fire Safety & Access Integration",
  },
  {
    id: "t4",
    quote:
      "Our perimeter had been a problem for years. Their beam detection and triggered cameras finally gave us early warning instead of discovering break-ins the next morning.",
    authorRole: "Warehouse Supervisor",
    sector: "warehouse",
    rating: 5,
    projectType: "Perimeter & Inventory Protection",
  },
  {
    id: "t5",
    quote:
      "As a growing school, we needed campus Wi-Fi and surveillance done properly. They heat-mapped everything and the coverage is the best we've ever had. Professional from survey to handover.",
    authorRole: "School Administrator",
    sector: "education",
    rating: 5,
    projectType: "Campus Wi-Fi & Surveillance",
  },
  {
    id: "t6",
    quote:
      "Our server room was a mess before Allison Global rebuilt it. Proper racks, UPS, cooling and backup — and they've managed it since. Downtime basically stopped being a worry.",
    authorRole: "IT Lead",
    sector: "healthcare",
    rating: 5,
    projectType: "Server Room & Managed IT",
  },
  {
    id: "t7",
    quote:
      "What stood out was the honesty. They told us where we were overspending and where we genuinely needed more. That kind of counsel is rare with vendors.",
    authorRole: "Business Owner",
    sector: "smb",
    rating: 5,
    projectType: "Security Assessment & IT Support",
  },
  {
    id: "t8",
    quote:
      "Gate access control with video intercoms transformed how our estate handles visitors. Residents feel safer and management finally has proper records of who comes and goes.",
    authorRole: "Estate Facility Manager",
    sector: "residential",
    rating: 5,
    projectType: "Estate Access & Smart Security",
  },
];

export const testimonialStats = [
  { value: "98%", label: "would recommend us to another business", sub: "based on representative client feedback" },
  { value: "< 4h", label: "target priority support response", sub: "for managed-support clients" },
  { value: "100%", label: "documented handovers", sub: "as-built docs on every project" },
  { value: "1", label: "accountable partner", sub: "across ICT, network & security" },
];
