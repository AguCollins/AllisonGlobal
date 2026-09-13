import type { BlogPost } from "@/lib/types";

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-choose-cctv-system-nigeria",
    title: "How to Choose the Right CCTV System for Your Business in Nigeria",
    excerpt:
      "Resolution, coverage, storage and night capability matter far more than camera count. Here's how to specify a CCTV system that actually protects your premises.",
    category: "Surveillance",
    readTime: "7 min read",
    date: "2024-11-12",
    author: "Agu Chisom Alvin",
    authorRole: "Founder & CEO, Allison Global",
    imageQuery: "cctv security camera installation on building exterior",
    tags: ["CCTV", "Surveillance", "Security"],
    featured: true,
    content: [
      {
        body: "Most businesses buy CCTV the same way: a few cameras, a recorder, and hope. Months later, when an incident happens, the footage is too grainy, the wrong areas are covered, or the recording wasn't even running. The problem is rarely the cameras — it's the design. Here's how to specify a CCTV system that delivers usable footage when it matters.",
      },
      {
        heading: "Start with what you need to see",
        body: "Before discussing camera models, define your risk areas: entrances, exits, point-of-sale counters, stockrooms, loading bays, car parks and cash-handling points. A camera covering a low-risk corridor is wasted budget; a gap at your main entrance is a real vulnerability. Map your site and mark what actually needs watching.",
      },
      {
        heading: "Resolution and lensing matter more than camera count",
        body: "A single 4K camera with the right lens can outperform four cheap ones. Resolution determines detail, but lensing determines what fits in frame and how far you can identify faces or plates. For entrances and cash points, prioritise high resolution with a lens suited to the distance. For wide area overview, lower resolution is acceptable.",
      },
      {
        heading: "Don't forget night capability",
        body: "Most incidents happen after dark. Cameras need either strong infrared (IR) illumination or true low-light (Starlight-class) sensors. For outdoor perimeters, consider cameras with adaptive IR and wide dynamic range to handle headlights and mixed lighting. A camera that goes blind at night is a camera that isn't really protecting you.",
      },
      {
        heading: "Size storage to your retention needs",
        body: "Footage is only useful if it's still there when you discover an incident — often days later. Size your NVR storage to your camera count, resolution, recording schedule and required retention. Add redundancy with RAID so a failed drive doesn't lose everything. For critical footage, consider off-site or cloud backup of key events.",
      },
      {
        heading: "Make it viewable and integrated",
        body: "Modern CCTV should be viewable from anywhere and integrated with your other security. Motion and line-crossing alerts to your phone, recording triggered by an alarm or access event, and a unified view across multiple sites turn cameras from passive recording into active security.",
      },
      {
        body: "A well-designed CCTV system is an investment that pays for itself the first time it deters a loss or provides the evidence you need. Specify it for your real risks — not for a camera count — and you'll get far more value for the same budget.",
      },
    ],
  },
  {
    slug: "cybersecurity-basics-nigerian-smes",
    title: "Cybersecurity Basics Every Nigerian SME Should Get Right First",
    excerpt:
      "Before you invest in advanced tools, get these fundamentals right. They prevent the majority of breaches targeting small and medium businesses.",
    category: "Cybersecurity",
    readTime: "8 min read",
    date: "2024-10-28",
    author: "Allison Global Team",
    authorRole: "Allison Global Insights",
    imageQuery: "cybersecurity firewall network protection concept",
    tags: ["Cybersecurity", "Network Security", "SME"],
    featured: true,
    content: [
      {
        body: "Small and medium businesses are now a primary target for cybercriminals — not because they're valuable, but because they're often undefended. The good news: the majority of attacks can be prevented with fundamentals, not expensive tools. Here's what to get right first.",
      },
      {
        heading: "1. A real firewall, not a consumer router",
        body: "Your internet router is not a security device. A next-generation firewall with threat prevention, application control and web filtering blocks the majority of attacks at the edge. It's the single highest-impact upgrade most SMEs can make.",
      },
      {
        heading: "2. Endpoint protection that detects behaviour, not just files",
        body: "Free antivirus matches against known signatures — useless against new threats. Modern endpoint detection and response (EDR) watches behaviour and can stop ransomware in motion, often rolling back changes. Deploy it on every workstation and server.",
      },
      {
        heading: "3. Segment your network",
        body: "A flat network means one infected device can reach everything. Separate staff, guest, surveillance and device networks with VLANs so a breach in one zone doesn't spread to your servers or surveillance systems.",
      },
      {
        heading: "4. Backups that survive an attack",
        body: "Ransomware encrypts backups too if they're connected. Follow the 3-2-1 rule: three copies of your data, on two different media, with one off-site and offline. Test restores — an untested backup is a hope, not a plan.",
      },
      {
        heading: "5. Multi-factor authentication everywhere",
        body: "Stolen passwords still drive most breaches. Multi-factor authentication on email, accounting and remote access stops the vast majority of credential-based attacks for very little cost.",
      },
      {
        heading: "6. Patching and updates",
        body: "Known vulnerabilities in unpatched software are an open door. Apply security updates promptly — to operating systems, firmware and applications. A managed-support plan takes this off your plate entirely.",
      },
      {
        body: "Get these six right and you've closed the door on the majority of attacks targeting SMEs. Advanced tools build on this foundation — they don't replace it. If you're not sure where you stand, a security assessment will tell you, in plain language, what to fix first.",
      },
    ],
  },
  {
    slug: "structured-cabling-future-proofing",
    title: "Why Structured Cabling Is the Investment You'll Thank Yourself For",
    excerpt:
      "The cabling behind your network, CCTV and access systems outlasts almost everything else you install. Here's why it deserves real engineering — not shortcuts.",
    category: "Networking",
    readTime: "6 min read",
    date: "2024-10-10",
    author: "Agu Chisom Alvin",
    authorRole: "Founder & CEO, Allison Global",
    imageQuery: "structured cabling network rack tidy patch panel",
    tags: ["Networking", "Cabling", "Infrastructure"],
    content: [
      {
        body: "Structured cabling is invisible — until something breaks. Buried in walls and racks, it's easy to treat as an afterthought. But it's the longest-lived part of your IT and security infrastructure, and the one most likely to be done badly. Here's why it deserves real engineering.",
      },
      {
        heading: "Everything runs on the cable",
        body: "Your network, phones, CCTV, access control, Wi-Fi and IT systems all depend on the same cabling foundation. A poor cabling job causes intermittent faults that are maddening to diagnose — dropouts, slow speeds, cameras that flicker, doors that intermittently fail. Good cabling eliminates an entire class of problems.",
      },
      {
        heading: "Standards, testing and documentation",
        body: "Proper structured cabling follows TIA/EIA standards: correct cable categories, proper termination, cable management, and certification testing on every link. You receive test results and as-built documentation — so future changes are quick and safe, not guesswork.",
      },
      {
        heading: "Future-proofing is cheap insurance",
        body: "Installing higher-specification cable (Cat6A over Cat5e, fibre backbone for larger sites) costs marginally more during installation and dramatically less than re-pulling cable later. Plan for the bandwidth you'll need in five years, not what you need today.",
      },
      {
        heading: "Tidy racks save money",
        body: "A well-dressed, labelled rack makes troubleshooting fast, expansion easy, and downtime shorter. A chaotic rack hides faults, slows every change, and costs you in engineer time every single time something needs attention.",
      },
      {
        body: "Cabling is the foundation everything else stands on. Engineer it properly once, and your network, surveillance and IT systems will perform reliably for decades — and you'll never have to re-do it.",
      },
    ],
  },
  {
    slug: "access-control-vs-traditional-keys",
    title: "Access Control vs Traditional Keys: The Business Case",
    excerpt:
      "Keys get lost, copied and never returned. Access control gives you control, audit trails and instant revocation — often for less than you'd expect over time.",
    category: "Access Control",
    readTime: "6 min read",
    date: "2024-09-22",
    author: "Allison Global Team",
    authorRole: "Allison Global Insights",
    imageQuery: "access control card reader door entry system",
    tags: ["Access Control", "Security"],
    content: [
      {
        body: "Keys have served buildings for centuries, but for modern businesses they're a liability. Lost, copied, unreturned keys compromise security silently, and rekeying an entire building is expensive. Access control solves these problems — and adds capabilities keys simply can't offer.",
      },
      {
        heading: "Control who goes where, and when",
        body: "Access control lets you define exactly which doors each person can open, and when. The finance office only during business hours. The server room only for IT. The warehouse only for logistics staff. Try that with a keyring.",
      },
      {
        heading: "Audit trails change investigations",
        body: "When something goes wrong, access control tells you who was where, and when. That audit trail is invaluable for investigations, disputes and compliance — and impossible with traditional keys.",
      },
      {
        heading: "Instant revocation, no rekeying",
        body: "When staff leave, or a fob is lost, you revoke access in seconds — no locksmith, no new keys cut, no doors left vulnerable in the meantime. For businesses with staff turnover, this alone often justifies the investment.",
      },
      {
        heading: "It integrates with your other systems",
        body: "Modern access control integrates with CCTV (record when a door opens), alarms (trigger on forced entry), and time & attendance (one credential for entry and payroll). It becomes part of a unified security platform rather than a standalone product.",
      },
      {
        body: "Access control isn't just about replacing keys — it's about gaining control, visibility and integration that keys can never provide. For most businesses, the case is clear long before you count the cost of the next rekeying.",
      },
    ],
  },
  {
    slug: "fire-safety-compliance-nigeria",
    title: "Fire Safety Compliance: What Nigerian Businesses Should Know",
    excerpt:
      "Fire safety isn't just good practice — it's a regulatory and insurance matter. Here's what a compliant fire detection and safety setup looks like.",
    category: "Fire Safety",
    readTime: "7 min read",
    date: "2024-09-05",
    author: "Allison Global Team",
    authorRole: "Allison Global Insights",
    imageQuery: "fire alarm smoke detector and sounder on ceiling",
    tags: ["Fire Safety", "Compliance"],
    content: [
      {
        body: "Fire safety is a life-safety matter — but it's also a regulatory and insurance one. Businesses that neglect it face not just the risk of fire, but failed inspections, invalid insurance and liability. Here's what a compliant setup looks like.",
      },
      {
        heading: "Detection designed for the space",
        body: "Different spaces need different detection. Smoky, slow fires suit smoke detectors; rapid-flame environments suit flame detectors; kitchens and dusty areas need heat detection to avoid false alarms. Detection must be selected and placed for the actual environment.",
      },
      {
        heading: "Audible and visual alerting",
        body: "Everyone on the premises must be alerted — including those with hearing impairments. That means sounders loud enough across the whole site and visual strobes where needed. An alarm that can't be heard in the back office isn't compliant.",
      },
      {
        heading: "Addressable systems for larger sites",
        body: "For larger premises, addressable fire alarm systems identify exactly which detector triggered — saving critical seconds in evacuation and response. Conventional systems may suffice for smaller sites; the choice should be engineered, not guessed.",
      },
      {
        heading: "Integration for safe evacuation",
        body: "Fire alarms should integrate with access control to release doors for evacuation, and can interface with suppression and shutdown systems. This integration is what turns an alarm into a coordinated life-safety response.",
      },
      {
        heading: "Documentation and maintenance",
        body: "Compliance requires documented design, installation records and a maintenance schedule. A fire alarm that isn't maintained can fail when it matters — and an unmaintained system may not satisfy insurers or inspectors.",
      },
      {
        body: "Fire safety is one area where cutting corners costs lives and money. Engineer it properly, document it, maintain it — and your premises, people and business are protected and defensible.",
      },
    ],
  },
  {
    slug: "managed-services-vs-break-fix",
    title: "Managed IT Services vs Break-Fix: The Real Cost Comparison",
    excerpt:
      "Break-fix feels cheaper — until you count the downtime, the surprises and the lost productivity. Here's why predictable managed services usually win.",
    category: "IT Support",
    readTime: "6 min read",
    date: "2024-08-19",
    author: "Allison Global Team",
    authorRole: "Allison Global Insights",
    imageQuery: "IT support engineer monitoring systems dashboard",
    tags: ["Managed Services", "IT Support"],
    content: [
      {
        body: "Many businesses still operate on a break-fix model: something breaks, you call someone, they fix it, you pay. It feels cheaper because there's no monthly fee — but the real costs are hidden, and they're usually higher.",
      },
      {
        heading: "Break-fix means downtime you pay for",
        body: "Every hour a system is down is lost productivity, missed customers and disrupted operations. Break-fix providers are paid to fix problems — there's no incentive to prevent them. The cost of downtime almost always exceeds the cost of prevention.",
      },
      {
        heading: "Managed services catch issues early",
        body: "With monitoring and preventive maintenance, managed services catch failures before they become outages. A drive showing early failure signs is replaced on schedule, not after it takes your server down on a busy Monday.",
      },
      {
        heading: "Predictable costs, predictable support",
        body: "Managed services give you a predictable monthly cost and defined response SLAs. Budgeting becomes possible, and when something does go wrong, you have priority access to engineers who already know your environment.",
      },
      {
        heading: "Security stays current",
        body: "Under break-fix, security patching happens only when someone notices — often after a breach. Managed services keep systems patched, monitored and hardened continuously, dramatically reducing your attack surface.",
      },
      {
        body: "For most businesses, the math is clear: managed services cost less than the downtime, surprises and risk of break-fix — and you gain a partner invested in keeping your systems healthy rather than profitable when they fail.",
      },
    ],
  },
];

export const blogMap: Record<string, BlogPost> = Object.fromEntries(
  blogPosts.map((p) => [p.slug, p]),
);

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogMap[slug];
}

export const blogCategories = Array.from(
  new Set(blogPosts.map((p) => p.category)),
);
