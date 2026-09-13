import {
  Network,
  Wifi,
  Cable,
  Router,
  ShieldCheck,
  Lock,
  ScanEye,
  ShieldAlert,
  Camera,
  Video,
  MonitorPlay,
  HardDrive,
  Fingerprint,
  DoorOpen,
  PhoneCall,
  KeyRound,
  Flame,
  Bell,
  Siren,
  ServerCog,
  MonitorCog,
  Cog,
  Building2,
  LifeBuoy,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import type { ServiceCategory, Service } from "@/lib/types";

export const serviceCategories: ServiceCategory[] = [
  {
    id: "network",
    slug: "network-connectivity",
    name: "Network & Connectivity",
    tagline: "The backbone everything else runs on",
    description:
      "Structured cabling, switching, routing and wireless engineered for performance, reliability and future growth — the foundation beneath every CCTV, access and IT system we deploy.",
    icon: Network,
    accent: "from-emerald-500/20 to-teal-500/10",
    services: [
      "structured-cabling",
      "lan-wan",
      "wifi-installation",
      "network-installation",
      "network-maintenance",
    ],
  },
  {
    id: "cybersecurity",
    slug: "cybersecurity",
    name: "Cybersecurity",
    tagline: "Protect your data, network and endpoints",
    description:
      "Defend your business against intrusion, malware, ransomware and data loss with layered security — firewalls, endpoint protection, monitoring and proactive assessment.",
    icon: ShieldCheck,
    accent: "from-teal-500/20 to-emerald-500/10",
    services: [
      "network-security",
      "firewall-endpoint-protection",
      "intrusion-detection",
      "security-assessment",
    ],
  },
  {
    id: "surveillance",
    slug: "surveillance-monitoring",
    name: "Surveillance & Monitoring",
    tagline: "See everything that matters",
    description:
      "CCTV and IP video systems designed for coverage, clarity and reliable playback — from single-site cameras to multi-location deployments with remote monitoring.",
    icon: Camera,
    accent: "from-amber-500/20 to-emerald-500/10",
    services: [
      "cctv-installation",
      "ip-camera-systems",
      "video-monitoring",
      "nvr-dvr-solutions",
    ],
  },
  {
    id: "access",
    slug: "access-control",
    name: "Access Control & Automation",
    tagline: "Control who enters, when and where",
    description:
      "Card, biometric and intercom systems that secure doors, gates and sensitive areas — with audit trails and integration into your wider security setup.",
    icon: Fingerprint,
    accent: "from-emerald-500/20 to-amber-500/10",
    services: [
      "access-control-systems",
      "biometric-systems",
      "door-access-systems",
      "intercom-systems",
    ],
  },
  {
    id: "alarm-fire",
    slug: "alarm-fire-safety",
    name: "Alarm & Fire Safety",
    tagline: "Early warning that saves lives and assets",
    description:
      "Intrusion alarms, fire detection and life-safety systems engineered to standards — so threats are detected early and escalated to the right people fast.",
    icon: Flame,
    accent: "from-orange-500/20 to-amber-500/10",
    services: [
      "burglar-alarm-systems",
      "fire-alarm-systems",
      "fire-detection-safety",
      "perimeter-intrusion",
    ],
  },
  {
    id: "infrastructure",
    slug: "it-infrastructure",
    name: "IT Infrastructure & Support",
    tagline: "Resilient systems, always-on support",
    description:
      "Servers, data-centre fit-out, computer support and managed services that keep your operations running — designed, deployed and maintained by one team.",
    icon: ServerCog,
    accent: "from-teal-500/20 to-slate-500/10",
    services: [
      "server-data-centre",
      "computer-it-support",
      "systems-installation-maintenance",
      "smart-building-solutions",
      "managed-services",
    ],
  },
];

export const services: Service[] = [
  // ───────────────────────── NETWORK & CONNECTIVITY ─────────────────────────
  {
    slug: "structured-cabling",
    name: "Structured Cabling",
    categoryId: "network",
    icon: Cable,
    tagline: "A cabling foundation engineered to carry your business for decades",
    shortDescription:
      "Standards-compliant copper, fibre and rack cabling with proper labelling, testing and certification.",
    overview:
      "Structured cabling is the unseen backbone of every reliable network, surveillance and access system. We design and install Cat6/Cat6A copper and fibre-optic cabling to TIA/EIA standards, with patch panels, labelled terminations, certification testing and as-built documentation — so your infrastructure is fast, tidy and future-proof.",
    problem: [
      "Slow, intermittent connections caused by poorly terminated or tangled cabling.",
      "No documentation, so every change becomes a guessing game.",
      "Cabling that fails under high bandwidth or distance demands.",
      "Messy racks that make troubleshooting and expansion painful.",
    ],
    solution:
      "We engineer a structured cabling system around your building, bandwidth and growth plans — properly planned routes, quality cable, certified terminations and a documented rack you can actually manage.",
    deliverables: [
      { title: "Site survey & cable design", description: "Cable routes, outlet counts, rack locations and material take-off tailored to your building." },
      { title: "Copper & fibre installation", description: "Cat6/Cat6A and OS2/OM4 fibre pulled, terminated and dressed to standard." },
      { title: "Patch panels & racks", description: "Wall and floor racks, patch panels, cable managers and tidy, labelled patching." },
      { title: "Certification testing", description: "Fluke-class testers validate every link — you get pass results, not promises." },
      { title: "As-built documentation", description: "Outlet schedules, rack diagrams and cable labels that make future changes easy." },
    ],
    benefits: [
      "Reliable gigabit and multi-gig performance to every outlet",
      "Clean, documented infrastructure that scales with you",
      "Fewer outages and faster fault-finding",
      "Future-proofed headroom for CCTV, Wi-Fi and IT growth",
    ],
    tech: ["Cat6/Cat6A", "Single-mode & multimode fibre", "LSZH cabling", "Cable certification testers", "Racks & cable management"],
    relatedServices: ["lan-wan", "network-installation", "wifi-installation", "cctv-installation", "access-control-systems"],
    relatedIndustries: ["corporate", "education", "healthcare", "industrial", "warehouse"],
    featured: true,
  },
  {
    slug: "lan-wan",
    name: "LAN / WAN Solutions",
    categoryId: "network",
    icon: Router,
    tagline: "Switching, routing and segmentation done right",
    shortDescription:
      "Layer 2/3 switching, VLANs, routing and inter-site connectivity designed for performance and segmentation.",
    overview:
      "A flat network is a slow, insecure network. We design and deploy LAN and WAN infrastructure with managed switching, VLAN segmentation, routing and inter-site links — so voice, data, surveillance and guest traffic are separated, prioritised and resilient.",
    problem: [
      "Congested, flat networks where CCTV traffic competes with business data.",
      "Intermittent dropouts from consumer-grade switches and routers.",
      "No segmentation between guest, staff and device networks.",
      "Multi-site connectivity that's slow, insecure or both.",
    ],
    solution:
      "We architect your LAN/WAN with enterprise switching, VLAN design, routing and secure inter-site links — tuned for performance, segmentation and resilience.",
    deliverables: [
      { title: "Network architecture", description: "Topology, VLAN plan, IP scheme and segmentation strategy." },
      { title: "Managed switching", description: "Layer 2/3 switches configured with VLANs, QoS and link aggregation." },
      { title: "Routing & WAN", description: "Router configuration, inter-site VPN and WAN aggregation where needed." },
      { title: "Segmentation", description: "Separate networks for data, voice, surveillance, guests and IoT." },
      { title: "Documentation & handover", description: "Configuration backup, IP plan and operational runbook." },
    ],
    benefits: [
      "Clean separation of traffic for security and performance",
      "Reliable connectivity that scales with users and devices",
      "Better application performance with proper QoS",
      "Secure multi-site connectivity",
    ],
    tech: ["Managed L2/L3 switches", "VLANs & 802.1Q", "Site-to-site VPN", "QoS", "Link aggregation"],
    relatedServices: ["network-installation", "structured-cabling", "network-security", "firewall-endpoint-protection", "wifi-installation"],
    relatedIndustries: ["corporate", "education", "healthcare", "finance", "industrial"],
  },
  {
    slug: "wifi-installation",
    name: "Wi-Fi Installation & Optimization",
    categoryId: "network",
    icon: Wifi,
    tagline: "Coverage you can actually rely on, in every corner",
    shortDescription:
      "Heat-mapped wireless deployments and optimisation for offices, hotels, campuses and large homes.",
    overview:
      "Dead zones and dropped Wi-Fi cost productivity and frustrate users. We design wireless networks using proper site surveys and heat maps, deploy enterprise access points with seamless roaming, and tune them for capacity, coverage and speed — whether it's a 4-room office or a multi-building campus.",
    problem: [
      "Dead spots and weak signal in key areas.",
      "Wi-Fi that slows to a crawl when many users connect.",
      "Guest Wi-Fi sharing the same network as staff.",
      "Roaming that drops calls and sessions between access points.",
    ],
    solution:
      "We survey your environment, design access-point placement for true coverage, and configure enterprise Wi-Fi with seamless roaming, band steering and guest isolation.",
    deliverables: [
      { title: "Wireless site survey", description: "Heat-mapped coverage planning based on your walls, floors and layout." },
      { title: "Access point deployment", description: "Enterprise APs placed and mounted for optimal coverage and capacity." },
      { title: "SSID & security design", description: "Separate networks for staff, guests and devices with WPA2/3 security." },
      { title: "Roaming & optimisation", description: "Seamless 802.11r/k/v roaming, band steering and channel tuning." },
      { title: "Performance validation", description: "Post-installation testing confirming coverage and throughput." },
    ],
    benefits: [
      "Reliable coverage everywhere it matters",
      "Higher capacity for many simultaneous users",
      "Secure guest access isolated from business data",
      "Seamless roaming without dropped connections",
    ],
    tech: ["Wi-Fi 6 / 6E access points", "Controller & cloud-managed Wi-Fi", "Mesh & roaming protocols", "WPA3", "Heat-map survey tools"],
    relatedServices: ["network-installation", "lan-wan", "network-security", "structured-cabling", "smart-building-solutions"],
    relatedIndustries: ["hospitality", "education", "corporate", "residential", "retail"],
    featured: true,
  },
  {
    slug: "network-installation",
    name: "Network Installation & Infrastructure",
    categoryId: "network",
    icon: Network,
    tagline: "End-to-end network build, from rack to endpoint",
    shortDescription:
      "Turnkey network installation — design, supply, configuration, commissioning and handover.",
    overview:
      "A great network design means nothing without clean execution. We handle the full installation — supply of enterprise equipment, rack build, configuration, commissioning and handover — so your network goes live stable, documented and supported.",
    problem: [
      "Equipment bought but never properly configured.",
      "Installations with no testing, no documentation and no support.",
      "Vendors who disappear after deployment.",
      "Networks that work on day one and degrade from day two.",
    ],
    solution:
      "We install your network end-to-end — supply, configure, test, commission and document — then back it with support.",
    deliverables: [
      { title: "Equipment supply", description: "Genuine enterprise equipment sourced and supplied with warranty." },
      { title: "Rack build & cabling", description: "Clean rack assembly with proper cable management." },
      { title: "Configuration", description: "Switches, routers, APs and security configured to design." },
      { title: "Commissioning & testing", description: "End-to-end validation before we hand over." },
      { title: "Handover & documentation", description: "As-built docs, credentials and operational runbook." },
    ],
    benefits: [
      "One accountable partner for the whole build",
      "Stable, tested network from day one",
      "Documented and supportable long-term",
      "Genuine, warrantied equipment",
    ],
    tech: ["Enterprise switches & routers", "Racks & UPS", "Network configuration management", "Documentation tooling"],
    relatedServices: ["structured-cabling", "lan-wan", "wifi-installation", "network-security", "network-maintenance"],
    relatedIndustries: ["corporate", "education", "healthcare", "industrial", "warehouse"],
  },
  {
    slug: "network-maintenance",
    name: "Network Maintenance & Support",
    categoryId: "network",
    icon: LifeBuoy,
    tagline: "Keep the backbone healthy, not just installed",
    shortDescription:
      "Preventive maintenance, monitoring and rapid-response support for your network infrastructure.",
    overview:
      "Networks degrade silently — firmware drift, failing links, capacity creep. Our maintenance and support keeps your network healthy with scheduled health checks, monitoring, firmware management and priority response when something breaks.",
    problem: [
      "Slow deterioration nobody notices until something fails.",
      "Outdated firmware with known vulnerabilities.",
      "No monitoring, so outages are discovered by users first.",
      "Slow vendor response when the network goes down.",
    ],
    solution:
      "We keep your network under maintenance — proactive monitoring, scheduled servicing, firmware updates and priority response.",
    deliverables: [
      { title: "Health checks", description: "Scheduled audits of switching, routing and wireless performance." },
      { title: "Monitoring", description: "Proactive monitoring that flags issues before users do." },
      { title: "Firmware management", description: "Planned updates and security patching." },
      { title: "Priority response", description: "Defined SLA response times for support clients." },
      { title: "Change management", description: "Configuration backups and controlled change." },
    ],
    benefits: [
      "Fewer surprise outages",
      "Security patches applied on schedule",
      "Faster resolution when issues occur",
      "Predictable support costs",
    ],
    tech: ["Network monitoring (SNMP)", "Configuration backup", "Firmware management", "Remote support"],
    relatedServices: ["network-installation", "managed-services", "network-security", "computer-it-support"],
    relatedIndustries: ["corporate", "education", "healthcare", "finance", "industrial"],
  },

  // ───────────────────────── CYBERSECURITY ─────────────────────────
  {
    slug: "network-security",
    name: "Network Security",
    categoryId: "cybersecurity",
    icon: ShieldCheck,
    tagline: "Defend the perimeter and everything inside it",
    shortDescription:
      "Layered network security — firewalls, segmentation, secure access and policy — engineered to your risk profile.",
    overview:
      "Network security is no longer a single firewall at the edge. We design layered defences — perimeter firewalls, internal segmentation, secure remote access, policy and monitoring — so threats are blocked, contained and visible.",
    problem: [
      "A single firewall protecting a flat, exposed network.",
      "No visibility into what's entering or leaving the network.",
      "Insecure remote access opening doors to attackers.",
      "Guest and IoT devices sharing privileged network space.",
    ],
    solution:
      "We engineer layered network security around your actual risk — perimeter defence, segmentation, secure access and monitoring.",
    deliverables: [
      { title: "Security architecture", description: "Defence-in-depth design tailored to your risk and compliance needs." },
      { title: "Firewall & segmentation", description: "Next-gen firewalling and network segmentation policies." },
      { title: "Secure remote access", description: "VPN and zero-trust access for staff and partners." },
      { title: "Policy & controls", description: "Access policies, URL filtering and application control." },
      { title: "Monitoring & alerts", description: "Logging and alerting on suspicious activity." },
    ],
    benefits: [
      "Reduced attack surface and lateral movement",
      "Visibility into network threats",
      "Secure remote and partner access",
      "Stronger posture for compliance",
    ],
    tech: ["Next-gen firewalls", "Network segmentation", "VPN / zero-trust access", "URL & app filtering", "SIEM logging"],
    relatedServices: ["firewall-endpoint-protection", "intrusion-detection", "security-assessment", "lan-wan", "managed-services"],
    relatedIndustries: ["finance", "corporate", "government", "healthcare", "education"],
    featured: true,
  },
  {
    slug: "firewall-endpoint-protection",
    name: "Firewall & Endpoint Protection",
    categoryId: "cybersecurity",
    icon: Lock,
    tagline: "Guard the gate and every device behind it",
    shortDescription:
      "Next-gen firewalls and endpoint protection (EDR/AV) to block malware, ransomware and breaches.",
    overview:
      "The firewall guards the gate; endpoint protection guards every laptop, server and workstation behind it. We deploy and manage both — next-gen firewalls with threat prevention, plus modern endpoint detection and response — so malware, ransomware and intrusions are blocked at the edge and on the device.",
    problem: [
      "Consumer antivirus that misses modern threats.",
      "A firewall with no threat prevention or filtering.",
      "Ransomware reaching endpoints unchecked.",
      "Unmanaged devices spreading infection across the network.",
    ],
    solution:
      "We deploy next-gen firewalls with threat prevention and modern endpoint protection across your devices — centrally managed and monitored.",
    deliverables: [
      { title: "Next-gen firewalling", description: "Firewall with IDS/IPS, anti-malware, web filtering and application control." },
      { title: "Endpoint protection", description: "EDR/antivirus deployed across workstations and servers." },
      { title: "Central management", description: "Single console for policy, alerts and remediation." },
      { title: "Ransomware defence", description: "Behavioural detection and rollback where supported." },
      { title: "Ongoing management", description: "Policy tuning, alerts and reporting under support plans." },
    ],
    benefits: [
      "Blocked malware, ransomware and phishing threats",
      "Visibility and control across all endpoints",
      "Faster detection and response",
      "Reduced downtime and data-loss risk",
    ],
    tech: ["Fortinet / SonicWall", "Bitdefender EDR", "Central management consoles", "Threat intelligence"],
    relatedServices: ["network-security", "intrusion-detection", "security-assessment", "server-data-centre", "managed-services"],
    relatedIndustries: ["finance", "corporate", "healthcare", "government", "smb"],
  },
  {
    slug: "intrusion-detection",
    name: "Intrusion Detection & Prevention",
    categoryId: "cybersecurity",
    icon: ScanEye,
    tagline: "Spot the threats that get past the front door",
    shortDescription:
      "IDS/IPS and monitoring that detects and blocks intrusion attempts on your network.",
    overview:
      "Even strong firewalls can be bypassed. Intrusion detection and prevention systems watch network traffic for attack patterns and suspicious behaviour — alerting and blocking before threats spread. We deploy and tune IDS/IPS so you're not just defended, you're aware.",
    problem: [
      "Breaches that go unnoticed for weeks or months.",
      "Firewalls that block known bad traffic but miss novel attacks.",
      "No alerting when attackers probe the network.",
      "Compliance requirements for continuous monitoring.",
    ],
    solution:
      "We deploy IDS/IPS with tuned signatures and behaviour monitoring, integrated with your firewall and logging — so threats are detected, blocked and reported.",
    deliverables: [
      { title: "IDS/IPS deployment", description: "Network-based intrusion detection and prevention, tuned to your environment." },
      { title: "Signature & behaviour rules", description: "Curated rulesets with false-positive tuning." },
      { title: "Alerting & escalation", description: "Alerts routed to the right people with clear severity." },
      { title: "Logging integration", description: "Centralised logging for investigation and compliance." },
      { title: "Regular tuning", description: "Ongoing rule updates under support plans." },
    ],
    benefits: [
      "Earlier detection of attacks and probing",
      "Automated blocking of known threats",
      "Investigation-ready logs",
      "Stronger compliance posture",
    ],
    tech: ["IDS/IPS engines", "Next-gen firewall threat prevention", "SIEM / log aggregation", "Threat intelligence feeds"],
    relatedServices: ["network-security", "firewall-endpoint-protection", "security-assessment", "managed-services"],
    relatedIndustries: ["finance", "government", "healthcare", "corporate"],
  },
  {
    slug: "security-assessment",
    name: "Security Assessment & Consultation",
    categoryId: "cybersecurity",
    icon: ShieldAlert,
    tagline: "Know your risks before attackers do",
    shortDescription:
      "Practical security assessments, audits and roadmap planning — translated into clear, prioritised action.",
    overview:
      "You can't defend what you don't understand. Our security assessments evaluate your network, systems, surveillance and physical security against real threats — then give you a prioritised, jargon-free roadmap of what to fix first and why.",
    problem: [
      "Uncertainty about where the real risks are.",
      "Budget spent on tools without a clear strategy.",
      "Compliance demands you're not sure you meet.",
      "No independent view of your security posture.",
    ],
    solution:
      "We assess your environment, document risks against likelihood and impact, and produce a prioritised, practical remediation roadmap.",
    deliverables: [
      { title: "Risk assessment", description: "Identification and rating of threats across network, systems and physical security." },
      { title: "Vulnerability review", description: "Scanning and review of exposed services and weak configurations." },
      { title: "Gap analysis", description: "Where you stand versus best practice and any regulatory needs." },
      { title: "Remediation roadmap", description: "Prioritised, cost-aware plan of what to fix first." },
      { title: "Executive briefing", description: "Clear, plain-language summary for decision-makers." },
    ],
    benefits: [
      "Clarity on real risks and priorities",
      "Defensible, documented security posture",
      "Confident, budget-aware decision-making",
      "Foundation for a proper security programme",
    ],
    tech: ["Vulnerability scanners", "Configuration review", "Risk frameworks", "Reporting"],
    relatedServices: ["network-security", "firewall-endpoint-protection", "intrusion-detection", "managed-services"],
    relatedIndustries: ["finance", "corporate", "government", "healthcare", "smb"],
  },

  // ───────────────────────── SURVEILLANCE & MONITORING ─────────────────────────
  {
    slug: "cctv-installation",
    name: "CCTV Installation",
    categoryId: "surveillance",
    icon: Camera,
    tagline: "Coverage engineered so nothing is missed",
    shortDescription:
      "Professional CCTV design and installation with the right cameras in the right places — and reliable playback.",
    overview:
      "Most CCTV problems aren't the cameras — they're the design. Wrong camera for the scene, no coverage of the real risk areas, footage you can't actually use. We design surveillance around what you need to see, deploy quality cameras with proper lensing and lighting, and ensure storage and playback work when it matters.",
    problem: [
      "Cameras that capture nothing useful when an incident happens.",
      "Blind spots at entrances, loading bays and key assets.",
      "Footage too grainy to be useful.",
      "Systems with no remote viewing or unreliable playback.",
    ],
    solution:
      "We design CCTV around your risk areas, deploy cameras with the right resolution, lensing and night capability, and configure reliable storage and remote access.",
    deliverables: [
      { title: "Coverage design", description: "Camera placement plan mapped to your risk areas and sightlines." },
      { title: "Camera deployment", description: "Right cameras for each scene — resolution, lens, IR and WDR tuned." },
      { title: "Storage & retention", description: "NVR/storage sized for your retention needs with reliable recording." },
      { title: "Remote viewing", description: "Secure mobile and web access to live and recorded footage." },
      { title: "Commissioning & handover", description: "Angle tuning, focus checks and user training." },
    ],
    benefits: [
      "Useable footage of the areas that matter",
      "Deterrent and evidence when incidents occur",
      "Reliable remote monitoring",
      "Foundation for integration with access and alarms",
    ],
    tech: ["Hikvision / Dahua cameras", "4K & varifocal cameras", "IR & low-light", "NVR storage", "Mobile/web viewing"],
    relatedServices: ["ip-camera-systems", "video-monitoring", "nvr-dvr-solutions", "structured-cabling", "access-control-systems", "perimeter-intrusion"],
    relatedIndustries: ["retail", "warehouse", "corporate", "residential", "industrial", "construction"],
    featured: true,
  },
  {
    slug: "ip-camera-systems",
    name: "IP Camera Systems",
    categoryId: "surveillance",
    icon: Video,
    tagline: "Modern IP video with the clarity and intelligence you need",
    shortDescription:
      "Network-based IP camera systems with high resolution, smart analytics and scalable storage.",
    overview:
      "IP cameras are the modern standard — higher resolution, smarter analytics, and easier scalability. We design IP video systems that deliver clear footage, intelligent detection (motion, line-crossing, intrusion), and storage that scales with your camera count.",
    problem: [
      "Older analogue systems with poor image quality.",
      "Need for smart features like motion alerts and analytics.",
      "Scaling beyond what the existing system can handle.",
      "Desire for remote, multi-site viewing on one platform.",
    ],
    solution:
      "We deploy IP camera systems with high-resolution cameras, smart analytics and scalable NVR/storage — viewable locally and remotely.",
    deliverables: [
      { title: "IP camera selection", description: "Resolution, lensing and analytics matched to each scene." },
      { title: "Smart analytics", description: "Motion, line-crossing, intrusion and people/vehicle detection." },
      { title: "Scalable storage", description: "NVR with RAID and retention sized to camera count." },
      { title: "Multi-site viewing", description: "Centralised platform for one or many locations." },
      { title: "Network integration", description: "Proper VLAN isolation for clean video traffic." },
    ],
    benefits: [
      "Sharper, more usable footage",
      "Smarter alerts instead of constant recording review",
      "Easier scaling as needs grow",
      "Unified viewing across sites",
    ],
    tech: ["IP cameras (4K/2K)", "Edge analytics", "PoE switching", "NVR with RAID", "VMS platforms"],
    relatedServices: ["cctv-installation", "video-monitoring", "nvr-dvr-solutions", "network-security", "lan-wan"],
    relatedIndustries: ["retail", "warehouse", "corporate", "industrial", "education"],
  },
  {
    slug: "video-monitoring",
    name: "Video Monitoring & Remote Viewing",
    categoryId: "surveillance",
    icon: MonitorPlay,
    tagline: "Eyes on your premises, even when you're away",
    shortDescription:
      "Remote monitoring, live viewing and event-based alerting across single or multiple sites.",
    overview:
      "Installing cameras is only half the value — the other half is watching and responding. We set up remote monitoring so you (or our team) can view live footage, receive event-based alerts, and review recordings from anywhere, across one or many sites.",
    problem: [
      "Cameras installed but nobody watching them.",
      "No alerts when something actually happens.",
      "Can't view footage when off-site.",
      "Multiple sites with no unified view.",
    ],
    solution:
      "We configure remote monitoring with live viewing, event-based alerts and a unified multi-site platform — accessible securely from anywhere.",
    deliverables: [
      { title: "Remote viewing setup", description: "Secure mobile and web access to live and recorded footage." },
      { title: "Event alerts", description: "Push/email alerts for motion, line-crossing and intrusion events." },
      { title: "Multi-site platform", description: "Unified dashboard across all your locations." },
      { title: "Monitoring integration", description: "Optional integration with access control and alarms." },
      { title: "User management", description: "Role-based access for staff and security teams." },
    ],
    benefits: [
      "Real-time awareness across sites",
      "Faster response to incidents",
      "Reduced need for constant manual monitoring",
      "Centralised oversight of security",
    ],
    tech: ["VMS / mobile apps", "Push & email alerting", "Cloud / on-prem platforms", "Role-based access"],
    relatedServices: ["cctv-installation", "ip-camera-systems", "nvr-dvr-solutions", "access-control-systems", "burglar-alarm-systems"],
    relatedIndustries: ["retail", "warehouse", "hospitality", "corporate", "construction"],
  },
  {
    slug: "nvr-dvr-solutions",
    name: "NVR / DVR & Storage Solutions",
    categoryId: "surveillance",
    icon: HardDrive,
    tagline: "Reliable recording that keeps your footage when it counts",
    shortDescription:
      "Network and digital video recorders with RAID storage, retention planning and redundancy.",
    overview:
      "Footage is only valuable if it's still there when you need it. We deploy NVR and DVR solutions with properly sized storage, RAID redundancy, retention planning and reliable recording schedules — so your footage survives hardware failures and is available when incidents are discovered days later.",
    problem: [
      "Footage lost or overwritten before an incident is noticed.",
      "Single-drive recorders with no redundancy.",
      "Storage too small for the camera count and retention needed.",
      "Unreliable recording that misses the moment.",
    ],
    solution:
      "We size and deploy NVR/DVR storage with redundancy and retention planning matched to your cameras and needs.",
    deliverables: [
      { title: "Storage sizing", description: "Capacity calculated from camera count, resolution, retention and activity." },
      { title: "RAID & redundancy", description: "Disk redundancy so a failed drive doesn't lose footage." },
      { title: "Retention planning", description: "Recording schedules and retention aligned to requirements." },
      { title: "Backup options", description: "Off-site or cloud backup for critical footage." },
      { title: "Health monitoring", description: "Disk health monitoring and alerts under support plans." },
    ],
    benefits: [
      "Footage available when you need it — days later, not hours",
      "Protection against drive failure",
      "Right-sized storage, no overpaying or under-provisioning",
      "Confident retention for compliance",
    ],
    tech: ["NVR / DVR", "RAID storage", "Surveillance-grade disks", "Cloud backup", "Retention scheduling"],
    relatedServices: ["cctv-installation", "ip-camera-systems", "video-monitoring", "network-installation"],
    relatedIndustries: ["retail", "warehouse", "finance", "corporate", "hospitality"],
  },

  // ───────────────────────── ACCESS CONTROL & AUTOMATION ─────────────────────────
  {
    slug: "access-control-systems",
    name: "Access Control Systems",
    categoryId: "access",
    icon: KeyRound,
    tagline: "Decide who goes where, and when",
    shortDescription:
      "Card, fob and app-based access control with audit trails, schedules and integration.",
    overview:
      "Keys get copied, lost and untracked. Access control systems let you decide exactly who can enter which door, when — with full audit trails, time schedules and instant revocation. We design and deploy access control that scales from a single door to a full building or campus.",
    problem: [
      "Lost or copied keys compromising security.",
      "No record of who entered and when.",
      "Difficulty revoking access for former staff or tenants.",
      "Different access needs for different roles and times.",
    ],
    solution:
      "We deploy card/fob/app access control with role-based permissions, schedules and full audit trails — scalable across doors, buildings and sites.",
    deliverables: [
      { title: "Access design", description: "Door-by-door permissions, roles and schedules." },
      { title: "Reader & controller deployment", description: "Readers, controllers and locking hardware installed." },
      { title: "Credential management", description: "Card/fob/app enrolment and easy revocation." },
      { title: "Audit trails", description: "Full entry/exit logging and reporting." },
      { title: "Integration", description: "Link with CCTV, alarms and time attendance where needed." },
    ],
    benefits: [
      "Control and visibility over who enters your premises",
      "Instant revocation — no rekeying",
      "Audit trail for investigations and compliance",
      "Flexible, role-based access",
    ],
    tech: ["Card/fob/mobile readers", "Access controllers", "Management software", "Electric locks & strikes"],
    relatedServices: ["biometric-systems", "door-access-systems", "intercom-systems", "cctv-installation", "burglar-alarm-systems"],
    relatedIndustries: ["corporate", "finance", "government", "healthcare", "education", "warehouse"],
    featured: true,
  },
  {
    slug: "biometric-systems",
    name: "Biometric Systems",
    categoryId: "access",
    icon: Fingerprint,
    tagline: "Identity you can't lose or share",
    shortDescription:
      "Fingerprint and facial recognition for access control and time attendance.",
    overview:
      "Cards and fobs can be shared or lost — biometrics can't. We deploy fingerprint and facial-recognition systems for access control and time & attendance, giving you certainty about who is actually at the door, and accurate attendance records for payroll.",
    problem: [
      "Shared or borrowed cards undermining access control.",
      "Buddy-punching inflating attendance records.",
      "Need for higher-assurance identity at sensitive doors.",
      "Manual attendance processes prone to error.",
    ],
    solution:
      "We deploy biometric readers for access control and time attendance — accurate, fast and hard to circumvent.",
    deliverables: [
      { title: "Biometric reader deployment", description: "Fingerprint and/or facial recognition at chosen doors." },
      { title: "Enrolment & management", description: "User enrolment and ongoing management." },
      { title: "Time & attendance", description: "Attendance records exportable for payroll." },
      { title: "Access integration", description: "Biometric integrated with your access control platform." },
      { title: "Reporting", description: "Attendance and access reports on demand." },
    ],
    benefits: [
      "Higher-assurance identity verification",
      "Eliminates card sharing and buddy-punching",
      "Accurate attendance for payroll",
      "Strong audit trail",
    ],
    tech: ["Fingerprint readers", "Facial recognition", "Time & attendance software", "ZKTeco platforms"],
    relatedServices: ["access-control-systems", "door-access-systems", "intercom-systems", "smart-building-solutions"],
    relatedIndustries: ["corporate", "finance", "government", "education", "industrial"],
  },
  {
    slug: "door-access-systems",
    name: "Door Access Systems",
    categoryId: "access",
    icon: DoorOpen,
    tagline: "Secure, reliable door hardware that just works",
    shortDescription:
      "Electric locks, strikes, magnetic locks and turnstiles — installed and integrated for reliable operation.",
    overview:
      "An access system is only as reliable as the door hardware behind it. We supply and install electric strikes, magnetic locks, automatic doors and turnstiles — integrated with your access control for smooth, secure entry that won't fail when it matters.",
    problem: [
      "Cheap locking hardware that fails or jams.",
      "Doors that don't reliably lock after entry.",
      "Hardware not integrated with access control.",
      "Bottlenecks at busy entrances.",
    ],
    solution:
      "We install quality electric locking hardware — strikes, maglocks, automatic doors and turnstiles — integrated with your access platform.",
    deliverables: [
      { title: "Hardware selection", description: "Right locking hardware for each door type and traffic." },
      { title: "Installation", description: "Professional mounting, wiring and safety compliance." },
      { title: "Access integration", description: "Hardware wired to controllers and fire-alarm safety release." },
      { title: "Safety compliance", description: "Fail-safe operation and emergency egress compliance." },
      { title: "Testing & handover", description: "Reliability testing under normal and emergency conditions." },
    ],
    benefits: [
      "Reliable, secure door operation",
      "Safe, compliant emergency egress",
      "Smooth flow at busy entrances",
      "Hardware built to last",
    ],
    tech: ["Electric strikes", "Magnetic locks", "Automatic doors", "Turnstiles", "Exit buttons & sensors"],
    relatedServices: ["access-control-systems", "biometric-systems", "intercom-systems", "fire-alarm-systems"],
    relatedIndustries: ["corporate", "government", "healthcare", "education", "industrial"],
  },
  {
    slug: "intercom-systems",
    name: "Intercom Systems",
    categoryId: "access",
    icon: PhoneCall,
    tagline: "See, speak and grant access from anywhere",
    shortDescription:
      "Audio/video intercoms for gates, receptions and multi-tenant buildings with remote unlock.",
    overview:
      "Intercoms are the bridge between security and convenience — see who's at the gate, speak to them, and let them in. We deploy audio and video intercom systems for gates, receptions and multi-tenant buildings, with remote unlock and integration into access control.",
    problem: [
      "No way to verify visitors before granting access.",
      "Staff leaving desks to open gates and doors.",
      "Multi-tenant buildings with messy access management.",
      "Need to answer the gate from anywhere.",
    ],
    solution:
      "We deploy video and audio intercoms with remote unlock, multi-tenant support and access-control integration.",
    deliverables: [
      { title: "Intercom deployment", description: "Audio/video intercoms at gates, doors and receptions." },
      { title: "Remote unlock", description: "Grant access from a desk handset, mobile app or video phone." },
      { title: "Multi-tenant support", description: "Directory and per-unit calling for apartments and offices." },
      { title: "Access integration", description: "Intercom integrated with access control and CCTV." },
      { title: "Mobile answering", description: "Answer and unlock from anywhere via app." },
    ],
    benefits: [
      "Verify visitors before granting access",
      "Convenience without compromising security",
      "Smooth multi-tenant access",
      "Answer the gate from anywhere",
    ],
    tech: ["IP video intercoms", "Mobile intercom apps", "Multi-tenant directories", "Remote unlock"],
    relatedServices: ["access-control-systems", "door-access-systems", "cctv-installation", "smart-building-solutions"],
    relatedIndustries: ["residential", "corporate", "hospitality", "education", "government"],
  },

  // ───────────────────────── ALARM & FIRE SAFETY ─────────────────────────
  {
    slug: "burglar-alarm-systems",
    name: "Burglar Alarm Systems",
    categoryId: "alarm-fire",
    icon: Siren,
    tagline: "Detect intruders early, before loss occurs",
    shortDescription:
      "Intrusion alarm systems with sensors, sirens and remote alerts for homes and businesses.",
    overview:
      "A burglar alarm detects intrusion early and creates a loud, immediate response — often before loss occurs. We design alarm systems with door/window contacts, motion detectors, glass-break sensors and sirens, configured to alert you (or a monitoring contact) the moment an intrusion is detected.",
    problem: [
      "Theft discovered only after the fact.",
      "No alert when an intruder forces entry at night.",
      "Alarms that go off with no one to respond.",
      "Sensors that false-trigger constantly until ignored.",
    ],
    solution:
      "We design alarm systems with the right sensors for your risk, tuned to minimise false alarms and configured to alert the right people fast.",
    deliverables: [
      { title: "Sensor design", description: "Contacts, motion, glass-break and vibration sensors at risk points." },
      { title: "Control panel", description: "Programmable panel with arm/disarm and zone management." },
      { title: "Alerting", description: "Sirens plus phone/app alerts to you or a monitoring contact." },
      { title: "Tuning", description: "Zone configuration to minimise false alarms." },
      { title: "Integration", description: "Link with CCTV, access control and monitoring." },
    ],
    benefits: [
      "Early detection of forced entry",
      "Immediate deterrent and response",
      "Remote alerts wherever you are",
      "Lower false-alarm fatigue",
    ],
    tech: ["Motion & contact sensors", "Glass-break sensors", "Control panels", "Sirens & strobes", "GSM/IP alerting"],
    relatedServices: ["cctv-installation", "perimeter-intrusion", "access-control-systems", "fire-alarm-systems", "video-monitoring"],
    relatedIndustries: ["residential", "retail", "warehouse", "corporate", "industrial"],
  },
  {
    slug: "fire-alarm-systems",
    name: "Fire Alarm Systems",
    categoryId: "alarm-fire",
    icon: Bell,
    tagline: "Life-safety detection engineered to standards",
    shortDescription:
      "Conventional and addressable fire alarm systems with detectors, call points and sounders.",
    overview:
      "Fire alarms are life-safety systems — they must detect early and alert everyone reliably. We design and install conventional and addressable fire alarm systems with smoke, heat and flame detectors, manual call points, sounders and strobes, engineered for compliance and rapid evacuation.",
    problem: [
      "No early warning of fire, endangering lives.",
      "Systems that don't meet safety standards or insurance requirements.",
      "Undersized sounders that can't be heard across the site.",
      "No integration with access control for evacuation.",
    ],
    solution:
      "We design and install fire alarm systems — conventional or addressable — with proper detector coverage, audible/visual alerting and integration for safe evacuation.",
    deliverables: [
      { title: "System design", description: "Detector coverage and zoning engineered to standards." },
      { title: "Detector deployment", description: "Smoke, heat and flame detectors at the right locations." },
      { title: "Call points & sounders", description: "Manual call points, sounders and strobes for full-site alerting." },
      { title: "Panel & programming", description: "Control panel with zones, delays and evacuation logic." },
      { title: "Integration", description: "Door release for evacuation and link to monitoring." },
    ],
    benefits: [
      "Early, reliable fire detection",
      "Compliant, insurable life-safety system",
      "Clear evacuation alerting",
      "Integrated, safer response",
    ],
    tech: ["Conventional & addressable panels", "Smoke/heat/flame detectors", "Sounders & strobes", "Manual call points"],
    relatedServices: ["fire-detection-safety", "door-access-systems", "burglar-alarm-systems", "managed-services"],
    relatedIndustries: ["hospitality", "healthcare", "education", "corporate", "industrial", "warehouse"],
    featured: true,
  },
  {
    slug: "fire-detection-safety",
    name: "Fire Detection & Safety Systems",
    categoryId: "alarm-fire",
    icon: Flame,
    tagline: "Beyond alarms — full fire-safety engineering",
    shortDescription:
      "Comprehensive fire detection, suppression support and safety systems for compliance and protection.",
    overview:
      "Fire safety is more than an alarm panel. We cover the wider fire-safety picture — detection design, suppression support interfaces, emergency lighting, signage and evacuation planning — so your premises are protected and compliant, not just alarmed.",
    problem: [
      "Partial fire safety with gaps in detection or egress.",
      "Emergency lighting that fails when power is lost.",
      "No coordinated evacuation plan or signage.",
      "Compliance gaps that surface during inspection.",
    ],
    solution:
      "We engineer comprehensive fire detection and safety — detection, suppression interfaces, emergency lighting and evacuation support.",
    deliverables: [
      { title: "Detection engineering", description: "Detector selection and coverage for your premises type." },
      { title: "Suppression interfaces", description: "Integration with suppression and shutdown systems." },
      { title: "Emergency lighting", description: "Lighting that guides evacuation during power loss." },
      { title: "Signage & egress", description: "Evacuation signage and exit routing support." },
      { title: "Compliance documentation", description: "System records for inspection and insurance." },
    ],
    benefits: [
      "Comprehensive, compliant fire safety",
      "Safer evacuation under any condition",
      "Reduced liability and insurability",
      "Coordinated, documented protection",
    ],
    tech: ["Detection systems", "Suppression interfaces", "Emergency lighting", "Evacuation signage"],
    relatedServices: ["fire-alarm-systems", "door-access-systems", "managed-services", "server-data-centre"],
    relatedIndustries: ["hospitality", "healthcare", "education", "industrial", "warehouse", "corporate"],
  },
  {
    slug: "perimeter-intrusion",
    name: "Perimeter Intrusion Detection",
    categoryId: "alarm-fire",
    icon: ShieldAlert,
    tagline: "Catch intruders at the fence, not the door",
    shortDescription:
      "Perimeter sensors, beam detectors and fence systems for early intrusion warning.",
    overview:
      "The earlier you detect an intruder, the more time you have to respond. Perimeter intrusion detection — beam sensors, fence detection and vibration sensors — catches intruders at the boundary, not inside your premises. We design perimeter systems integrated with CCTV and alarms for a layered defence.",
    problem: [
      "Intruders detected only after they're inside.",
      "Large perimeters that can't be watched constantly.",
      "Need to trigger CCTV recording before entry.",
      "Outdoor environments that defeat indoor sensors.",
    ],
    solution:
      "We deploy outdoor perimeter detection — beams, fence and vibration sensors — integrated with CCTV and alarms for early warning.",
    deliverables: [
      { title: "Perimeter assessment", description: "Boundary survey to choose the right detection technology." },
      { title: "Sensor deployment", description: "Active/passive beams, fence or vibration sensors." },
      { title: "CCTV integration", description: "Triggered recording and PTZ camera response." },
      { title: "Alarm & alerts", description: "Sirens and remote alerts on detection." },
      { title: "Environmental tuning", description: "Tuning to reduce false triggers from animals and weather." },
    ],
    benefits: [
      "Earlier detection at the boundary",
      "Time to respond before entry",
      "Triggered CCTV for evidence",
      "Layered defence with alarms and surveillance",
    ],
    tech: ["Active infrared beams", "Fence & vibration sensors", "Outdoor detectors", "CCTV integration"],
    relatedServices: ["cctv-installation", "burglar-alarm-systems", "video-monitoring", "access-control-systems"],
    relatedIndustries: ["industrial", "warehouse", "construction", "residential", "government"],
  },

  // ───────────────────────── IT INFRASTRUCTURE & SUPPORT ─────────────────────────
  {
    slug: "server-data-centre",
    name: "Server & Data-Centre Solutions",
    categoryId: "infrastructure",
    icon: ServerCog,
    tagline: "Resilient compute, storage and racks",
    shortDescription:
      "Server deployment, rack fit-out, storage and backup for reliable business compute.",
    overview:
      "Your business runs on servers and storage. We design and deploy server and small-data-centre solutions — physical and virtual servers, storage, rack fit-out, cooling, UPS and backup — engineered for resilience and recoverability, not just uptime on paper.",
    problem: [
      "Servers sitting under a desk with no redundancy or backup.",
      "No proper rack, cooling or power protection.",
      "Data at risk from failed drives with no backup.",
      "Recovery that would take days, not hours.",
    ],
    solution:
      "We engineer server and data-centre solutions — compute, storage, racks, UPS and backup — built for resilience and fast recovery.",
    deliverables: [
      { title: "Architecture & sizing", description: "Compute, storage and network sized to your workload." },
      { title: "Rack & environment", description: "Racks, cooling, cable management and layout." },
      { title: "Power & UPS", description: "UPS protection and power distribution." },
      { title: "Virtualisation & storage", description: "Hypervisors, RAID storage and capacity planning." },
      { title: "Backup & recovery", description: "Backup strategy with tested recovery." },
    ],
    benefits: [
      "Reliable business compute",
      "Protected power and cooling",
      "Data protected by backup and redundancy",
      "Faster recovery from failure",
    ],
    tech: ["Virtualisation (Hyper-V/Proxmox)", "RAID/NAS storage", "Racks & UPS", "Veeam backup", "APC power"],
    relatedServices: ["computer-it-support", "managed-services", "network-security", "firewall-endpoint-protection", "network-installation"],
    relatedIndustries: ["corporate", "finance", "healthcare", "education", "industrial"],
    featured: true,
  },
  {
    slug: "computer-it-support",
    name: "Computer & IT Support",
    categoryId: "infrastructure",
    icon: MonitorCog,
    tagline: "Responsive IT support that keeps people productive",
    shortDescription:
      "Helpdesk, on-site and remote IT support for workstations, users and day-to-day operations.",
    overview:
      "When computers, printers or accounts stop working, productivity stops. We provide responsive IT support — remote helpdesk and on-site assistance — covering workstations, users, networking and day-to-day IT, so issues get resolved fast and staff stay productive.",
    problem: [
      "IT issues that stall work for hours or days.",
      "No responsive support when something breaks.",
      "Recurring problems nobody gets to the root of.",
      "Staff wasting time on IT issues instead of their jobs.",
    ],
    solution:
      "We provide responsive remote and on-site IT support — fast helpdesk and root-cause resolution.",
    deliverables: [
      { title: "Helpdesk support", description: "Remote support for user and system issues." },
      { title: "On-site support", description: "Engineers on-site for hands-on issues." },
      { title: "Workstation management", description: "Setup, updates and troubleshooting of computers." },
      { title: "User & account support", description: "Account, email and access management." },
      { title: "Root-cause resolution", description: "Fixing underlying issues, not just symptoms." },
    ],
    benefits: [
      "Faster resolution of IT issues",
      "Less downtime, more productivity",
      "Predictable IT support costs",
      "One number to call for IT",
    ],
    tech: ["Remote support tooling", "Helpdesk ticketing", "Workstation management", "User provisioning"],
    relatedServices: ["managed-services", "server-data-centre", "network-maintenance", "systems-installation-maintenance"],
    relatedIndustries: ["corporate", "smb", "education", "healthcare", "retail"],
  },
  {
    slug: "systems-installation-maintenance",
    name: "Systems Installation & Maintenance",
    categoryId: "infrastructure",
    icon: Cog,
    tagline: "Deployed right, maintained properly",
    shortDescription:
      "Professional installation and ongoing maintenance for IT and security systems.",
    overview:
      "Systems work best when they're installed properly and maintained regularly. We handle the installation and ongoing maintenance of IT and security systems — making sure everything from servers to access control is deployed to standard and kept healthy over its lifetime.",
    problem: [
      "Systems installed without proper configuration or testing.",
      "No maintenance, so systems degrade and fail.",
      "Multiple vendors with no overall ownership.",
      "Equipment past warranty with no support path.",
    ],
    solution:
      "We install and maintain your IT and security systems — proper deployment plus scheduled, preventive maintenance.",
    deliverables: [
      { title: "Professional installation", description: "Systems deployed, configured and tested to standard." },
      { title: "Preventive maintenance", description: "Scheduled servicing to keep systems healthy." },
      { title: "Health monitoring", description: "Monitoring that catches issues early." },
      { title: "Lifecycle management", description: "Warranty, refresh and replacement planning." },
      { title: "Single ownership", description: "One partner accountable across systems." },
    ],
    benefits: [
      "Systems that work reliably for longer",
      "Fewer surprise failures",
      "Predictable maintenance costs",
      "One accountable partner",
    ],
    tech: ["Installation & commissioning", "Preventive maintenance", "Monitoring", "Lifecycle planning"],
    relatedServices: ["managed-services", "computer-it-support", "network-maintenance", "server-data-centre"],
    relatedIndustries: ["corporate", "smb", "education", "healthcare", "industrial"],
  },
  {
    slug: "smart-building-solutions",
    name: "Smart Building Solutions",
    categoryId: "infrastructure",
    icon: Building2,
    tagline: "Connected, intelligent buildings",
    shortDescription:
      "Integrated building systems — security, automation, lighting and energy — working as one.",
    overview:
      "Modern buildings don't need a dozen disconnected systems. We design smart-building solutions that integrate security, access, surveillance, lighting, climate and energy into one manageable platform — so your building is more secure, efficient and comfortable.",
    problem: [
      "A dozen systems that don't talk to each other.",
      "Energy waste from unmanaged lighting and climate.",
      "No automation for routine building functions.",
      "Complexity that frustrates facility teams.",
    ],
    solution:
      "We design integrated smart-building solutions — security, automation and energy under one platform.",
    deliverables: [
      { title: "Integration design", description: "Architecture unifying security, automation and energy." },
      { title: "Automation", description: "Schedules and rules for lighting, climate and access." },
      { title: "Energy management", description: "Monitoring and control to reduce waste." },
      { title: "Single platform", description: "One interface for building operations." },
      { title: "Scalability", description: "Architecture that grows with the building." },
    ],
    benefits: [
      "Simpler, smarter building operations",
      "Lower energy costs",
      "Better security and comfort",
      "One interface instead of many",
    ],
    tech: ["Building automation", "IoT integration", "Lighting & climate control", "Unified platforms"],
    relatedServices: ["access-control-systems", "intercom-systems", "cctv-installation", "wifi-installation", "server-data-centre"],
    relatedIndustries: ["corporate", "hospitality", "residential", "government", "healthcare"],
  },
  {
    slug: "managed-services",
    name: "Managed Services & Technical Support",
    categoryId: "infrastructure",
    icon: LifeBuoy,
    tagline: "Your IT and security, fully managed",
    shortDescription:
      "Ongoing managed services — monitoring, maintenance, support and improvement — under one agreement.",
    overview:
      "The best systems are the ones that keep working because someone is looking after them. Our managed services put your IT and security under continuous care — monitoring, preventive maintenance, priority support and ongoing improvement — for a predictable monthly fee instead of unpredictable break-fix bills.",
    problem: [
      "Unpredictable IT and security costs.",
      "Systems that degrade because nobody maintains them.",
      "Slow, reactive support.",
      "No visibility into system health or risk.",
    ],
    solution:
      "We manage your IT and security under one agreement — proactive monitoring, maintenance, support and improvement.",
    deliverables: [
      { title: "Continuous monitoring", description: "24/7 monitoring of critical systems and security." },
      { title: "Preventive maintenance", description: "Scheduled servicing across IT and security." },
      { title: "Priority support", description: "Defined SLAs and direct access to engineers." },
      { title: "Reporting & visibility", description: "Regular health and activity reporting." },
      { title: "Continuous improvement", description: "Recommendations to strengthen and optimise over time." },
    ],
    benefits: [
      "Predictable costs and fewer surprises",
      "Healthier systems that fail less",
      "Faster, prioritised response",
      "Strategic partner, not just a vendor",
    ],
    tech: ["Monitoring platforms", "RMM tooling", "Ticketing & SLAs", "Security management"],
    relatedServices: ["computer-it-support", "network-maintenance", "network-security", "systems-installation-maintenance"],
    relatedIndustries: ["corporate", "smb", "finance", "healthcare", "education"],
    featured: true,
  },
];

/* Convenience lookups */
export const serviceMap: Record<string, Service> = Object.fromEntries(
  services.map((s) => [s.slug, s]),
);

export const categoryMap: Record<string, ServiceCategory> = Object.fromEntries(
  serviceCategories.map((c) => [c.id, c]),
);

export function getServiceBySlug(slug: string): Service | undefined {
  return serviceMap[slug];
}

export function getCategoryById(id: string): ServiceCategory | undefined {
  return categoryMap[id];
}

export function servicesByCategory(categoryId: string): Service[] {
  return services.filter((s) => s.categoryId === categoryId);
}

export function relatedServices(slug: string): Service[] {
  const s = serviceMap[slug];
  if (!s) return [];
  return s.relatedServices.map((r) => serviceMap[r]).filter(Boolean);
}

export const featuredServices = services.filter((s) => s.featured);
