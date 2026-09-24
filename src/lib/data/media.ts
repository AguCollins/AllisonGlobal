/**
 * Curated media library — real product imagery from Ubiquiti (ui.com), used
 * strategically across the Allison Global site to illustrate the equipment we
 * deploy. All URLs verified reachable (HTTP 200).
 *
 * Source: https://www.ui.com/ (Ubiquiti / UniFi). Used to depict the class of
 * equipment Allison Global designs, supplies, installs and supports.
 */

const U = "https://www.ui.com/microsite/static/";

export const media = {
  /* Hero / lifestyle */
  heroNetwork: U + "hologram-network-BqNL8zKt.jpg",
  industryLeading: U + "industry-leading-CgUA2mbS.webp",
  rackRoom: U + "rack-D_Hb7KFT.jpg",
  networkingTablet: U + "networking-tablet-CtRi_CQt.jpg",
  networkingMobile: U + "networking-mobile-BFL4cCaR.jpg",
  fedexForum: U + "fedex-forum-poster-CWYupQKP.jpg",

  /* Cloud gateways / network infrastructure */
  cloudGateway: U + "cloud-gateway-max-PgX67pU8.png",
  dreamMachinePro: U + "dream-machine-pro-D7jHMwU5.png",
  dreamMachineProMax: U + "dream-machine-pro-max-B0m6x56h.png",
  enterpriseFortress: U + "enterprise-fortress-Bd2GvRXU.png",
  efCore: U + "ef-core-Bz9ntElV.png",
  udmBeast: U + "udm-beast-Di9MEpmK.png",

  /* Switching */
  proXg48Poe: U + "pro-xg-48-poe-DI0KONly.png",
  proXgAggregation: U + "pro-xg-aggregation-6zRhEHEQ.png",
  ecs48Poe: U + "ecs-48-poe-XeM9YVti.png",

  /* WiFi */
  wifiE7: U + "e7-aiLQk4zY.png",
  wifiE7Campus: U + "e7-campus-6ngUJbEY.png",
  wifiU7ProXgs: U + "u7-pro-xgs-DODIRzq6.png",
  wifiU7Pro: U + "u7-pro-BKvEmBXX.png",

  /* Cameras / surveillance */
  camG6Turret: U + "g6-turret-BP-8VZXu.png",
  camAiTurret: U + "ai-turret-CSKLL5lv.png",
  camAiDome: U + "ai-dome-BDTjtzzF.png",
  camAi360: U + "ai-360-BwrUcyx4.png",
  camAiPtz: U + "ai-ptz-precision-BDyGizDT.png",
  camAiMultiSensor: U + "ai-multi-sensor-4-BSyo7TTe.png",
  camG6Bullet: U + "g6-bullet-BNuMKH-W.png",
  camG5Pro: U + "g5-pro-CHhfs6h7.png",
  camAiPro: U + "ai-pro-C21mDcSe.png",
  camAiLpr: U + "ai-lpr-DO0xXirg.png",
  camAiDslr: U + "ai-dslr-BOVSVuuR.png",

  /* Door access / intercom */
  accessHub: U + "enterprise-access-hub-BOf9QGbD.png",
  doorHub: U + "door-hub-LIqvIY61.png",
  elevatorKit: U + "elevator-starter-kit-CcTPWJ5y.png",
  gateKit: U + "gate-access-starter-kit-dUUtUO0A.png",
  g3StarterKitPro: U + "g3-starter-kit-pro-DwMsLt-s.png",

  /* Network attached storage (NAS) — for IT / server / data-centre */
  enas: U + "enas-BieTvCjv.png",
  unasPro: U + "unas-pro-Dv48KUCN.png",
  unasPro8: U + "unas-pro-8-B4ZVGwRh.png",

  /* Video clips (ui.com) — for hero / section backgrounds */
  videoHologramNetwork: U + "hologram-network-CY_pEWOj.mp4",
  videoRack: U + "rack-GwodzbZG.mp4",
  videoNetworkingTablet: U + "networking-tablet-DrKl2BZ-.mp4",
  videoNetworkingMobile: U + "networking-mobile-BI9C6vA3.mp4",
  videoFedexForum: U + "fedex-forum-CLcc0iG0.mp4",
} as const;

export type MediaKey = keyof typeof media;

/** A representative product image for each service category. */
export const categoryMedia: Record<string, string> = {
  network: media.networkingTablet,
  cybersecurity: media.enterpriseFortress,
  surveillance: media.camG6Turret,
  access: media.accessHub,
  "alarm-fire": media.camAi360,
  infrastructure: media.rackRoom,
};

/** Representative image for each service slug. */
export const serviceMedia: Record<string, string> = {
  "structured-cabling": media.proXg48Poe,
  "lan-wan": media.proXgAggregation,
  "wifi-installation": media.wifiE7,
  "network-installation": media.dreamMachinePro,
  "network-maintenance": media.efCore,
  "network-security": media.enterpriseFortress,
  "firewall-endpoint-protection": media.dreamMachineProMax,
  "intrusion-detection": media.enterpriseFortress,
  "security-assessment": media.networkingTablet,
  "cctv-installation": media.camG6Turret,
  "ip-camera-systems": media.camAiDome,
  "video-monitoring": media.networkingTablet,
  "nvr-dvr-solutions": media.unasPro,
  "access-control-systems": media.accessHub,
  "biometric-systems": media.doorHub,
  "door-access-systems": media.doorHub,
  "intercom-systems": media.g3StarterKitPro,
  "burglar-alarm-systems": media.camAi360,
  "fire-alarm-systems": media.camAi360,
  "fire-detection-safety": media.camAi360,
  "perimeter-intrusion": media.camG6Bullet,
  "server-data-centre": media.unasPro8,
  "computer-it-support": media.unasPro,
  "systems-installation-maintenance": media.efCore,
  "smart-building-solutions": media.wifiE7Campus,
  "managed-services": media.udmBeast,
};

/** Representative image per industry. */
export const industryMedia: Record<string, string> = {
  residential: media.wifiU7Pro,
  corporate: media.enterpriseFortress,
  education: media.wifiE7Campus,
  healthcare: media.camAi360,
  hospitality: media.wifiE7,
  retail: media.camAiDome,
  warehouse: media.camG6Bullet,
  industrial: media.camAiPro,
  construction: media.camAiPtz,
  government: media.enterpriseFortress,
  religious: media.camAiMultiSensor,
  finance: media.efCore,
  smb: media.cloudGateway,
};

/** Representative image per project id. */
export const projectMedia: Record<string, string> = {
  "p-001": media.camAiDome,
  "p-002": media.enterpriseFortress,
  "p-003": media.doorHub,
  "p-004": media.camG6Bullet,
  "p-005": media.wifiE7Campus,
  "p-006": media.rackRoom,
  "p-007": media.camAiPtz,
  "p-008": media.g3StarterKitPro,
  "p-009": media.camAi360,
};

/** Hero background image per inner page (view id → image url). */
export const heroMedia: Record<string, string> = {
  about: media.rackRoom,
  services: media.networkingTablet,
  solutions: media.industryLeading,
  industries: media.enterpriseFortress,
  projects: media.camG6Turret,
  process: media.networkingTablet,
  support: media.udmBeast,
  "why-choose-us": media.enterpriseFortress,
  testimonials: media.networkingTablet,
  faqs: media.networkingTablet,
  blog: media.networkingTablet,
  contact: media.networkingTablet,
  quote: media.networkingTablet,
  careers: media.networkingTablet,
  privacy: media.networkingTablet,
  terms: media.networkingTablet,
};

/** Representative image per blog post slug (by topic). */
export const blogMedia: Record<string, string> = {
  "how-to-choose-cctv-system-nigeria": media.camG6Turret,
  "cybersecurity-basics-nigerian-smes": media.enterpriseFortress,
  "structured-cabling-future-proofing": media.proXg48Poe,
  "access-control-vs-traditional-keys": media.accessHub,
  "fire-safety-compliance-nigeria": media.camAi360,
  "managed-services-vs-break-fix": media.udmBeast,
};
