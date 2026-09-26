-- ============================================================
--  ALLISON GLOBAL — COMPLETE NEON SQL SCRIPT
--  Drop everything, create all tables (matching prisma/schema.prisma),
--  seed all content, and create the first superadmin user.
--
--  HOW TO USE:
--  1. Open your Neon project → SQL Editor
--  2. Paste this entire script
--  3. Run it
--  4. Log in at /admin/login with:
--     Email:    admin@allisonglobal.tech
--     Password: Admin@2025
--  5. CHANGE THE PASSWORD immediately after first login
--     via /admin → Settings or the password change API
--
--  NOTE: This script is the ONLY database initialization script.
--        It must create ALL tables and seed ALL content from the
--        static data files in src/lib/data/.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════
--  DROP EVERYTHING (clean slate)
--  Order: child tables first (AuditLog → AdminUser), then parents.
--  CASCADE ensures constraints + dependent objects are dropped.
-- ═══════════════════════════════════════════════════════════
DROP TABLE IF EXISTS "Lead" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "Media" CASCADE;
DROP TABLE IF EXISTS "Redirect" CASCADE;
DROP TABLE IF EXISTS "PageContent" CASCADE;
DROP TABLE IF EXISTS "CompanySettings" CASCADE;
DROP TABLE IF EXISTS "Faq" CASCADE;
DROP TABLE IF EXISTS "Testimonial" CASCADE;
DROP TABLE IF EXISTS "BlogPost" CASCADE;
DROP TABLE IF EXISTS "Project" CASCADE;
DROP TABLE IF EXISTS "Service" CASCADE;
DROP TABLE IF EXISTS "Solution" CASCADE;
DROP TABLE IF EXISTS "Industry" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "AdminUser" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
DROP FUNCTION IF EXISTS "set_updated_at"() CASCADE;

-- ═══════════════════════════════════════════════════════════
--  CREATE TABLES & INDEXES (matches prisma/schema.prisma)
-- ═══════════════════════════════════════════════════════════


-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "industry" TEXT,
    "subject" TEXT,
    "services" TEXT,
    "budget" TEXT,
    "timeline" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "problem" JSONB NOT NULL,
    "solution" TEXT NOT NULL,
    "deliverables" JSONB NOT NULL,
    "benefits" JSONB NOT NULL,
    "tech" JSONB NOT NULL,
    "relatedServices" JSONB NOT NULL,
    "relatedIndustries" JSONB NOT NULL,
    "faqs" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "iconName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "services" JSONB NOT NULL,
    "location" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" JSONB NOT NULL,
    "gallery" JSONB NOT NULL,
    "technologies" JSONB NOT NULL,
    "client" TEXT,
    "completionDate" TEXT,
    "imageQuery" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "readTime" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "authorId" TEXT,
    "imageQuery" TEXT NOT NULL,
    "featuredImage" TEXT,
    "content" JSONB NOT NULL,
    "tags" JSONB NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'published',
    "scheduledAt" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "nofollow" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "challenges" JSONB NOT NULL,
    "solutions" JSONB NOT NULL,
    "outcomes" JSONB NOT NULL,
    "imageQuery" TEXT NOT NULL,
    "imageUrl" TEXT,
    "iconName" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "quote" TEXT NOT NULL,
    "authorName" TEXT NOT NULL DEFAULT '',
    "authorRole" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "projectType" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "components" JSONB NOT NULL,
    "outcomes" JSONB NOT NULL,
    "bestFor" JSONB NOT NULL,
    "iconName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageContent" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "page" TEXT NOT NULL,
    "title" TEXT,
    "metaDescription" TEXT,
    "hero" JSONB,
    "sections" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "type" INTEGER NOT NULL DEFAULT 301,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT NOT NULL DEFAULT '',
    "caption" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_email_idx" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_role_idx" ON "AdminUser"("role");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_type_idx" ON "Lead"("type");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_slug_idx" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_categoryId_idx" ON "Service"("categoryId");

-- CreateIndex
CREATE INDEX "Service_published_idx" ON "Service"("published");

-- CreateIndex
CREATE INDEX "Service_featured_idx" ON "Service"("featured");

-- CreateIndex
CREATE INDEX "Service_sortOrder_idx" ON "Service"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_slug_idx" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_category_idx" ON "Project"("category");

-- CreateIndex
CREATE INDEX "Project_industry_idx" ON "Project"("industry");

-- CreateIndex
CREATE INDEX "Project_published_idx" ON "Project"("published");

-- CreateIndex
CREATE INDEX "Project_featured_idx" ON "Project"("featured");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_category_idx" ON "BlogPost"("category");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "BlogPost"("status");

-- CreateIndex
CREATE INDEX "BlogPost_featured_idx" ON "BlogPost"("featured");

-- CreateIndex
CREATE INDEX "BlogPost_date_idx" ON "BlogPost"("date");

-- CreateIndex
CREATE INDEX "BlogPost_scheduledAt_idx" ON "BlogPost"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_slug_key" ON "Industry"("slug");

-- CreateIndex
CREATE INDEX "Industry_slug_idx" ON "Industry"("slug");

-- CreateIndex
CREATE INDEX "Industry_name_idx" ON "Industry"("name");

-- CreateIndex
CREATE INDEX "Industry_published_idx" ON "Industry"("published");

-- CreateIndex
CREATE INDEX "Industry_sortOrder_idx" ON "Industry"("sortOrder");

-- CreateIndex
CREATE INDEX "Testimonial_sector_idx" ON "Testimonial"("sector");

-- CreateIndex
CREATE INDEX "Testimonial_published_idx" ON "Testimonial"("published");

-- CreateIndex
CREATE INDEX "Testimonial_sortOrder_idx" ON "Testimonial"("sortOrder");

-- CreateIndex
CREATE INDEX "Testimonial_createdAt_idx" ON "Testimonial"("createdAt");

-- CreateIndex
CREATE INDEX "Faq_category_idx" ON "Faq"("category");

-- CreateIndex
CREATE INDEX "Faq_published_idx" ON "Faq"("published");

-- CreateIndex
CREATE INDEX "Faq_sortOrder_idx" ON "Faq"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Solution_slug_key" ON "Solution"("slug");

-- CreateIndex
CREATE INDEX "Solution_slug_idx" ON "Solution"("slug");

-- CreateIndex
CREATE INDEX "Solution_name_idx" ON "Solution"("name");

-- CreateIndex
CREATE INDEX "Solution_published_idx" ON "Solution"("published");

-- CreateIndex
CREATE INDEX "Solution_sortOrder_idx" ON "Solution"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CompanySettings_key_key" ON "CompanySettings"("key");

-- CreateIndex
CREATE INDEX "CompanySettings_key_idx" ON "CompanySettings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PageContent_page_key" ON "PageContent"("page");

-- CreateIndex
CREATE INDEX "PageContent_page_idx" ON "PageContent"("page");

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_from_key" ON "Redirect"("from");

-- CreateIndex
CREATE INDEX "Redirect_from_idx" ON "Redirect"("from");

-- CreateIndex
CREATE UNIQUE INDEX "Media_url_key" ON "Media"("url");

-- CreateIndex
CREATE INDEX "Media_url_idx" ON "Media"("url");

-- CreateIndex
CREATE INDEX "Media_category_idx" ON "Media"("category");

-- CreateIndex
CREATE INDEX "Media_mimeType_idx" ON "Media"("mimeType");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;



-- ═══════════════════════════════════════════════════════════
--  SEED CONTENT
-- ═══════════════════════════════════════════════════════════

-- AUTO-UPDATE TRIGGER for updatedAt columns
-- Ensures updatedAt is always set to CURRENT_TIMESTAMP on UPDATE,
-- even for raw SQL operations (Prisma handles this at the ORM level,
-- but this trigger provides defense-in-depth at the database level).
CREATE OR REPLACE FUNCTION "set_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables with an updatedAt column
CREATE TRIGGER update_AdminUser_updatedAt BEFORE UPDATE ON "AdminUser" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_AuditLog_updatedAt BEFORE UPDATE ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Lead_updatedAt BEFORE UPDATE ON "Lead" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Category_updatedAt BEFORE UPDATE ON "Category" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Service_updatedAt BEFORE UPDATE ON "Service" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Project_updatedAt BEFORE UPDATE ON "Project" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_BlogPost_updatedAt BEFORE UPDATE ON "BlogPost" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Industry_updatedAt BEFORE UPDATE ON "Industry" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Testimonial_updatedAt BEFORE UPDATE ON "Testimonial" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Faq_updatedAt BEFORE UPDATE ON "Faq" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Solution_updatedAt BEFORE UPDATE ON "Solution" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_CompanySettings_updatedAt BEFORE UPDATE ON "CompanySettings" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_PageContent_updatedAt BEFORE UPDATE ON "PageContent" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Redirect_updatedAt BEFORE UPDATE ON "Redirect" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Media_updatedAt BEFORE UPDATE ON "Media" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

-- SEED: ADMIN USER
-- Email:    admin@allisonglobal.tech
-- Password: Admin@2025
-- ⚠️  CHANGE THIS PASSWORD after first login!
INSERT INTO "AdminUser" ("email", "passwordHash", "name", "role", "active") VALUES
('admin@allisonglobal.tech', '$2b$12$GdhabPz5Gv6dd0pzT9yDvOKEBh1XOCWRKBVpiWEjQwCltp2tQ6Hva', 'Allison Global Admin', 'superadmin', true)
ON CONFLICT ("email") DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", "name" = EXCLUDED."name", "role" = EXCLUDED."role", "active" = true, "updatedAt" = CURRENT_TIMESTAMP;

-- SEED: CATEGORIES (6)
INSERT INTO "Category" ("id", "slug", "name", "tagline", "description", "iconName", "accent", "sortOrder") VALUES
('network-connectivity', 'network-connectivity', 'Network & Connectivity', 'The backbone everything else runs on', 'Structured cabling, switching, routing and wireless engineered for performance, reliability and future growth — the foundation beneath every CCTV, access and IT system we deploy.', 'Network', 'from-emerald-500/20 to-teal-500/10', 1),
('cybersecurity', 'cybersecurity', 'Cybersecurity', 'Protect your data, network and endpoints', 'Defend your business against intrusion, malware, ransomware and data loss with layered security — firewalls, endpoint protection, monitoring and proactive assessment.', 'ShieldCheck', 'from-teal-500/20 to-emerald-500/10', 2),
('surveillance-monitoring', 'surveillance-monitoring', 'Surveillance & Monitoring', 'See everything that matters', 'CCTV and IP video systems designed for coverage, clarity and reliable playback — from single-site cameras to multi-location deployments with remote monitoring.', 'Camera', 'from-amber-500/20 to-emerald-500/10', 3),
('access-control', 'access-control', 'Access Control & Automation', 'Control who enters, when and where', 'Card, biometric and intercom systems that secure doors, gates and sensitive areas — with audit trails and integration into your wider security setup.', 'Fingerprint', 'from-emerald-500/20 to-amber-500/10', 4),
('alarm-fire-safety', 'alarm-fire-safety', 'Alarm & Fire Safety', 'Early warning that saves lives and assets', 'Intrusion alarms, fire detection and life-safety systems engineered to standards — so threats are detected early and escalated to the right people fast.', 'Flame', 'from-orange-500/20 to-amber-500/10', 5),
('it-infrastructure', 'it-infrastructure', 'IT Infrastructure & Support', 'Resilient systems, always-on support', 'Servers, data-centre fit-out, computer support and managed services that keep your operations running — designed, deployed and maintained by one team.', 'ServerCog', 'from-teal-500/20 to-slate-500/10', 6);

-- SEED: SERVICES (26)
INSERT INTO "Service" ("id", "slug", "name", "categoryId", "tagline", "shortDescription", "overview", "problem", "solution", "deliverables", "benefits", "tech", "relatedServices", "relatedIndustries", "faqs", "featured", "published", "iconName", "sortOrder") VALUES
('structured-cabling', 'structured-cabling', 'Structured Cabling', 'network-connectivity', 'A cabling foundation engineered to carry your business for decades', 'Standards-compliant copper, fibre and rack cabling with proper labelling, testing and certification.', 'Structured cabling is the unseen backbone of every reliable network, surveillance and access system. We design and install Cat6/Cat6A copper and fibre-optic cabling to TIA/EIA standards, with patch panels, labelled terminations, certification testing and as-built documentation — so your infrastructure is fast, tidy and future-proof.', '["Slow, intermittent connections caused by poorly terminated or tangled cabling.","No documentation, so every change becomes a guessing game.","Cabling that fails under high bandwidth or distance demands.","Messy racks that make troubleshooting and expansion painful."]'::jsonb, 'We engineer a structured cabling system around your building, bandwidth and growth plans — properly planned routes, quality cable, certified terminations and a documented rack you can actually manage.', '[{"title":"Site survey & cable design","description":"Cable routes, outlet counts, rack locations and material take-off tailored to your building."},{"title":"Copper & fibre installation","description":"Cat6/Cat6A and OS2/OM4 fibre pulled, terminated and dressed to standard."},{"title":"Patch panels & racks","description":"Wall and floor racks, patch panels, cable managers and tidy, labelled patching."},{"title":"Certification testing","description":"Fluke-class testers validate every link — you get pass results, not promises."},{"title":"As-built documentation","description":"Outlet schedules, rack diagrams and cable labels that make future changes easy."}]'::jsonb, '["Reliable gigabit and multi-gig performance to every outlet","Clean, documented infrastructure that scales with you","Fewer outages and faster fault-finding","Future-proofed headroom for CCTV, Wi-Fi and IT growth"]'::jsonb, '["Cat6/Cat6A","Single-mode & multimode fibre","LSZH cabling","Cable certification testers","Racks & cable management"]'::jsonb, '["lan-wan","network-installation","wifi-installation","cctv-installation","access-control-systems"]'::jsonb, '["corporate","education","healthcare","industrial","warehouse"]'::jsonb, NULL, true, true, 'Cable', 1),
('lan-wan', 'lan-wan', 'LAN / WAN Solutions', 'network-connectivity', 'Switching, routing and segmentation done right', 'Layer 2/3 switching, VLANs, routing and inter-site connectivity designed for performance and segmentation.', 'A flat network is a slow, insecure network. We design and deploy LAN and WAN infrastructure with managed switching, VLAN segmentation, routing and inter-site links — so voice, data, surveillance and guest traffic are separated, prioritised and resilient.', '["Congested, flat networks where CCTV traffic competes with business data.","Intermittent dropouts from consumer-grade switches and routers.","No segmentation between guest, staff and device networks.","Multi-site connectivity that''s slow, insecure or both."]'::jsonb, 'We architect your LAN/WAN with enterprise switching, VLAN design, routing and secure inter-site links — tuned for performance, segmentation and resilience.', '[{"title":"Network architecture","description":"Topology, VLAN plan, IP scheme and segmentation strategy."},{"title":"Managed switching","description":"Layer 2/3 switches configured with VLANs, QoS and link aggregation."},{"title":"Routing & WAN","description":"Router configuration, inter-site VPN and WAN aggregation where needed."},{"title":"Segmentation","description":"Separate networks for data, voice, surveillance, guests and IoT."},{"title":"Documentation & handover","description":"Configuration backup, IP plan and operational runbook."}]'::jsonb, '["Clean separation of traffic for security and performance","Reliable connectivity that scales with users and devices","Better application performance with proper QoS","Secure multi-site connectivity"]'::jsonb, '["Managed L2/L3 switches","VLANs & 802.1Q","Site-to-site VPN","QoS","Link aggregation"]'::jsonb, '["network-installation","structured-cabling","network-security","firewall-endpoint-protection","wifi-installation"]'::jsonb, '["corporate","education","healthcare","finance","industrial"]'::jsonb, NULL, false, true, 'Router', 2),
('wifi-installation', 'wifi-installation', 'Wi-Fi Installation & Optimization', 'network-connectivity', 'Coverage you can actually rely on, in every corner', 'Heat-mapped wireless deployments and optimisation for offices, hotels, campuses and large homes.', 'Dead zones and dropped Wi-Fi cost productivity and frustrate users. We design wireless networks using proper site surveys and heat maps, deploy enterprise access points with seamless roaming, and tune them for capacity, coverage and speed — whether it''s a 4-room office or a multi-building campus.', '["Dead spots and weak signal in key areas.","Wi-Fi that slows to a crawl when many users connect.","Guest Wi-Fi sharing the same network as staff.","Roaming that drops calls and sessions between access points."]'::jsonb, 'We survey your environment, design access-point placement for true coverage, and configure enterprise Wi-Fi with seamless roaming, band steering and guest isolation.', '[{"title":"Wireless site survey","description":"Heat-mapped coverage planning based on your walls, floors and layout."},{"title":"Access point deployment","description":"Enterprise APs placed and mounted for optimal coverage and capacity."},{"title":"SSID & security design","description":"Separate networks for staff, guests and devices with WPA2/3 security."},{"title":"Roaming & optimisation","description":"Seamless 802.11r/k/v roaming, band steering and channel tuning."},{"title":"Performance validation","description":"Post-installation testing confirming coverage and throughput."}]'::jsonb, '["Reliable coverage everywhere it matters","Higher capacity for many simultaneous users","Secure guest access isolated from business data","Seamless roaming without dropped connections"]'::jsonb, '["Wi-Fi 6 / 6E access points","Controller & cloud-managed Wi-Fi","Mesh & roaming protocols","WPA3","Heat-map survey tools"]'::jsonb, '["network-installation","lan-wan","network-security","structured-cabling","smart-building-solutions"]'::jsonb, '["hospitality","education","corporate","residential","retail"]'::jsonb, NULL, true, true, 'Wifi', 3),
('network-installation', 'network-installation', 'Network Installation & Infrastructure', 'network-connectivity', 'End-to-end network build, from rack to endpoint', 'Turnkey network installation — design, supply, configuration, commissioning and handover.', 'A great network design means nothing without clean execution. We handle the full installation — supply of enterprise equipment, rack build, configuration, commissioning and handover — so your network goes live stable, documented and supported.', '["Equipment bought but never properly configured.","Installations with no testing, no documentation and no support.","Vendors who disappear after deployment.","Networks that work on day one and degrade from day two."]'::jsonb, 'We install your network end-to-end — supply, configure, test, commission and document — then back it with support.', '[{"title":"Equipment supply","description":"Genuine enterprise equipment sourced and supplied with warranty."},{"title":"Rack build & cabling","description":"Clean rack assembly with proper cable management."},{"title":"Configuration","description":"Switches, routers, APs and security configured to design."},{"title":"Commissioning & testing","description":"End-to-end validation before we hand over."},{"title":"Handover & documentation","description":"As-built docs, credentials and operational runbook."}]'::jsonb, '["One accountable partner for the whole build","Stable, tested network from day one","Documented and supportable long-term","Genuine, warrantied equipment"]'::jsonb, '["Enterprise switches & routers","Racks & UPS","Network configuration management","Documentation tooling"]'::jsonb, '["structured-cabling","lan-wan","wifi-installation","network-security","network-maintenance"]'::jsonb, '["corporate","education","healthcare","industrial","warehouse"]'::jsonb, NULL, false, true, 'Network', 4),
('network-maintenance', 'network-maintenance', 'Network Maintenance & Support', 'network-connectivity', 'Keep the backbone healthy, not just installed', 'Preventive maintenance, monitoring and rapid-response support for your network infrastructure.', 'Networks degrade silently — firmware drift, failing links, capacity creep. Our maintenance and support keeps your network healthy with scheduled health checks, monitoring, firmware management and priority response when something breaks.', '["Slow deterioration nobody notices until something fails.","Outdated firmware with known vulnerabilities.","No monitoring, so outages are discovered by users first.","Slow vendor response when the network goes down."]'::jsonb, 'We keep your network under maintenance — proactive monitoring, scheduled servicing, firmware updates and priority response.', '[{"title":"Health checks","description":"Scheduled audits of switching, routing and wireless performance."},{"title":"Monitoring","description":"Proactive monitoring that flags issues before users do."},{"title":"Firmware management","description":"Planned updates and security patching."},{"title":"Priority response","description":"Defined SLA response times for support clients."},{"title":"Change management","description":"Configuration backups and controlled change."}]'::jsonb, '["Fewer surprise outages","Security patches applied on schedule","Faster resolution when issues occur","Predictable support costs"]'::jsonb, '["Network monitoring (SNMP)","Configuration backup","Firmware management","Remote support"]'::jsonb, '["network-installation","managed-services","network-security","computer-it-support"]'::jsonb, '["corporate","education","healthcare","finance","industrial"]'::jsonb, NULL, false, true, 'LifeBuoy', 5),
('network-security', 'network-security', 'Network Security', 'cybersecurity', 'Defend the perimeter and everything inside it', 'Layered network security — firewalls, segmentation, secure access and policy — engineered to your risk profile.', 'Network security is no longer a single firewall at the edge. We design layered defences — perimeter firewalls, internal segmentation, secure remote access, policy and monitoring — so threats are blocked, contained and visible.', '["A single firewall protecting a flat, exposed network.","No visibility into what''s entering or leaving the network.","Insecure remote access opening doors to attackers.","Guest and IoT devices sharing privileged network space."]'::jsonb, 'We engineer layered network security around your actual risk — perimeter defence, segmentation, secure access and monitoring.', '[{"title":"Security architecture","description":"Defence-in-depth design tailored to your risk and compliance needs."},{"title":"Firewall & segmentation","description":"Next-gen firewalling and network segmentation policies."},{"title":"Secure remote access","description":"VPN and zero-trust access for staff and partners."},{"title":"Policy & controls","description":"Access policies, URL filtering and application control."},{"title":"Monitoring & alerts","description":"Logging and alerting on suspicious activity."}]'::jsonb, '["Reduced attack surface and lateral movement","Visibility into network threats","Secure remote and partner access","Stronger posture for compliance"]'::jsonb, '["Next-gen firewalls","Network segmentation","VPN / zero-trust access","URL & app filtering","SIEM logging"]'::jsonb, '["firewall-endpoint-protection","intrusion-detection","security-assessment","lan-wan","managed-services"]'::jsonb, '["finance","corporate","government","healthcare","education"]'::jsonb, NULL, true, true, 'ShieldCheck', 6),
('firewall-endpoint-protection', 'firewall-endpoint-protection', 'Firewall & Endpoint Protection', 'cybersecurity', 'Guard the gate and every device behind it', 'Next-gen firewalls and endpoint protection (EDR/AV) to block malware, ransomware and breaches.', 'The firewall guards the gate; endpoint protection guards every laptop, server and workstation behind it. We deploy and manage both — next-gen firewalls with threat prevention, plus modern endpoint detection and response — so malware, ransomware and intrusions are blocked at the edge and on the device.', '["Consumer antivirus that misses modern threats.","A firewall with no threat prevention or filtering.","Ransomware reaching endpoints unchecked.","Unmanaged devices spreading infection across the network."]'::jsonb, 'We deploy next-gen firewalls with threat prevention and modern endpoint protection across your devices — centrally managed and monitored.', '[{"title":"Next-gen firewalling","description":"Firewall with IDS/IPS, anti-malware, web filtering and application control."},{"title":"Endpoint protection","description":"EDR/antivirus deployed across workstations and servers."},{"title":"Central management","description":"Single console for policy, alerts and remediation."},{"title":"Ransomware defence","description":"Behavioural detection and rollback where supported."},{"title":"Ongoing management","description":"Policy tuning, alerts and reporting under support plans."}]'::jsonb, '["Blocked malware, ransomware and phishing threats","Visibility and control across all endpoints","Faster detection and response","Reduced downtime and data-loss risk"]'::jsonb, '["Fortinet / SonicWall","Bitdefender EDR","Central management consoles","Threat intelligence"]'::jsonb, '["network-security","intrusion-detection","security-assessment","server-data-centre","managed-services"]'::jsonb, '["finance","corporate","healthcare","government","smb"]'::jsonb, NULL, false, true, 'Lock', 7),
('intrusion-detection', 'intrusion-detection', 'Intrusion Detection & Prevention', 'cybersecurity', 'Spot the threats that get past the front door', 'IDS/IPS and monitoring that detects and blocks intrusion attempts on your network.', 'Even strong firewalls can be bypassed. Intrusion detection and prevention systems watch network traffic for attack patterns and suspicious behaviour — alerting and blocking before threats spread. We deploy and tune IDS/IPS so you''re not just defended, you''re aware.', '["Breaches that go unnoticed for weeks or months.","Firewalls that block known bad traffic but miss novel attacks.","No alerting when attackers probe the network.","Compliance requirements for continuous monitoring."]'::jsonb, 'We deploy IDS/IPS with tuned signatures and behaviour monitoring, integrated with your firewall and logging — so threats are detected, blocked and reported.', '[{"title":"IDS/IPS deployment","description":"Network-based intrusion detection and prevention, tuned to your environment."},{"title":"Signature & behaviour rules","description":"Curated rulesets with false-positive tuning."},{"title":"Alerting & escalation","description":"Alerts routed to the right people with clear severity."},{"title":"Logging integration","description":"Centralised logging for investigation and compliance."},{"title":"Regular tuning","description":"Ongoing rule updates under support plans."}]'::jsonb, '["Earlier detection of attacks and probing","Automated blocking of known threats","Investigation-ready logs","Stronger compliance posture"]'::jsonb, '["IDS/IPS engines","Next-gen firewall threat prevention","SIEM / log aggregation","Threat intelligence feeds"]'::jsonb, '["network-security","firewall-endpoint-protection","security-assessment","managed-services"]'::jsonb, '["finance","government","healthcare","corporate"]'::jsonb, NULL, false, true, 'ScanEye', 8),
('security-assessment', 'security-assessment', 'Security Assessment & Consultation', 'cybersecurity', 'Know your risks before attackers do', 'Practical security assessments, audits and roadmap planning — translated into clear, prioritised action.', 'You can''t defend what you don''t understand. Our security assessments evaluate your network, systems, surveillance and physical security against real threats — then give you a prioritised, jargon-free roadmap of what to fix first and why.', '["Uncertainty about where the real risks are.","Budget spent on tools without a clear strategy.","Compliance demands you''re not sure you meet.","No independent view of your security posture."]'::jsonb, 'We assess your environment, document risks against likelihood and impact, and produce a prioritised, practical remediation roadmap.', '[{"title":"Risk assessment","description":"Identification and rating of threats across network, systems and physical security."},{"title":"Vulnerability review","description":"Scanning and review of exposed services and weak configurations."},{"title":"Gap analysis","description":"Where you stand versus best practice and any regulatory needs."},{"title":"Remediation roadmap","description":"Prioritised, cost-aware plan of what to fix first."},{"title":"Executive briefing","description":"Clear, plain-language summary for decision-makers."}]'::jsonb, '["Clarity on real risks and priorities","Defensible, documented security posture","Confident, budget-aware decision-making","Foundation for a proper security programme"]'::jsonb, '["Vulnerability scanners","Configuration review","Risk frameworks","Reporting"]'::jsonb, '["network-security","firewall-endpoint-protection","intrusion-detection","managed-services"]'::jsonb, '["finance","corporate","government","healthcare","smb"]'::jsonb, NULL, false, true, 'ShieldAlert', 9),
('cctv-installation', 'cctv-installation', 'CCTV Installation', 'surveillance-monitoring', 'Coverage engineered so nothing is missed', 'Professional CCTV design and installation with the right cameras in the right places — and reliable playback.', 'Most CCTV problems aren''t the cameras — they''re the design. Wrong camera for the scene, no coverage of the real risk areas, footage you can''t actually use. We design surveillance around what you need to see, deploy quality cameras with proper lensing and lighting, and ensure storage and playback work when it matters.', '["Cameras that capture nothing useful when an incident happens.","Blind spots at entrances, loading bays and key assets.","Footage too grainy to be useful.","Systems with no remote viewing or unreliable playback."]'::jsonb, 'We design CCTV around your risk areas, deploy cameras with the right resolution, lensing and night capability, and configure reliable storage and remote access.', '[{"title":"Coverage design","description":"Camera placement plan mapped to your risk areas and sightlines."},{"title":"Camera deployment","description":"Right cameras for each scene — resolution, lens, IR and WDR tuned."},{"title":"Storage & retention","description":"NVR/storage sized for your retention needs with reliable recording."},{"title":"Remote viewing","description":"Secure mobile and web access to live and recorded footage."},{"title":"Commissioning & handover","description":"Angle tuning, focus checks and user training."}]'::jsonb, '["Useable footage of the areas that matter","Deterrent and evidence when incidents occur","Reliable remote monitoring","Foundation for integration with access and alarms"]'::jsonb, '["Hikvision / Dahua cameras","4K & varifocal cameras","IR & low-light","NVR storage","Mobile/web viewing"]'::jsonb, '["ip-camera-systems","video-monitoring","nvr-dvr-solutions","structured-cabling","access-control-systems","perimeter-intrusion"]'::jsonb, '["retail","warehouse","corporate","residential","industrial","construction"]'::jsonb, NULL, true, true, 'Camera', 10),
('ip-camera-systems', 'ip-camera-systems', 'IP Camera Systems', 'surveillance-monitoring', 'Modern IP video with the clarity and intelligence you need', 'Network-based IP camera systems with high resolution, smart analytics and scalable storage.', 'IP cameras are the modern standard — higher resolution, smarter analytics, and easier scalability. We design IP video systems that deliver clear footage, intelligent detection (motion, line-crossing, intrusion), and storage that scales with your camera count.', '["Older analogue systems with poor image quality.","Need for smart features like motion alerts and analytics.","Scaling beyond what the existing system can handle.","Desire for remote, multi-site viewing on one platform."]'::jsonb, 'We deploy IP camera systems with high-resolution cameras, smart analytics and scalable NVR/storage — viewable locally and remotely.', '[{"title":"IP camera selection","description":"Resolution, lensing and analytics matched to each scene."},{"title":"Smart analytics","description":"Motion, line-crossing, intrusion and people/vehicle detection."},{"title":"Scalable storage","description":"NVR with RAID and retention sized to camera count."},{"title":"Multi-site viewing","description":"Centralised platform for one or many locations."},{"title":"Network integration","description":"Proper VLAN isolation for clean video traffic."}]'::jsonb, '["Sharper, more usable footage","Smarter alerts instead of constant recording review","Easier scaling as needs grow","Unified viewing across sites"]'::jsonb, '["IP cameras (4K/2K)","Edge analytics","PoE switching","NVR with RAID","VMS platforms"]'::jsonb, '["cctv-installation","video-monitoring","nvr-dvr-solutions","network-security","lan-wan"]'::jsonb, '["retail","warehouse","corporate","industrial","education"]'::jsonb, NULL, false, true, 'Video', 11),
('video-monitoring', 'video-monitoring', 'Video Monitoring & Remote Viewing', 'surveillance-monitoring', 'Eyes on your premises, even when you''re away', 'Remote monitoring, live viewing and event-based alerting across single or multiple sites.', 'Installing cameras is only half the value — the other half is watching and responding. We set up remote monitoring so you (or our team) can view live footage, receive event-based alerts, and review recordings from anywhere, across one or many sites.', '["Cameras installed but nobody watching them.","No alerts when something actually happens.","Can''t view footage when off-site.","Multiple sites with no unified view."]'::jsonb, 'We configure remote monitoring with live viewing, event-based alerts and a unified multi-site platform — accessible securely from anywhere.', '[{"title":"Remote viewing setup","description":"Secure mobile and web access to live and recorded footage."},{"title":"Event alerts","description":"Push/email alerts for motion, line-crossing and intrusion events."},{"title":"Multi-site platform","description":"Unified dashboard across all your locations."},{"title":"Monitoring integration","description":"Optional integration with access control and alarms."},{"title":"User management","description":"Role-based access for staff and security teams."}]'::jsonb, '["Real-time awareness across sites","Faster response to incidents","Reduced need for constant manual monitoring","Centralised oversight of security"]'::jsonb, '["VMS / mobile apps","Push & email alerting","Cloud / on-prem platforms","Role-based access"]'::jsonb, '["cctv-installation","ip-camera-systems","nvr-dvr-solutions","access-control-systems","burglar-alarm-systems"]'::jsonb, '["retail","warehouse","hospitality","corporate","construction"]'::jsonb, NULL, false, true, 'MonitorPlay', 12),
('nvr-dvr-solutions', 'nvr-dvr-solutions', 'NVR / DVR & Storage Solutions', 'surveillance-monitoring', 'Reliable recording that keeps your footage when it counts', 'Network and digital video recorders with RAID storage, retention planning and redundancy.', 'Footage is only valuable if it''s still there when you need it. We deploy NVR and DVR solutions with properly sized storage, RAID redundancy, retention planning and reliable recording schedules — so your footage survives hardware failures and is available when incidents are discovered days later.', '["Footage lost or overwritten before an incident is noticed.","Single-drive recorders with no redundancy.","Storage too small for the camera count and retention needed.","Unreliable recording that misses the moment."]'::jsonb, 'We size and deploy NVR/DVR storage with redundancy and retention planning matched to your cameras and needs.', '[{"title":"Storage sizing","description":"Capacity calculated from camera count, resolution, retention and activity."},{"title":"RAID & redundancy","description":"Disk redundancy so a failed drive doesn''t lose footage."},{"title":"Retention planning","description":"Recording schedules and retention aligned to requirements."},{"title":"Backup options","description":"Off-site or cloud backup for critical footage."},{"title":"Health monitoring","description":"Disk health monitoring and alerts under support plans."}]'::jsonb, '["Footage available when you need it — days later, not hours","Protection against drive failure","Right-sized storage, no overpaying or under-provisioning","Confident retention for compliance"]'::jsonb, '["NVR / DVR","RAID storage","Surveillance-grade disks","Cloud backup","Retention scheduling"]'::jsonb, '["cctv-installation","ip-camera-systems","video-monitoring","network-installation"]'::jsonb, '["retail","warehouse","finance","corporate","hospitality"]'::jsonb, NULL, false, true, 'HardDrive', 13),
('access-control-systems', 'access-control-systems', 'Access Control Systems', 'access-control', 'Decide who goes where, and when', 'Card, fob and app-based access control with audit trails, schedules and integration.', 'Keys get copied, lost and untracked. Access control systems let you decide exactly who can enter which door, when — with full audit trails, time schedules and instant revocation. We design and deploy access control that scales from a single door to a full building or campus.', '["Lost or copied keys compromising security.","No record of who entered and when.","Difficulty revoking access for former staff or tenants.","Different access needs for different roles and times."]'::jsonb, 'We deploy card/fob/app access control with role-based permissions, schedules and full audit trails — scalable across doors, buildings and sites.', '[{"title":"Access design","description":"Door-by-door permissions, roles and schedules."},{"title":"Reader & controller deployment","description":"Readers, controllers and locking hardware installed."},{"title":"Credential management","description":"Card/fob/app enrolment and easy revocation."},{"title":"Audit trails","description":"Full entry/exit logging and reporting."},{"title":"Integration","description":"Link with CCTV, alarms and time attendance where needed."}]'::jsonb, '["Control and visibility over who enters your premises","Instant revocation — no rekeying","Audit trail for investigations and compliance","Flexible, role-based access"]'::jsonb, '["Card/fob/mobile readers","Access controllers","Management software","Electric locks & strikes"]'::jsonb, '["biometric-systems","door-access-systems","intercom-systems","cctv-installation","burglar-alarm-systems"]'::jsonb, '["corporate","finance","government","healthcare","education","warehouse"]'::jsonb, NULL, true, true, 'KeyRound', 14),
('biometric-systems', 'biometric-systems', 'Biometric Systems', 'access-control', 'Identity you can''t lose or share', 'Fingerprint and facial recognition for access control and time attendance.', 'Cards and fobs can be shared or lost — biometrics can''t. We deploy fingerprint and facial-recognition systems for access control and time & attendance, giving you certainty about who is actually at the door, and accurate attendance records for payroll.', '["Shared or borrowed cards undermining access control.","Buddy-punching inflating attendance records.","Need for higher-assurance identity at sensitive doors.","Manual attendance processes prone to error."]'::jsonb, 'We deploy biometric readers for access control and time attendance — accurate, fast and hard to circumvent.', '[{"title":"Biometric reader deployment","description":"Fingerprint and/or facial recognition at chosen doors."},{"title":"Enrolment & management","description":"User enrolment and ongoing management."},{"title":"Time & attendance","description":"Attendance records exportable for payroll."},{"title":"Access integration","description":"Biometric integrated with your access control platform."},{"title":"Reporting","description":"Attendance and access reports on demand."}]'::jsonb, '["Higher-assurance identity verification","Eliminates card sharing and buddy-punching","Accurate attendance for payroll","Strong audit trail"]'::jsonb, '["Fingerprint readers","Facial recognition","Time & attendance software","ZKTeco platforms"]'::jsonb, '["access-control-systems","door-access-systems","intercom-systems","smart-building-solutions"]'::jsonb, '["corporate","finance","government","education","industrial"]'::jsonb, NULL, false, true, 'Fingerprint', 15),
('door-access-systems', 'door-access-systems', 'Door Access Systems', 'access-control', 'Secure, reliable door hardware that just works', 'Electric locks, strikes, magnetic locks and turnstiles — installed and integrated for reliable operation.', 'An access system is only as reliable as the door hardware behind it. We supply and install electric strikes, magnetic locks, automatic doors and turnstiles — integrated with your access control for smooth, secure entry that won''t fail when it matters.', '["Cheap locking hardware that fails or jams.","Doors that don''t reliably lock after entry.","Hardware not integrated with access control.","Bottlenecks at busy entrances."]'::jsonb, 'We install quality electric locking hardware — strikes, maglocks, automatic doors and turnstiles — integrated with your access platform.', '[{"title":"Hardware selection","description":"Right locking hardware for each door type and traffic."},{"title":"Installation","description":"Professional mounting, wiring and safety compliance."},{"title":"Access integration","description":"Hardware wired to controllers and fire-alarm safety release."},{"title":"Safety compliance","description":"Fail-safe operation and emergency egress compliance."},{"title":"Testing & handover","description":"Reliability testing under normal and emergency conditions."}]'::jsonb, '["Reliable, secure door operation","Safe, compliant emergency egress","Smooth flow at busy entrances","Hardware built to last"]'::jsonb, '["Electric strikes","Magnetic locks","Automatic doors","Turnstiles","Exit buttons & sensors"]'::jsonb, '["access-control-systems","biometric-systems","intercom-systems","fire-alarm-systems"]'::jsonb, '["corporate","government","healthcare","education","industrial"]'::jsonb, NULL, false, true, 'DoorOpen', 16),
('intercom-systems', 'intercom-systems', 'Intercom Systems', 'access-control', 'See, speak and grant access from anywhere', 'Audio/video intercoms for gates, receptions and multi-tenant buildings with remote unlock.', 'Intercoms are the bridge between security and convenience — see who''s at the gate, speak to them, and let them in. We deploy audio and video intercom systems for gates, receptions and multi-tenant buildings, with remote unlock and integration into access control.', '["No way to verify visitors before granting access.","Staff leaving desks to open gates and doors.","Multi-tenant buildings with messy access management.","Need to answer the gate from anywhere."]'::jsonb, 'We deploy video and audio intercoms with remote unlock, multi-tenant support and access-control integration.', '[{"title":"Intercom deployment","description":"Audio/video intercoms at gates, doors and receptions."},{"title":"Remote unlock","description":"Grant access from a desk handset, mobile app or video phone."},{"title":"Multi-tenant support","description":"Directory and per-unit calling for apartments and offices."},{"title":"Access integration","description":"Intercom integrated with access control and CCTV."},{"title":"Mobile answering","description":"Answer and unlock from anywhere via app."}]'::jsonb, '["Verify visitors before granting access","Convenience without compromising security","Smooth multi-tenant access","Answer the gate from anywhere"]'::jsonb, '["IP video intercoms","Mobile intercom apps","Multi-tenant directories","Remote unlock"]'::jsonb, '["access-control-systems","door-access-systems","cctv-installation","smart-building-solutions"]'::jsonb, '["residential","corporate","hospitality","education","government"]'::jsonb, NULL, false, true, 'PhoneCall', 17),
('burglar-alarm-systems', 'burglar-alarm-systems', 'Burglar Alarm Systems', 'alarm-fire-safety', 'Detect intruders early, before loss occurs', 'Intrusion alarm systems with sensors, sirens and remote alerts for homes and businesses.', 'A burglar alarm detects intrusion early and creates a loud, immediate response — often before loss occurs. We design alarm systems with door/window contacts, motion detectors, glass-break sensors and sirens, configured to alert you (or a monitoring contact) the moment an intrusion is detected.', '["Theft discovered only after the fact.","No alert when an intruder forces entry at night.","Alarms that go off with no one to respond.","Sensors that false-trigger constantly until ignored."]'::jsonb, 'We design alarm systems with the right sensors for your risk, tuned to minimise false alarms and configured to alert the right people fast.', '[{"title":"Sensor design","description":"Contacts, motion, glass-break and vibration sensors at risk points."},{"title":"Control panel","description":"Programmable panel with arm/disarm and zone management."},{"title":"Alerting","description":"Sirens plus phone/app alerts to you or a monitoring contact."},{"title":"Tuning","description":"Zone configuration to minimise false alarms."},{"title":"Integration","description":"Link with CCTV, access control and monitoring."}]'::jsonb, '["Early detection of forced entry","Immediate deterrent and response","Remote alerts wherever you are","Lower false-alarm fatigue"]'::jsonb, '["Motion & contact sensors","Glass-break sensors","Control panels","Sirens & strobes","GSM/IP alerting"]'::jsonb, '["cctv-installation","perimeter-intrusion","access-control-systems","fire-alarm-systems","video-monitoring"]'::jsonb, '["residential","retail","warehouse","corporate","industrial"]'::jsonb, NULL, false, true, 'Siren', 18),
('fire-alarm-systems', 'fire-alarm-systems', 'Fire Alarm Systems', 'alarm-fire-safety', 'Life-safety detection engineered to standards', 'Conventional and addressable fire alarm systems with detectors, call points and sounders.', 'Fire alarms are life-safety systems — they must detect early and alert everyone reliably. We design and install conventional and addressable fire alarm systems with smoke, heat and flame detectors, manual call points, sounders and strobes, engineered for compliance and rapid evacuation.', '["No early warning of fire, endangering lives.","Systems that don''t meet safety standards or insurance requirements.","Undersized sounders that can''t be heard across the site.","No integration with access control for evacuation."]'::jsonb, 'We design and install fire alarm systems — conventional or addressable — with proper detector coverage, audible/visual alerting and integration for safe evacuation.', '[{"title":"System design","description":"Detector coverage and zoning engineered to standards."},{"title":"Detector deployment","description":"Smoke, heat and flame detectors at the right locations."},{"title":"Call points & sounders","description":"Manual call points, sounders and strobes for full-site alerting."},{"title":"Panel & programming","description":"Control panel with zones, delays and evacuation logic."},{"title":"Integration","description":"Door release for evacuation and link to monitoring."}]'::jsonb, '["Early, reliable fire detection","Compliant, insurable life-safety system","Clear evacuation alerting","Integrated, safer response"]'::jsonb, '["Conventional & addressable panels","Smoke/heat/flame detectors","Sounders & strobes","Manual call points"]'::jsonb, '["fire-detection-safety","door-access-systems","burglar-alarm-systems","managed-services"]'::jsonb, '["hospitality","healthcare","education","corporate","industrial","warehouse"]'::jsonb, NULL, true, true, 'Bell', 19),
('fire-detection-safety', 'fire-detection-safety', 'Fire Detection & Safety Systems', 'alarm-fire-safety', 'Beyond alarms — full fire-safety engineering', 'Comprehensive fire detection, suppression support and safety systems for compliance and protection.', 'Fire safety is more than an alarm panel. We cover the wider fire-safety picture — detection design, suppression support interfaces, emergency lighting, signage and evacuation planning — so your premises are protected and compliant, not just alarmed.', '["Partial fire safety with gaps in detection or egress.","Emergency lighting that fails when power is lost.","No coordinated evacuation plan or signage.","Compliance gaps that surface during inspection."]'::jsonb, 'We engineer comprehensive fire detection and safety — detection, suppression interfaces, emergency lighting and evacuation support.', '[{"title":"Detection engineering","description":"Detector selection and coverage for your premises type."},{"title":"Suppression interfaces","description":"Integration with suppression and shutdown systems."},{"title":"Emergency lighting","description":"Lighting that guides evacuation during power loss."},{"title":"Signage & egress","description":"Evacuation signage and exit routing support."},{"title":"Compliance documentation","description":"System records for inspection and insurance."}]'::jsonb, '["Comprehensive, compliant fire safety","Safer evacuation under any condition","Reduced liability and insurability","Coordinated, documented protection"]'::jsonb, '["Detection systems","Suppression interfaces","Emergency lighting","Evacuation signage"]'::jsonb, '["fire-alarm-systems","door-access-systems","managed-services","server-data-centre"]'::jsonb, '["hospitality","healthcare","education","industrial","warehouse","corporate"]'::jsonb, NULL, false, true, 'Flame', 20),
('perimeter-intrusion', 'perimeter-intrusion', 'Perimeter Intrusion Detection', 'alarm-fire-safety', 'Catch intruders at the fence, not the door', 'Perimeter sensors, beam detectors and fence systems for early intrusion warning.', 'The earlier you detect an intruder, the more time you have to respond. Perimeter intrusion detection — beam sensors, fence detection and vibration sensors — catches intruders at the boundary, not inside your premises. We design perimeter systems integrated with CCTV and alarms for a layered defence.', '["Intruders detected only after they''re inside.","Large perimeters that can''t be watched constantly.","Need to trigger CCTV recording before entry.","Outdoor environments that defeat indoor sensors."]'::jsonb, 'We deploy outdoor perimeter detection — beams, fence and vibration sensors — integrated with CCTV and alarms for early warning.', '[{"title":"Perimeter assessment","description":"Boundary survey to choose the right detection technology."},{"title":"Sensor deployment","description":"Active/passive beams, fence or vibration sensors."},{"title":"CCTV integration","description":"Triggered recording and PTZ camera response."},{"title":"Alarm & alerts","description":"Sirens and remote alerts on detection."},{"title":"Environmental tuning","description":"Tuning to reduce false triggers from animals and weather."}]'::jsonb, '["Earlier detection at the boundary","Time to respond before entry","Triggered CCTV for evidence","Layered defence with alarms and surveillance"]'::jsonb, '["Active infrared beams","Fence & vibration sensors","Outdoor detectors","CCTV integration"]'::jsonb, '["cctv-installation","burglar-alarm-systems","video-monitoring","access-control-systems"]'::jsonb, '["industrial","warehouse","construction","residential","government"]'::jsonb, NULL, false, true, 'ShieldAlert', 21),
('server-data-centre', 'server-data-centre', 'Server & Data-Centre Solutions', 'it-infrastructure', 'Resilient compute, storage and racks', 'Server deployment, rack fit-out, storage and backup for reliable business compute.', 'Your business runs on servers and storage. We design and deploy server and small-data-centre solutions — physical and virtual servers, storage, rack fit-out, cooling, UPS and backup — engineered for resilience and recoverability, not just uptime on paper.', '["Servers sitting under a desk with no redundancy or backup.","No proper rack, cooling or power protection.","Data at risk from failed drives with no backup.","Recovery that would take days, not hours."]'::jsonb, 'We engineer server and data-centre solutions — compute, storage, racks, UPS and backup — built for resilience and fast recovery.', '[{"title":"Architecture & sizing","description":"Compute, storage and network sized to your workload."},{"title":"Rack & environment","description":"Racks, cooling, cable management and layout."},{"title":"Power & UPS","description":"UPS protection and power distribution."},{"title":"Virtualisation & storage","description":"Hypervisors, RAID storage and capacity planning."},{"title":"Backup & recovery","description":"Backup strategy with tested recovery."}]'::jsonb, '["Reliable business compute","Protected power and cooling","Data protected by backup and redundancy","Faster recovery from failure"]'::jsonb, '["Virtualisation (Hyper-V/Proxmox)","RAID/NAS storage","Racks & UPS","Veeam backup","APC power"]'::jsonb, '["computer-it-support","managed-services","network-security","firewall-endpoint-protection","network-installation"]'::jsonb, '["corporate","finance","healthcare","education","industrial"]'::jsonb, NULL, true, true, 'ServerCog', 22),
('computer-it-support', 'computer-it-support', 'Computer & IT Support', 'it-infrastructure', 'Responsive IT support that keeps people productive', 'Helpdesk, on-site and remote IT support for workstations, users and day-to-day operations.', 'When computers, printers or accounts stop working, productivity stops. We provide responsive IT support — remote helpdesk and on-site assistance — covering workstations, users, networking and day-to-day IT, so issues get resolved fast and staff stay productive.', '["IT issues that stall work for hours or days.","No responsive support when something breaks.","Recurring problems nobody gets to the root of.","Staff wasting time on IT issues instead of their jobs."]'::jsonb, 'We provide responsive remote and on-site IT support — fast helpdesk and root-cause resolution.', '[{"title":"Helpdesk support","description":"Remote support for user and system issues."},{"title":"On-site support","description":"Engineers on-site for hands-on issues."},{"title":"Workstation management","description":"Setup, updates and troubleshooting of computers."},{"title":"User & account support","description":"Account, email and access management."},{"title":"Root-cause resolution","description":"Fixing underlying issues, not just symptoms."}]'::jsonb, '["Faster resolution of IT issues","Less downtime, more productivity","Predictable IT support costs","One number to call for IT"]'::jsonb, '["Remote support tooling","Helpdesk ticketing","Workstation management","User provisioning"]'::jsonb, '["managed-services","server-data-centre","network-maintenance","systems-installation-maintenance"]'::jsonb, '["corporate","smb","education","healthcare","retail"]'::jsonb, NULL, false, true, 'MonitorCog', 23),
('systems-installation-maintenance', 'systems-installation-maintenance', 'Systems Installation & Maintenance', 'it-infrastructure', 'Deployed right, maintained properly', 'Professional installation and ongoing maintenance for IT and security systems.', 'Systems work best when they''re installed properly and maintained regularly. We handle the installation and ongoing maintenance of IT and security systems — making sure everything from servers to access control is deployed to standard and kept healthy over its lifetime.', '["Systems installed without proper configuration or testing.","No maintenance, so systems degrade and fail.","Multiple vendors with no overall ownership.","Equipment past warranty with no support path."]'::jsonb, 'We install and maintain your IT and security systems — proper deployment plus scheduled, preventive maintenance.', '[{"title":"Professional installation","description":"Systems deployed, configured and tested to standard."},{"title":"Preventive maintenance","description":"Scheduled servicing to keep systems healthy."},{"title":"Health monitoring","description":"Monitoring that catches issues early."},{"title":"Lifecycle management","description":"Warranty, refresh and replacement planning."},{"title":"Single ownership","description":"One partner accountable across systems."}]'::jsonb, '["Systems that work reliably for longer","Fewer surprise failures","Predictable maintenance costs","One accountable partner"]'::jsonb, '["Installation & commissioning","Preventive maintenance","Monitoring","Lifecycle planning"]'::jsonb, '["managed-services","computer-it-support","network-maintenance","server-data-centre"]'::jsonb, '["corporate","smb","education","healthcare","industrial"]'::jsonb, NULL, false, true, 'Cog', 24),
('smart-building-solutions', 'smart-building-solutions', 'Smart Building Solutions', 'it-infrastructure', 'Connected, intelligent buildings', 'Integrated building systems — security, automation, lighting and energy — working as one.', 'Modern buildings don''t need a dozen disconnected systems. We design smart-building solutions that integrate security, access, surveillance, lighting, climate and energy into one manageable platform — so your building is more secure, efficient and comfortable.', '["A dozen systems that don''t talk to each other.","Energy waste from unmanaged lighting and climate.","No automation for routine building functions.","Complexity that frustrates facility teams."]'::jsonb, 'We design integrated smart-building solutions — security, automation and energy under one platform.', '[{"title":"Integration design","description":"Architecture unifying security, automation and energy."},{"title":"Automation","description":"Schedules and rules for lighting, climate and access."},{"title":"Energy management","description":"Monitoring and control to reduce waste."},{"title":"Single platform","description":"One interface for building operations."},{"title":"Scalability","description":"Architecture that grows with the building."}]'::jsonb, '["Simpler, smarter building operations","Lower energy costs","Better security and comfort","One interface instead of many"]'::jsonb, '["Building automation","IoT integration","Lighting & climate control","Unified platforms"]'::jsonb, '["access-control-systems","intercom-systems","cctv-installation","wifi-installation","server-data-centre"]'::jsonb, '["corporate","hospitality","residential","government","healthcare"]'::jsonb, NULL, false, true, 'Building2', 25),
('managed-services', 'managed-services', 'Managed Services & Technical Support', 'it-infrastructure', 'Your IT and security, fully managed', 'Ongoing managed services — monitoring, maintenance, support and improvement — under one agreement.', 'The best systems are the ones that keep working because someone is looking after them. Our managed services put your IT and security under continuous care — monitoring, preventive maintenance, priority support and ongoing improvement — for a predictable monthly fee instead of unpredictable break-fix bills.', '["Unpredictable IT and security costs.","Systems that degrade because nobody maintains them.","Slow, reactive support.","No visibility into system health or risk."]'::jsonb, 'We manage your IT and security under one agreement — proactive monitoring, maintenance, support and improvement.', '[{"title":"Continuous monitoring","description":"24/7 monitoring of critical systems and security."},{"title":"Preventive maintenance","description":"Scheduled servicing across IT and security."},{"title":"Priority support","description":"Defined SLAs and direct access to engineers."},{"title":"Reporting & visibility","description":"Regular health and activity reporting."},{"title":"Continuous improvement","description":"Recommendations to strengthen and optimise over time."}]'::jsonb, '["Predictable costs and fewer surprises","Healthier systems that fail less","Faster, prioritised response","Strategic partner, not just a vendor"]'::jsonb, '["Monitoring platforms","RMM tooling","Ticketing & SLAs","Security management"]'::jsonb, '["computer-it-support","network-maintenance","network-security","systems-installation-maintenance"]'::jsonb, '["corporate","smb","finance","healthcare","education"]'::jsonb, NULL, true, true, 'LifeBuoy', 26);

-- SEED: INDUSTRIES (13)
INSERT INTO "Industry" ("id", "slug", "name", "tagline", "summary", "challenges", "solutions", "outcomes", "imageQuery", "iconName", "published", "sortOrder") VALUES
('residential', 'residential', 'Residential & Estates', 'Secure homes and residential estates', 'Smart, reliable security for homes and estates — CCTV, access control, alarms and networking that protect families without becoming complicated.', '["Perimeter and entry-point security for homes and estates","Reliable Wi-Fi coverage across the property","Fire and intrusion detection that alerts the family","Access control for gates, domestic staff and visitors"]'::jsonb, '["cctv-installation","access-control-systems","burglar-alarm-systems","intercom-systems","wifi-installation","fire-alarm-systems"]'::jsonb, '["Visible deterrent and evidence if incidents occur","Controlled access for family, staff and visitors","Reliable connectivity throughout the home","Early warning for intrusion and fire"]'::jsonb, 'modern smart home security camera and gate at dusk', 'Home', true, 1),
('corporate', 'corporate', 'Corporate Offices', 'Secure, connected, productive workplaces', 'Enterprise networking, cybersecurity, access control and surveillance engineered for productive, secure corporate environments.', '["Secure, segmented networks for staff, guests and devices","Access control with audit trails across floors","Cybersecurity defending company data and systems","Surveillance and monitoring across the premises"]'::jsonb, '["lan-wan","network-security","access-control-systems","cctv-installation","firewall-endpoint-protection","managed-services"]'::jsonb, '["Resilient, segmented corporate network","Controlled, audited access across the building","Defended data and endpoints","Monitored premises with reliable footage"]'::jsonb, 'modern corporate office building with security and networking', 'Building2', true, 2),
('education', 'education', 'Schools & Universities', 'Safe, connected campuses for learning', 'Campus-wide networking, surveillance, access control and cybersecurity that keep students, staff and data protected.', '["Campus-wide Wi-Fi and network coverage","Surveillance across large, busy campuses","Access control for labs, dorms and offices","Cybersecurity protecting student and staff data"]'::jsonb, '["wifi-installation","lan-wan","cctv-installation","access-control-systems","network-security","fire-alarm-systems"]'::jsonb, '["Reliable connectivity for students and staff","Safer, monitored campus environments","Controlled access to sensitive areas","Protected institutional data"]'::jsonb, 'university campus with security cameras and networking', 'GraduationCap', true, 3),
('healthcare', 'healthcare', 'Hospitals & Healthcare', 'Life-safety and data protection for healthcare', 'Fire safety, access control, surveillance and resilient IT for facilities where lives and sensitive data depend on reliability.', '["Fire detection and life-safety compliance","Access control for pharmacies, records and restricted areas","Surveillance for patient and staff safety","Resilient IT and data protection"]'::jsonb, '["fire-alarm-systems","access-control-systems","cctv-installation","server-data-centre","network-security","managed-services"]'::jsonb, '["Compliant, reliable life-safety systems","Controlled access to sensitive areas","Monitored premises for patient safety","Resilient, protected patient data"]'::jsonb, 'modern hospital corridor with safety and security systems', 'Stethoscope', true, 4),
('hospitality', 'hospitality', 'Hotels & Hospitality', 'Guest experience built on security', 'Surveillance, access control, fire safety and seamless Wi-Fi that protect guests and staff while elevating the guest experience.', '["Guest Wi-Fi that''s fast and isolated from operations","Access control for rooms, floors and back-of-house","Surveillance of public and service areas","Fire safety across guest floors and kitchens"]'::jsonb, '["wifi-installation","access-control-systems","cctv-installation","fire-alarm-systems","intercom-systems","network-security"]'::jsonb, '["Seamless, secure guest connectivity","Controlled access across the property","Safer guests and staff","Compliant fire and life safety"]'::jsonb, 'modern hotel lobby with discreet security and access systems', 'Hotel', true, 5),
('retail', 'retail', 'Retail Stores', 'Loss prevention and connected retail', 'CCTV, alarms, access control and networking that reduce shrinkage, protect staff and keep retail operations running.', '["Shrinkage and theft at point of sale and stockrooms","Alarm and intrusion detection out of hours","Multi-site surveillance and viewing","Reliable POS and inventory network"]'::jsonb, '["cctv-installation","burglar-alarm-systems","access-control-systems","lan-wan","video-monitoring","perimeter-intrusion"]'::jsonb, '["Reduced shrinkage and clearer evidence","Early intrusion detection and alerts","Multi-site oversight from one platform","Reliable retail network"]'::jsonb, 'retail store interior with discreet security cameras', 'ShoppingBag', true, 6),
('warehouse', 'warehouse', 'Warehouses & Logistics', 'Protect inventory and operations', 'Perimeter and surveillance systems, access control and resilient networking for warehouses and logistics facilities.', '["Large perimeters that are hard to monitor","Inventory theft and stock movement tracking","Access control for staff and vehicles","Resilient network across large facilities"]'::jsonb, '["perimeter-intrusion","cctv-installation","access-control-systems","structured-cabling","burglar-alarm-systems","fire-alarm-systems"]'::jsonb, '["Early perimeter detection","Clear surveillance of inventory areas","Controlled access for people and vehicles","Resilient operations network"]'::jsonb, 'large warehouse logistics facility with perimeter security cameras', 'Warehouse', true, 7),
('industrial', 'industrial', 'Manufacturing & Industrial', 'Secure and resilient industrial operations', 'Rugged networking, perimeter security, surveillance and fire safety engineered for demanding industrial environments.', '["Harsh environments that defeat standard equipment","Large perimeters and high-value assets","Fire and safety compliance for industrial sites","Networks spanning large industrial facilities"]'::jsonb, '["perimeter-intrusion","cctv-installation","fire-detection-safety","structured-cabling","access-control-systems","network-installation"]'::jsonb, '["Rugged, reliable security infrastructure","Protected perimeters and assets","Compliant fire and life safety","Resilient industrial networks"]'::jsonb, 'industrial manufacturing plant with perimeter security systems', 'Factory', true, 8),
('construction', 'construction', 'Construction Sites', 'Temporary security that works', 'Mobile surveillance, perimeter detection and alarms that secure construction sites and equipment during the build.', '["Theft of materials and equipment on site","Temporary perimeters that change as work progresses","No fixed infrastructure for power or network","Need for remote monitoring of live sites"]'::jsonb, '["cctv-installation","video-monitoring","perimeter-intrusion","burglar-alarm-systems","wifi-installation"]'::jsonb, '["Deterrent and evidence against theft","Flexible security that adapts to the site","Remote monitoring without fixed infrastructure","Lower losses during construction"]'::jsonb, 'construction site with mobile security cameras and barriers at night', 'HardHat', true, 9),
('government', 'government', 'Government & Public Sector', 'Secure and compliant public infrastructure', 'Security and IT infrastructure engineered for government and public institutions, with compliance and reliability at the core.', '["Strict compliance and audit requirements","Protection of sensitive public data","Controlled access to government facilities","Resilient, reliable public infrastructure"]'::jsonb, '["network-security","access-control-systems","cctv-installation","security-assessment","server-data-centre","fire-alarm-systems"]'::jsonb, '["Compliant, auditable security posture","Protected sensitive data","Controlled, monitored access","Resilient public-sector infrastructure"]'::jsonb, 'government building with security and access control systems', 'Landmark', true, 10),
('religious', 'religious', 'Religious Organizations', 'Safe, welcoming places of worship', 'Surveillance, access control, fire safety and AV networking that protect congregations and places of worship.', '["Surveillance of large gathering spaces","Access control for offices and valuable areas","Fire safety for crowded gatherings","AV and network for services and streaming"]'::jsonb, '["cctv-installation","access-control-systems","fire-alarm-systems","wifi-installation","intercom-systems","burglar-alarm-systems"]'::jsonb, '["Safer gatherings and premises","Controlled access to sensitive areas","Compliant fire safety","Connected services and outreach"]'::jsonb, 'large place of worship interior with discreet security systems', 'Church', true, 11),
('finance', 'finance', 'Financial Institutions', 'Security and compliance for finance', 'Cybersecurity, surveillance, access control and resilient IT for banks and financial institutions where trust and compliance are everything.', '["Stringent regulatory and compliance demands","Protection of financial data and systems","Surveillance and access control for branches and vaults","Resilient, always-on IT infrastructure"]'::jsonb, '["network-security","firewall-endpoint-protection","cctv-installation","access-control-systems","server-data-centre","security-assessment"]'::jsonb, '["Defensible, compliant security posture","Protected financial data","Controlled, surveilled facilities","Resilient, recoverable infrastructure"]'::jsonb, 'modern bank interior with security cameras and access control', 'PiggyBank', true, 12),
('smb', 'smb', 'Small & Medium Businesses', 'Enterprise-grade security, right-sized', 'Right-sized networking, security and IT support that give SMBs enterprise-grade protection without enterprise-grade complexity.', '["Limited in-house IT and security expertise","Need for protection without big budgets","Reliable IT support without a full team","Scalable systems that grow with the business"]'::jsonb, '["managed-services","computer-it-support","network-installation","cctv-installation","firewall-endpoint-protection","wifi-installation"]'::jsonb, '["Professional IT and security without an in-house team","Predictable, manageable costs","Reliable day-to-day operations","Systems that scale with growth"]'::jsonb, 'small business office with networking and security systems', 'Store', true, 13);

-- SEED: PROJECTS (9)
INSERT INTO "Project" ("id", "slug", "title", "category", "industry", "services", "location", "scope", "description", "highlights", "gallery", "technologies", "client", "completionDate", "imageQuery", "year", "featured", "published", "sortOrder") VALUES
('multi-site-retail-surveillance-alarm-rollout', 'multi-site-retail-surveillance-alarm-rollout', 'Multi-Site Retail Surveillance & Alarm Rollout', 'Surveillance & Alarms', 'retail', '["cctv-installation","burglar-alarm-systems","video-monitoring","lan-wan"]'::jsonb, 'Lagos & Ogun', '8 retail locations · unified monitoring', 'A regional retail chain needed consistent surveillance and intrusion detection across eight branches, viewable from a central location. We standardised CCTV and alarm systems across all sites and unified them on a single monitoring platform, reducing after-hours losses and giving management real-time visibility.', '["Standardised CCTV and alarms across 8 branches","Centralised multi-site monitoring platform","Out-of-hours intrusion alerts to management","Reduced shrinkage and faster incident review"]'::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, NULL, 'retail store surveillance camera system installation', '2025', true, true, 1),
('corporate-office-network-cybersecurity-build', 'corporate-office-network-cybersecurity-build', 'Corporate Office Network & Cybersecurity Build', 'Network & Cybersecurity', 'corporate', '["structured-cabling","lan-wan","network-security","firewall-endpoint-protection","access-control-systems"]'::jsonb, 'Lagos (Victoria Island)', '6-floor HQ · 300+ users', 'A growing professional-services firm needed a secure, segmented network for a new headquarters. We engineered the cabling, switching, firewalling and access control for a six-floor office, with separate networks for staff, guests and building systems, plus endpoint protection across all workstations.', '["Structured cabling and managed switching across 6 floors","Segmented networks for staff, guests and building systems","Next-gen firewall and endpoint protection deployed","Access control with audit trail across the building"]'::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, NULL, 'modern corporate office server room and network racks', '2025', true, true, 2),
('hotel-fire-safety-guest-access-integration', 'hotel-fire-safety-guest-access-integration', 'Hotel Fire Safety & Guest Access Integration', 'Fire Safety & Access', 'hospitality', '["fire-alarm-systems","access-control-systems","intercom-systems","cctv-installation"]'::jsonb, 'Lekki, Lagos', 'Boutique hotel · 60 rooms', 'A boutique hotel required compliant fire detection and guest access control that didn''t compromise the guest experience. We installed an addressable fire alarm system integrated with door access for safe evacuation, plus discreet surveillance and video intercoms at the entrance.', '["Addressable fire alarm system with full coverage","Door access integrated with fire-alarm evacuation release","Discreet surveillance of public and service areas","Video intercom with remote gate unlock"]'::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, NULL, 'boutique hotel lobby fire safety and access control systems', '2025', true, true, 3),
('warehouse-perimeter-inventory-protection', 'warehouse-perimeter-inventory-protection', 'Warehouse Perimeter & Inventory Protection', 'Perimeter & Surveillance', 'warehouse', '["perimeter-intrusion","cctv-installation","access-control-systems","burglar-alarm-systems"]'::jsonb, 'Agbara, Ogun', 'Large logistics warehouse', 'A logistics operator was losing inventory to perimeter breaches. We deployed active infrared beam detection along the perimeter, integrated with CCTV that triggers recording on breach, plus access control for staff and vehicle entry and an intrusion alarm system.', '["Perimeter beam detection along the full boundary","CCTV triggered recording on perimeter breach","Access control for staff and vehicles","Integrated alarm and alerting"]'::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, NULL, 'warehouse perimeter security infrared beam cameras at night', '2025', false, true, 4),
('school-campus-wi-fi-surveillance', 'school-campus-wi-fi-surveillance', 'School Campus Wi-Fi & Surveillance', 'Networking & Surveillance', 'education', '["wifi-installation","cctv-installation","lan-wan","access-control-systems"]'::jsonb, 'Ibadan, Oyo', 'Campus · multiple buildings', 'A school needed campus-wide Wi-Fi for staff and students, plus surveillance to improve safety. We heat-mapped and deployed enterprise Wi-Fi across all buildings, installed CCTV at key areas, and added access control to labs and administrative offices.', '["Heat-mapped enterprise Wi-Fi across the campus","Segmented networks for staff, students and guests","CCTV coverage of key campus areas","Access control for labs and offices"]'::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, NULL, 'school campus wifi access points and security cameras', '2025', false, true, 5),
('hospital-server-room-resilient-it', 'hospital-server-room-resilient-it', 'Hospital Server Room & Resilient IT', 'IT Infrastructure', 'healthcare', '["server-data-centre","network-security","computer-it-support","fire-detection-safety"]'::jsonb, 'Surulere, Lagos', 'Hospital data centre', 'A hospital needed resilient IT infrastructure for patient systems and data. We built out the server room with proper racks, UPS, cooling and backup, hardened the network, and put the IT estate under managed support — protecting both uptime and patient data.', '["Server room fit-out with racks, UPS and cooling","Backup and recovery strategy with tested restore","Network hardening and segmentation","Ongoing managed IT support"]'::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, NULL, 'hospital server room with racks ups and cooling', '2025', false, true, 6),
('construction-site-mobile-surveillance', 'construction-site-mobile-surveillance', 'Construction Site Mobile Surveillance', 'Surveillance', 'construction', '["cctv-installation","video-monitoring","perimeter-intrusion","burglar-alarm-systems"]'::jsonb, 'Eko Atlantic, Lagos', 'Live construction site', 'A developer was losing materials to night-time theft on a live construction site. We deployed mobile surveillance with perimeter detection and remote monitoring — equipment that could move as the site progressed — deterring theft and providing evidence.', '["Mobile surveillance adaptable to site changes","Perimeter detection with remote alerts","No fixed infrastructure required","Reduced material losses"]'::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, NULL, 'construction site mobile surveillance cameras at night', '2025', false, true, 7),
('estate-access-control-smart-security', 'estate-access-control-smart-security', 'Estate Access Control & Smart Security', 'Access & Surveillance', 'residential', '["access-control-systems","cctv-installation","intercom-systems","burglar-alarm-systems","wifi-installation"]'::jsonb, 'Lekki Phase 1, Lagos', 'Gated residential estate', 'A gated estate wanted controlled access for residents, staff and visitors, plus surveillance at entry points and common areas. We deployed access control and video intercoms at the gates, CCTV across common areas, and reliable estate-wide Wi-Fi for management and residents.', '["Gate access control with video intercoms","Resident and visitor credential management","CCTV coverage of entry and common areas","Estate-wide Wi-Fi for management"]'::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, NULL, 'gated residential estate gate access control and cameras', '2025', false, true, 8),
('manufacturing-plant-fire-safety-network', 'manufacturing-plant-fire-safety-network', 'Manufacturing Plant Fire Safety & Network', 'Fire Safety & Network', 'industrial', '["fire-detection-safety","fire-alarm-systems","structured-cabling","cctv-installation"]'::jsonb, 'Ikeja, Lagos', 'Manufacturing facility', 'A manufacturing plant needed compliant fire safety and a reliable network across a large industrial facility. We engineered a comprehensive fire detection and safety system, structured cabling for the production floor, and surveillance of key operational areas.', '["Comprehensive fire detection and safety systems","Structured cabling across the production floor","Surveillance of operational and asset areas","Compliance-ready documentation"]'::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, NULL, 'manufacturing plant fire safety and network infrastructure', '2025', false, true, 9);

-- SEED: BLOG POSTS (6)
INSERT INTO "BlogPost" ("id", "slug", "title", "excerpt", "category", "readTime", "date", "author", "authorRole", "imageQuery", "featuredImage", "content", "tags", "featured", "status", "scheduledAt") VALUES
('how-to-choose-cctv-system-nigeria', 'how-to-choose-cctv-system-nigeria', 'How to Choose the Right CCTV System for Your Business in Nigeria', 'Resolution, coverage, storage and night capability matter far more than camera count. Here''s how to specify a CCTV system that actually protects your premises.', 'Surveillance', '7 min read', '2024-11-12', 'Agu Chisom Alvin', 'Founder & CEO, Allison Global', 'cctv security camera installation on building exterior', NULL, '[{"body":"Most businesses buy CCTV the same way: a few cameras, a recorder, and hope. Months later, when an incident happens, the footage is too grainy, the wrong areas are covered, or the recording wasn''t even running. The problem is rarely the cameras — it''s the design. Here''s how to specify a CCTV system that delivers usable footage when it matters."},{"heading":"Start with what you need to see","body":"Before discussing camera models, define your risk areas: entrances, exits, point-of-sale counters, stockrooms, loading bays, car parks and cash-handling points. A camera covering a low-risk corridor is wasted budget; a gap at your main entrance is a real vulnerability. Map your site and mark what actually needs watching."},{"heading":"Resolution and lensing matter more than camera count","body":"A single 4K camera with the right lens can outperform four cheap ones. Resolution determines detail, but lensing determines what fits in frame and how far you can identify faces or plates. For entrances and cash points, prioritise high resolution with a lens suited to the distance. For wide area overview, lower resolution is acceptable."},{"heading":"Don''t forget night capability","body":"Most incidents happen after dark. Cameras need either strong infrared (IR) illumination or true low-light (Starlight-class) sensors. For outdoor perimeters, consider cameras with adaptive IR and wide dynamic range to handle headlights and mixed lighting. A camera that goes blind at night is a camera that isn''t really protecting you."},{"heading":"Size storage to your retention needs","body":"Footage is only useful if it''s still there when you discover an incident — often days later. Size your NVR storage to your camera count, resolution, recording schedule and required retention. Add redundancy with RAID so a failed drive doesn''t lose everything. For critical footage, consider off-site or cloud backup of key events."},{"heading":"Make it viewable and integrated","body":"Modern CCTV should be viewable from anywhere and integrated with your other security. Motion and line-crossing alerts to your phone, recording triggered by an alarm or access event, and a unified view across multiple sites turn cameras from passive recording into active security."},{"body":"A well-designed CCTV system is an investment that pays for itself the first time it deters a loss or provides the evidence you need. Specify it for your real risks — not for a camera count — and you''ll get far more value for the same budget."}]'::jsonb, '["CCTV","Surveillance","Security"]'::jsonb, true, 'published', NULL),
('cybersecurity-basics-nigerian-smes', 'cybersecurity-basics-nigerian-smes', 'Cybersecurity Basics Every Nigerian SME Should Get Right First', 'Before you invest in advanced tools, get these fundamentals right. They prevent the majority of breaches targeting small and medium businesses.', 'Cybersecurity', '8 min read', '2024-10-28', 'Allison Global Team', 'Allison Global Insights', 'cybersecurity firewall network protection concept', NULL, '[{"body":"Small and medium businesses are now a primary target for cybercriminals — not because they''re valuable, but because they''re often undefended. The good news: the majority of attacks can be prevented with fundamentals, not expensive tools. Here''s what to get right first."},{"heading":"1. A real firewall, not a consumer router","body":"Your internet router is not a security device. A next-generation firewall with threat prevention, application control and web filtering blocks the majority of attacks at the edge. It''s the single highest-impact upgrade most SMEs can make."},{"heading":"2. Endpoint protection that detects behaviour, not just files","body":"Free antivirus matches against known signatures — useless against new threats. Modern endpoint detection and response (EDR) watches behaviour and can stop ransomware in motion, often rolling back changes. Deploy it on every workstation and server."},{"heading":"3. Segment your network","body":"A flat network means one infected device can reach everything. Separate staff, guest, surveillance and device networks with VLANs so a breach in one zone doesn''t spread to your servers or surveillance systems."},{"heading":"4. Backups that survive an attack","body":"Ransomware encrypts backups too if they''re connected. Follow the 3-2-1 rule: three copies of your data, on two different media, with one off-site and offline. Test restores — an untested backup is a hope, not a plan."},{"heading":"5. Multi-factor authentication everywhere","body":"Stolen passwords still drive most breaches. Multi-factor authentication on email, accounting and remote access stops the vast majority of credential-based attacks for very little cost."},{"heading":"6. Patching and updates","body":"Known vulnerabilities in unpatched software are an open door. Apply security updates promptly — to operating systems, firmware and applications. A managed-support plan takes this off your plate entirely."},{"body":"Get these six right and you''ve closed the door on the majority of attacks targeting SMEs. Advanced tools build on this foundation — they don''t replace it. If you''re not sure where you stand, a security assessment will tell you, in plain language, what to fix first."}]'::jsonb, '["Cybersecurity","Network Security","SME"]'::jsonb, true, 'published', NULL),
('structured-cabling-future-proofing', 'structured-cabling-future-proofing', 'Why Structured Cabling Is the Investment You''ll Thank Yourself For', 'The cabling behind your network, CCTV and access systems outlasts almost everything else you install. Here''s why it deserves real engineering — not shortcuts.', 'Networking', '6 min read', '2024-10-10', 'Agu Chisom Alvin', 'Founder & CEO, Allison Global', 'structured cabling network rack tidy patch panel', NULL, '[{"body":"Structured cabling is invisible — until something breaks. Buried in walls and racks, it''s easy to treat as an afterthought. But it''s the longest-lived part of your IT and security infrastructure, and the one most likely to be done badly. Here''s why it deserves real engineering."},{"heading":"Everything runs on the cable","body":"Your network, phones, CCTV, access control, Wi-Fi and IT systems all depend on the same cabling foundation. A poor cabling job causes intermittent faults that are maddening to diagnose — dropouts, slow speeds, cameras that flicker, doors that intermittently fail. Good cabling eliminates an entire class of problems."},{"heading":"Standards, testing and documentation","body":"Proper structured cabling follows TIA/EIA standards: correct cable categories, proper termination, cable management, and certification testing on every link. You receive test results and as-built documentation — so future changes are quick and safe, not guesswork."},{"heading":"Future-proofing is cheap insurance","body":"Installing higher-specification cable (Cat6A over Cat5e, fibre backbone for larger sites) costs marginally more during installation and dramatically less than re-pulling cable later. Plan for the bandwidth you''ll need in five years, not what you need today."},{"heading":"Tidy racks save money","body":"A well-dressed, labelled rack makes troubleshooting fast, expansion easy, and downtime shorter. A chaotic rack hides faults, slows every change, and costs you in engineer time every single time something needs attention."},{"body":"Cabling is the foundation everything else stands on. Engineer it properly once, and your network, surveillance and IT systems will perform reliably for decades — and you''ll never have to re-do it."}]'::jsonb, '["Networking","Cabling","Infrastructure"]'::jsonb, false, 'published', NULL),
('access-control-vs-traditional-keys', 'access-control-vs-traditional-keys', 'Access Control vs Traditional Keys: The Business Case', 'Keys get lost, copied and never returned. Access control gives you control, audit trails and instant revocation — often for less than you''d expect over time.', 'Access Control', '6 min read', '2024-09-22', 'Allison Global Team', 'Allison Global Insights', 'access control card reader door entry system', NULL, '[{"body":"Keys have served buildings for centuries, but for modern businesses they''re a liability. Lost, copied, unreturned keys compromise security silently, and rekeying an entire building is expensive. Access control solves these problems — and adds capabilities keys simply can''t offer."},{"heading":"Control who goes where, and when","body":"Access control lets you define exactly which doors each person can open, and when. The finance office only during business hours. The server room only for IT. The warehouse only for logistics staff. Try that with a keyring."},{"heading":"Audit trails change investigations","body":"When something goes wrong, access control tells you who was where, and when. That audit trail is invaluable for investigations, disputes and compliance — and impossible with traditional keys."},{"heading":"Instant revocation, no rekeying","body":"When staff leave, or a fob is lost, you revoke access in seconds — no locksmith, no new keys cut, no doors left vulnerable in the meantime. For businesses with staff turnover, this alone often justifies the investment."},{"heading":"It integrates with your other systems","body":"Modern access control integrates with CCTV (record when a door opens), alarms (trigger on forced entry), and time & attendance (one credential for entry and payroll). It becomes part of a unified security platform rather than a standalone product."},{"body":"Access control isn''t just about replacing keys — it''s about gaining control, visibility and integration that keys can never provide. For most businesses, the case is clear long before you count the cost of the next rekeying."}]'::jsonb, '["Access Control","Security"]'::jsonb, false, 'published', NULL),
('fire-safety-compliance-nigeria', 'fire-safety-compliance-nigeria', 'Fire Safety Compliance: What Nigerian Businesses Should Know', 'Fire safety isn''t just good practice — it''s a regulatory and insurance matter. Here''s what a compliant fire detection and safety setup looks like.', 'Fire Safety', '7 min read', '2024-09-05', 'Allison Global Team', 'Allison Global Insights', 'fire alarm smoke detector and sounder on ceiling', NULL, '[{"body":"Fire safety is a life-safety matter — but it''s also a regulatory and insurance one. Businesses that neglect it face not just the risk of fire, but failed inspections, invalid insurance and liability. Here''s what a compliant setup looks like."},{"heading":"Detection designed for the space","body":"Different spaces need different detection. Smoky, slow fires suit smoke detectors; rapid-flame environments suit flame detectors; kitchens and dusty areas need heat detection to avoid false alarms. Detection must be selected and placed for the actual environment."},{"heading":"Audible and visual alerting","body":"Everyone on the premises must be alerted — including those with hearing impairments. That means sounders loud enough across the whole site and visual strobes where needed. An alarm that can''t be heard in the back office isn''t compliant."},{"heading":"Addressable systems for larger sites","body":"For larger premises, addressable fire alarm systems identify exactly which detector triggered — saving critical seconds in evacuation and response. Conventional systems may suffice for smaller sites; the choice should be engineered, not guessed."},{"heading":"Integration for safe evacuation","body":"Fire alarms should integrate with access control to release doors for evacuation, and can interface with suppression and shutdown systems. This integration is what turns an alarm into a coordinated life-safety response."},{"heading":"Documentation and maintenance","body":"Compliance requires documented design, installation records and a maintenance schedule. A fire alarm that isn''t maintained can fail when it matters — and an unmaintained system may not satisfy insurers or inspectors."},{"body":"Fire safety is one area where cutting corners costs lives and money. Engineer it properly, document it, maintain it — and your premises, people and business are protected and defensible."}]'::jsonb, '["Fire Safety","Compliance"]'::jsonb, false, 'published', NULL),
('managed-services-vs-break-fix', 'managed-services-vs-break-fix', 'Managed IT Services vs Break-Fix: The Real Cost Comparison', 'Break-fix feels cheaper — until you count the downtime, the surprises and the lost productivity. Here''s why predictable managed services usually win.', 'IT Support', '6 min read', '2024-08-19', 'Allison Global Team', 'Allison Global Insights', 'IT support engineer monitoring systems dashboard', NULL, '[{"body":"Many businesses still operate on a break-fix model: something breaks, you call someone, they fix it, you pay. It feels cheaper because there''s no monthly fee — but the real costs are hidden, and they''re usually higher."},{"heading":"Break-fix means downtime you pay for","body":"Every hour a system is down is lost productivity, missed customers and disrupted operations. Break-fix providers are paid to fix problems — there''s no incentive to prevent them. The cost of downtime almost always exceeds the cost of prevention."},{"heading":"Managed services catch issues early","body":"With monitoring and preventive maintenance, managed services catch failures before they become outages. A drive showing early failure signs is replaced on schedule, not after it takes your server down on a busy Monday."},{"heading":"Predictable costs, predictable support","body":"Managed services give you a predictable monthly cost and defined response SLAs. Budgeting becomes possible, and when something does go wrong, you have priority access to engineers who already know your environment."},{"heading":"Security stays current","body":"Under break-fix, security patching happens only when someone notices — often after a breach. Managed services keep systems patched, monitored and hardened continuously, dramatically reducing your attack surface."},{"body":"For most businesses, the math is clear: managed services cost less than the downtime, surprises and risk of break-fix — and you gain a partner invested in keeping your systems healthy rather than profitable when they fail."}]'::jsonb, '["Managed Services","IT Support"]'::jsonb, false, 'published', NULL);

-- SEED: SOLUTIONS (6)
INSERT INTO "Solution" ("id", "slug", "name", "summary", "description", "components", "outcomes", "bestFor", "iconName", "published", "sortOrder") VALUES
('unified-security-surveillance', 'unified-security-surveillance', 'Unified Security & Surveillance', 'CCTV, access control, alarms and monitoring integrated into one security platform.', 'Most security issues come from systems that don''t talk to each other — a camera that doesn''t trigger recording when a door is forced, an alarm that doesn''t show you the scene. We integrate surveillance, access control, alarms and monitoring into one platform so your security works as a single, responsive system.', '["cctv-installation","access-control-systems","burglar-alarm-systems","video-monitoring","perimeter-intrusion"]'::jsonb, '["Incidents detected, recorded and alerted in one flow","Single platform instead of disconnected systems","Faster, better-coordinated response","Clearer evidence and audit trails"]'::jsonb, '["corporate","warehouse","industrial","retail","residential"]'::jsonb, 'ShieldCheck', true, 1),
('resilient-network-infrastructure', 'resilient-network-infrastructure', 'Resilient Network Infrastructure', 'Cabling, switching, routing and Wi-Fi engineered for performance, security and growth.', 'Everything runs on your network — phones, CCTV, access control, IT, guest Wi-Fi. We engineer a resilient network foundation with structured cabling, managed switching, segmentation and wireless — so everything that depends on it works reliably.', '["structured-cabling","lan-wan","wifi-installation","network-installation","network-maintenance"]'::jsonb, '["Reliable connectivity for every system and user","Clean segmentation of voice, data, surveillance and guests","Future-proofed headroom for growth","Documented, supportable infrastructure"]'::jsonb, '["corporate","education","healthcare","industrial","hospitality"]'::jsonb, 'Network', true, 2),
('cyber-defence-programme', 'cyber-defence-programme', 'Cyber Defence Programme', 'Layered cybersecurity — assessment, firewalls, endpoint protection and monitoring.', 'Cyber threats target the network, the endpoints and the people. We build a layered cyber-defence programme — assessment, next-gen firewalls, endpoint protection, intrusion detection and ongoing monitoring — so your business is defended in depth, not at the edge alone.', '["security-assessment","network-security","firewall-endpoint-protection","intrusion-detection","managed-services"]'::jsonb, '["Defensible, documented security posture","Blocked malware, ransomware and intrusion attempts","Visibility and alerting on threats","Stronger compliance position"]'::jsonb, '["finance","corporate","government","healthcare","smb"]'::jsonb, 'ShieldCheck', true, 3),
('life-safety-fire-protection', 'life-safety-fire-protection', 'Life Safety & Fire Protection', 'Fire detection, alarm and safety systems engineered for compliance and rapid evacuation.', 'Life-safety systems protect people first. We engineer comprehensive fire detection, alarm and safety solutions — detectors, call points, sounders, emergency lighting and integration — so your premises are protected and compliant.', '["fire-alarm-systems","fire-detection-safety","door-access-systems","managed-services"]'::jsonb, '["Early, reliable fire detection","Compliant, insurable life-safety systems","Safe, coordinated evacuation","Documented for inspection"]'::jsonb, '["hospitality","healthcare","education","industrial","warehouse"]'::jsonb, 'Flame', true, 4),
('smart-building-integration', 'smart-building-integration', 'Smart Building Integration', 'Security, automation, lighting and energy unified into one manageable platform.', 'Modern buildings shouldn''t run on a dozen disconnected systems. We integrate security, access, surveillance, lighting, climate and energy into one smart-building platform — simpler to operate, more efficient, and more secure.', '["smart-building-solutions","access-control-systems","intercom-systems","cctv-installation","wifi-installation"]'::jsonb, '["One interface for building operations","Lower energy costs through automation","Better security and comfort","Scalable architecture"]'::jsonb, '["corporate","hospitality","residential","government","healthcare"]'::jsonb, 'Building2', true, 5),
('managed-it-security', 'managed-it-security', 'Managed IT & Security', 'Your IT and security under continuous care — monitoring, maintenance and support.', 'The best systems keep working because someone is looking after them. We manage your IT and security under one agreement — proactive monitoring, preventive maintenance, priority support and ongoing improvement — for predictable costs and fewer surprises.', '["managed-services","computer-it-support","network-maintenance","network-security","systems-installation-maintenance"]'::jsonb, '["Predictable costs, fewer surprises","Healthier systems that fail less","Prioritised, faster response","A strategic partner, not just a vendor"]'::jsonb, '["corporate","smb","finance","healthcare","education"]'::jsonb, 'ServerCog', true, 6);

-- SEED: TESTIMONIALS (8)
INSERT INTO "Testimonial" ("id", "quote", "authorName", "authorRole", "sector", "rating", "projectType", "published", "sortOrder") VALUES
('t1', 'Allison Global treated our office network and security as one system, not separate purchases. The handover documentation alone was better than anything we''d had from previous vendors — we finally know what''s on our network and why.', '', 'Operations Manager', 'corporate', 5, 'Network & Cybersecurity Build', true, 1),
('t2', 'After we rolled out their CCTV and alarm package across our branches, after-hours losses dropped noticeably. Being able to view every store from one app changed how we manage security.', '', 'Retail Operations Lead', 'retail', 5, 'Multi-Site Surveillance & Alarms', true, 2),
('t3', 'The fire alarm and access control integration gave us real confidence for evacuation compliance. They didn''t just install — they explained, trained our team, and stayed for support.', '', 'Facilities Manager', 'hospitality', 5, 'Fire Safety & Access Integration', true, 3),
('t4', 'Our perimeter had been a problem for years. Their beam detection and triggered cameras finally gave us early warning instead of discovering break-ins the next morning.', '', 'Warehouse Supervisor', 'warehouse', 5, 'Perimeter & Inventory Protection', true, 4),
('t5', 'As a growing school, we needed campus Wi-Fi and surveillance done properly. They heat-mapped everything and the coverage is the best we''ve ever had. Professional from survey to handover.', '', 'School Administrator', 'education', 5, 'Campus Wi-Fi & Surveillance', true, 5),
('t6', 'Our server room was a mess before Allison Global rebuilt it. Proper racks, UPS, cooling and backup — and they''ve managed it since. Downtime basically stopped being a worry.', '', 'IT Lead', 'healthcare', 5, 'Server Room & Managed IT', true, 6),
('t7', 'What stood out was the honesty. They told us where we were overspending and where we genuinely needed more. That kind of counsel is rare with vendors.', '', 'Business Owner', 'smb', 5, 'Security Assessment & IT Support', true, 7),
('t8', 'Gate access control with video intercoms transformed how our estate handles visitors. Residents feel safer and management finally has proper records of who comes and goes.', '', 'Estate Facility Manager', 'residential', 5, 'Estate Access & Smart Security', true, 8);

-- SEED: FAQS (16)
INSERT INTO "Faq" ("id", "category", "question", "answer", "published", "sortOrder") VALUES
('f1', 'Services & Scope', 'What services does Allison Global offer?', 'We cover six core domains: Network & Connectivity, Cybersecurity, Surveillance & Monitoring, Access Control & Automation, Alarm & Fire Safety, and IT Infrastructure & Support. Each spans multiple specialist services — from structured cabling to managed IT — so your network, security and IT systems are handled by one engineering-led team.', true, 1),
('f2', 'Services & Scope', 'Do you work on both homes and businesses?', 'Yes. We serve homes and residential estates, offices, businesses, institutions and industries. The scale differs, but the engineering approach is the same — assess, design, install, integrate and support. Explore our Industries section for sector-specific guidance.', true, 2),
('f3', 'Services & Scope', 'Can you integrate CCTV, access control, alarms and networking?', 'Absolutely — integration is a core strength. Many security issues come from systems that don''t talk to each other. We design CCTV, access control, alarms and networking to work as one platform, so an event on one system triggers the right response across the others.', true, 3),
('f4', 'Services & Scope', 'Do you supply the equipment, or only install?', 'We do both. We assess, design, supply, install, integrate and maintain. Equipment is sourced through proper channels as genuine, warrantied product — we don''t silently substitute cheaper alternatives.', true, 4),
('f5', 'Process & Engagement', 'How does a project typically start?', 'It starts with a consultation and site assessment. A senior engineer visits your site, understands your needs and risks, and documents what''s actually required. You then receive a clear proposal with scope, equipment and pricing before any work begins.', true, 5),
('f6', 'Process & Engagement', 'Do you provide documentation after installation?', 'Yes — every project is handed over with as-built documentation, system diagrams, credentials, manuals and a maintenance schedule. We believe a system you can''t document or manage isn''t truly finished.', true, 6),
('f7', 'Process & Engagement', 'Can you work with equipment we already have?', 'In many cases, yes. During the assessment we review your existing infrastructure and advise what can be retained, upgraded or replaced. We won''t push a full rip-and-replace where integration is the smarter move.', true, 7),
('f8', 'Process & Engagement', 'How long does a typical installation take?', 'It depends on scope. A small CCTV or access control install can take a day or two; a full office network or multi-site rollout takes longer and is phased to minimise disruption. You''ll get a clear timeline in your proposal.', true, 8),
('f9', 'Support & Maintenance', 'Do you offer ongoing support and maintenance?', 'Yes — through our Managed Services & Technical Support plans. We provide preventive maintenance, monitoring, priority support and ongoing improvement under a predictable agreement, so your systems stay healthy long after installation.', true, 9),
('f10', 'Support & Maintenance', 'How quickly can you respond to support requests?', 'Managed-support clients have defined response-time SLAs, with a target priority response of under 4 hours for critical issues. For ad-hoc support, we respond as quickly as our engineering schedule allows and prioritise urgent security issues.', true, 10),
('f11', 'Support & Maintenance', 'Is there a warranty on your installations?', 'Installations are covered by a workmanship warranty so defects in our installation work are put right. Equipment itself carries the manufacturer''s warranty, which we help you manage and claim where needed.', true, 11),
('f12', 'Security & Data', 'How do you keep our network and data secure?', 'Security is built in, not bolted on. We design segmented networks, deploy next-gen firewalls and endpoint protection, follow least-privilege access, and document credentials securely. For clients under managed support, we apply ongoing patching and monitoring.', true, 12),
('f13', 'Security & Data', 'Can you help us with cybersecurity if we have no in-house team?', 'Yes — that''s exactly what our Cybersecurity services and Managed Services are designed for. We act as your security partner: assessing risk, deploying defences, and monitoring and maintaining them, so you don''t need an in-house security team to be protected.', true, 13),
('f14', 'Security & Data', 'Do you offer security assessments and audits?', 'Yes. Our Security Assessment & Consultation service evaluates your network, systems and physical security against real threats and produces a prioritised, jargon-free remediation roadmap — ideal if you''re unsure where your risks actually lie.', true, 14),
('f15', 'Location & Coverage', 'Where are you based, and which areas do you cover?', 'We''re headquartered in Lagos, Nigeria, and deliver projects nationwide with rapid-response support across major Nigerian cities. For sites outside our immediate area, we plan travel and logistics as part of the project.', true, 15),
('f16', 'Location & Coverage', 'Can you support multiple sites across different locations?', 'Yes. We frequently deploy unified surveillance, networking and security across multiple branches or sites, with centralised management and monitoring so you get one view and one accountable partner across locations.', true, 16);

-- SEED: COMPANY SETTINGS
INSERT INTO "CompanySettings" ("key", "value") VALUES
('company', '{"name":"Allison Global","legalName":"Allison Global Ltd","tagline":"Technology without limits.","descriptor":"ICT, Networking, Cybersecurity & Electronic Security Solutions","foundedYear":"2025","foundedLabel":"Established October 2025","rcNumber":"RC: 8939118","shortPitch":"A Nigerian technology and security solutions partner established in October 2025. We assess, design, supply, install, integrate and maintain the systems that keep your people, data and property secure — under one accountable team.","longPitch":"Allison Global Ltd is a technology and security solutions partner serving homes, offices, businesses, institutions and industries across Nigeria. We bring together ICT, networking, cybersecurity and electronic security under one engineering-led team — so your infrastructure, surveillance, access control and fire safety systems are designed to work as one, not as isolated products. From the first site assessment to long-term managed support, we own the outcome.","location":{"city":"Lagos","country":"Nigeria","coverage":"Headquartered in Lagos, delivering projects nationwide with rapid-response support across major Nigerian cities.","addressLine":"Lagos, Nigeria"},"contact":{"phone":"09152158801","phoneDisplay":"+234 915 215 8801","phoneIntl":"+2349152158801","email":"hello@allisonglobal.tech","salesEmail":"sales@allisonglobal.tech","supportEmail":"support@allisonglobal.tech","whatsapp":"2349152158801","hours":"Mon–Sat: 8:00am – 6:00pm · Emergency support 24/7"},"social":{"linkedin":"#","facebook":"#","instagram":"#","x":"#"},"founder":{"name":"Agu Chisom Alvin","title":"Founder & Chief Executive Officer","discipline":"Electrical & Electronics Engineer","bio":"Agu Chisom Alvin is an Electrical & Electronics Engineer who founded Allison Global Ltd in October 2025 to close a gap he kept seeing on site: organisations buying good equipment, then losing value because nobody engineered the whole system end-to-end. He leads Allison Global with a field-first, engineering-led approach — every project is treated as a system, not a shopping list, and every client gets a single accountable partner from assessment through to long-term support.","phone":"09152158801"}}'::jsonb),
('navigation', '{"main":[{"label":"Home","href":"home","type":"main","visible":true,"openInNewTab":false,"order":0},{"label":"About","href":"about","type":"main","visible":true,"openInNewTab":false,"order":1},{"label":"Services","href":"services","type":"main","visible":true,"openInNewTab":false,"order":2},{"label":"Solutions","href":"solutions","type":"main","visible":true,"openInNewTab":false,"order":3},{"label":"Industries","href":"industries","type":"main","visible":true,"openInNewTab":false,"order":4},{"label":"Projects","href":"projects","type":"main","visible":true,"openInNewTab":false,"order":5},{"label":"Insights","href":"blog","type":"main","visible":true,"openInNewTab":false,"order":6},{"label":"Contact","href":"contact","type":"main","visible":true,"openInNewTab":false,"order":7}],"utility":[{"label":"Our Process","href":"process","type":"utility","visible":true,"openInNewTab":false,"order":0},{"label":"Why Choose Us","href":"why-choose-us","type":"utility","visible":true,"openInNewTab":false,"order":1},{"label":"Maintenance & Support","href":"support","type":"utility","visible":true,"openInNewTab":false,"order":2},{"label":"Testimonials","href":"testimonials","type":"utility","visible":true,"openInNewTab":false,"order":3},{"label":"FAQs","href":"faqs","type":"utility","visible":true,"openInNewTab":false,"order":4},{"label":"Careers","href":"careers","type":"utility","visible":true,"openInNewTab":false,"order":5}],"legal":[{"label":"Privacy Policy","href":"privacy","type":"legal","visible":true,"openInNewTab":false,"order":0},{"label":"Terms & Conditions","href":"terms","type":"legal","visible":true,"openInNewTab":false,"order":1}]}'::jsonb),
('process', '[{"id":"consultation","step":1,"title":"Consultation & Site Assessment","summary":"We listen to your needs, walk your site and assess the real risks before recommending anything.","description":"Every engagement starts with understanding — your environment, your risks, your operations and your goals. A senior engineer visits your site, assesses the physical and technical landscape, and documents what you actually need. No generic packages, no upselling.","iconName":"ClipboardList","activities":["Requirements and goals discussion","Physical site walk-through and survey","Risk and coverage assessment","Existing infrastructure review","Budget and timeline alignment"],"deliverable":"Site assessment report with recommended scope and priorities"},{"id":"design","step":2,"title":"System Design & Engineering","summary":"We engineer a documented solution — equipment, layout, integration and configuration — before anything is installed.","description":"We translate the assessment into a proper design. Equipment selection, camera and sensor placement, network architecture, integration between systems, and a clear bill of materials — documented so you know exactly what you''re getting and why.","iconName":"PencilRuler","activities":["System architecture and topology","Equipment selection and justification","Placement and coverage design","Integration and segmentation plan","Bill of materials and proposal"],"deliverable":"Engineered design document with bill of materials and proposal"},{"id":"supply","step":3,"title":"Supply & Procurement","summary":"We source genuine, warrantied equipment from the brands we deploy — not grey-market alternatives.","description":"We procure the specified equipment through proper channels — genuine products with manufacturer warranty. We don''t substitute cheaper alternatives silently, and we handle logistics so you don''t chase vendors.","iconName":"Package","activities":["Genuine equipment procurement","Warranty and serial documentation","Logistics and delivery coordination","Quality check on receipt","Inventory against the design"],"deliverable":"Equipment delivered, verified and ready for installation"},{"id":"installation","step":4,"title":"Professional Installation","summary":"Certified, clean installation by field engineers who treat your site with respect.","description":"Our installation team deploys the system to standard — cabling, mounting, wiring and configuration done properly. We work to minimise disruption, keep the site tidy, and install for reliability, not just appearance.","iconName":"Wrench","activities":["Cabling, mounting and wiring","Equipment installation and configuration","Clean, labelled, documented work","Minimal-disruption scheduling","Quality control during install"],"deliverable":"Installed, configured system ready for commissioning"},{"id":"commissioning","step":5,"title":"Integration & Commissioning","summary":"We test every component and integration end-to-end so the system works as one — not just individually.","description":"Installation is not completion. We commission the system — testing each component, each integration and each scenario. Cameras focused, access rules verified, alarms triggered, networks load-tested. You sign off on a working system, not a promise.","iconName":"Plug","activities":["End-to-end component testing","Integration and scenario testing","Performance and coverage validation","Security hardening review","Client acceptance walkthrough"],"deliverable":"Commissioned, tested system with acceptance sign-off"},{"id":"handover","step":6,"title":"Training, Handover & Ongoing Support","summary":"We hand over documentation, train your team, and stay for the long term with maintenance and support.","description":"We hand over a fully documented system — as-built drawings, credentials, manuals and a maintenance schedule — and train your team to use it. Then we stay, with preventive maintenance, monitoring and priority support that keep your systems working for years.","iconName":"GraduationCap","activities":["As-built documentation handover","Credentials and access transfer","Team training and runbook","Maintenance schedule setup","Ongoing support and improvement"],"deliverable":"Documented, supported system with a long-term partnership"}]'::jsonb),
('jobs', '[{"id":"j1","title":"Network & Security Engineer","department":"Engineering","location":"Lagos, Nigeria (field-based)","type":"Full-time","summary":"Design, deploy and support network and cybersecurity infrastructure for our clients — from structured cabling and switching to firewalls and endpoint protection.","responsibilities":["Design and deploy LAN/WAN, Wi-Fi and network security solutions","Configure firewalls, switches, routers and endpoint protection","Conduct site assessments and produce technical documentation","Commission and integrate systems end-to-end","Provide field support and troubleshooting for clients"],"requirements":["Degree in Electrical/Electronics Engineering, Computer Engineering or related field","Hands-on experience with enterprise networking and security","Familiarity with VLANs, routing, VPNs and next-gen firewalls","Strong troubleshooting and documentation discipline"],"niceToHave":["Vendor certifications (Cisco, Fortinet, Ubiquiti)","Experience with surveillance and access control integration"],"published":true},{"id":"j2","title":"Surveillance & Access Control Technician","department":"Installation","location":"Lagos, Nigeria (field-based)","type":"Full-time","summary":"Install and commission CCTV, access control, intercom and alarm systems to standard across client sites, with clean, documented work.","responsibilities":["Install CCTV, access control, intercom and alarm systems","Mount and wire equipment cleanly and to standard","Configure and commission systems end-to-end","Test and validate coverage, recording and integration","Produce handover documentation"],"requirements":["Proven field experience installing CCTV and access control","Comfortable working at heights and across site types","Strong attention to cabling quality and finish","Customer-facing professionalism"],"niceToHave":["Experience with Hikvision, Dahua, ZKTeco platforms","Structured cabling and basic networking knowledge"],"published":true},{"id":"j3","title":"IT Support Specialist","department":"Managed Services","location":"Lagos, Nigeria","type":"Full-time","summary":"Provide responsive remote and on-site IT support to managed-service clients — resolving issues fast and getting to root causes, not just symptoms.","responsibilities":["Provide remote and on-site IT support to clients","Manage workstations, accounts and day-to-day IT operations","Monitor systems and respond to alerts","Document issues, resolutions and client environments","Escalate and coordinate complex issues"],"requirements":["Experience in IT helpdesk or support roles","Strong Windows and basic server/networking knowledge","Excellent communication and customer service","Methodical troubleshooting approach"],"niceToHave":["Familiarity with RMM and ticketing platforms","Experience supporting small businesses"],"published":true},{"id":"j4","title":"Sales & Solutions Consultant","department":"Business Development","location":"Lagos, Nigeria","type":"Full-time","summary":"Engage prospective clients, understand their needs, and connect them with the right Allison Global solutions — backed by our engineering team.","responsibilities":["Engage and qualify inbound and outbound prospects","Conduct needs analysis and propose solutions","Coordinate site assessments with engineering","Prepare proposals and close engagements","Build and maintain client relationships"],"requirements":["Proven B2B sales experience, preferably in IT or security","Strong consultative selling and relationship-building","Ability to understand technical solutions and translate for clients","Self-driven and target-oriented"],"niceToHave":["Existing network in Nigerian corporate or institutional sectors","Technical background or certifications"],"published":true}]'::jsonb),
('careers', '{"intro":"Allison Global is an engineering-led technology and security solutions partner. We''re building a team that takes ownership of outcomes — engineers, technicians and consultants who treat every client''s systems as their own. If you value clean work, honest counsel and long-term partnership, we''d like to hear from you.","perks":[{"title":"Engineering-led culture","description":"Work alongside an Electrical & Electronics Engineer and a team that values proper design over shortcuts.","icon":"Cpu"},{"title":"Real ownership","description":"Take ownership of projects end-to-end — from assessment to handover and beyond.","icon":"Target"},{"title":"Diverse engagements","description":"Work across networking, cybersecurity, surveillance, access control and IT — not a narrow specialty.","icon":"Layers"},{"title":"Continuous growth","description":"We invest in training and exposure to enterprise-grade technologies and real field experience.","icon":"TrendingUp"}]}'::jsonb),
('legal_privacy', '{"updated":"January 2026","intro":"Allison Global Ltd (“Allison Global”, “we”, “us”) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use and protect information when you interact with our website and services. This policy is provided as a template and should be reviewed to ensure it meets your specific legal obligations.","sections":[{"heading":"1. Information We Collect","body":["We collect information you provide directly — such as your name, phone number, email address, organisation and enquiry details when you complete a contact form, request a quote, or otherwise communicate with us.","We also collect limited technical information automatically when you visit our website, such as your IP address, browser type and pages visited, used to improve site performance and security."]},{"heading":"2. How We Use Your Information","body":["To respond to your enquiries, provide quotes, and deliver our services.","To communicate with you about projects, support and related services you have requested.","To improve our website, services and customer experience.","To comply with legal and regulatory obligations."]},{"heading":"3. Legal Basis for Processing","body":["We process your personal data on the basis of your consent, the performance of a contract or steps taken at your request, our legitimate interests in operating our business, and compliance with legal obligations."]},{"heading":"4. Sharing of Information","body":["We do not sell your personal data. We may share information with trusted service providers who support our operations (such as hosting or email), under appropriate confidentiality and data-protection terms, and where required by law."]},{"heading":"5. Data Security","body":["As a security and IT company, we apply strong technical and organisational measures to protect your data — including access controls, encryption where appropriate, and secure systems. No method of transmission or storage is completely secure, but we work to protect your information rigorously."]},{"heading":"6. Data Retention","body":["We retain personal data only for as long as necessary to fulfil the purposes for which it was collected, comply with legal obligations, and resolve disputes."]},{"heading":"7. Your Rights","body":["You may have rights regarding your personal data, including access, correction, deletion, and objection to processing. To exercise these rights, contact us using the details below."]},{"heading":"8. Cookies","body":["Our website may use cookies and similar technologies to operate and improve the site. You can control cookies through your browser settings. Disabling some cookies may affect site functionality."]},{"heading":"9. Changes to This Policy","body":["We may update this Privacy Policy from time to time. We will indicate the date of the latest revision. Continued use of our site after changes constitutes acceptance of the updated policy."]},{"heading":"10. Contact Us","body":["If you have questions about this Privacy Policy or your personal data, contact us at hello@allisonglobal.tech or +234 915 215 8801."]}]}'::jsonb),
('legal_terms', '{"updated":"January 2026","intro":"These Terms and Conditions govern your use of the Allison Global website and the engagement of our services. This document is provided as a template and should be reviewed to ensure it meets your specific legal requirements.","sections":[{"heading":"1. Acceptance of Terms","body":["By accessing our website or engaging our services, you agree to be bound by these Terms. If you do not agree, please do not use our website or services."]},{"heading":"2. Services","body":["Allison Global provides ICT, networking, cybersecurity, surveillance, access control, fire safety and IT infrastructure solutions. The specific scope, deliverables, timeline and pricing of any engagement are defined in a separate proposal or agreement, which takes precedence over these Terms where they conflict."]},{"heading":"3. Quotes and Pricing","body":["Quotes are valid for the period stated on the quote and are based on the scope and site conditions assessed at the time. Changes to scope, site conditions, or specifications may affect pricing and timeline."]},{"heading":"4. Equipment and Warranty","body":["Equipment supplied is covered by the manufacturer''s warranty, the terms of which we help manage but do not control. Our installation work is covered by a workmanship warranty for defects in our installation. Warranty does not cover damage from misuse, modification, environmental factors, or third-party work."]},{"heading":"5. Client Responsibilities","body":["Clients agree to provide reasonable site access, timely decisions, and accurate information. Delays or changes requested by the client may affect the project timeline and cost."]},{"heading":"6. Payment","body":["Payment terms are specified in the relevant proposal or invoice. Unless otherwise agreed, deposits may be required to commence work, with balance due on completion or per agreed milestones."]},{"heading":"7. Intellectual Property","body":["All content on this website — including text, graphics, logos and design — is the property of Allison Global and may not be reproduced without permission. As-built documentation provided to clients is for their operational use."]},{"heading":"8. Limitation of Liability","body":["To the maximum extent permitted by law, Allison Global''s liability is limited to the value of the specific services giving rise to the claim. We are not liable for indirect, incidental or consequential damages."]},{"heading":"9. Confidentiality","body":["We treat client information, site details and system configurations as confidential and use them only to deliver our services. We respect the sensitivity of security-related information."]},{"heading":"10. Force Majeure","body":["We are not liable for delays or failures caused by circumstances beyond our reasonable control, including natural events, supply disruptions, regulatory actions, or labour disputes."]},{"heading":"11. Governing Law","body":["These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of competent jurisdiction in Nigeria."]},{"heading":"12. Changes to Terms","body":["We may update these Terms from time to time. Continued use of our website or services after changes constitutes acceptance of the updated Terms."]},{"heading":"13. Contact","body":["For questions about these Terms, contact us at hello@allisonglobal.tech or +234 915 215 8801."]}]}'::jsonb),
('stats', '[{"value":"6","label":"Core service domains","sub":"under one team"},{"value":"24+","label":"Specialist services","sub":"across ICT & security"},{"value":"13","label":"Industries served","sub":"homes to institutions"},{"value":"< 4h","label":"Target response time","sub":"for priority support"}]'::jsonb),
('values', '[{"title":"Engineering First","description":"We design before we deploy. Every system is specified, documented and engineered to your site — not assembled from whatever is in stock.","icon":"Ruler"},{"title":"Single Accountability","description":"One partner owns your network, security, surveillance, access and fire systems. No finger-pointing between vendors when something matters.","icon":"Handshake"},{"title":"Security by Default","description":"Protection is built in — hardened networks, segmented systems, monitored alerts — not bolted on after installation.","icon":"ShieldCheck"},{"title":"Long-Term Partnership","description":"We stay after handover. Preventive maintenance, rapid response and continuous improvement keep your systems working for years.","icon":"HeartHandshake"},{"title":"Honest Counsel","description":"We tell you what your site actually needs — and what it doesn''t. Recommendations are driven by risk and value, not commission.","icon":"BadgeCheck"},{"title":"Local Presence, Global Standards","description":"Nigerian-based, on the ground, with engineering standards and technology choices aligned to international best practice.","icon":"Globe"}]'::jsonb),
('guarantees', '[{"title":"Documented Handover","description":"Every project is delivered with as-built documentation, system diagrams, credentials and a maintenance schedule.","icon":"FileCheck"},{"title":"Workmanship Warranty","description":"Installations are covered by a workmanship warranty so defects in our installation work are put right, not argued over.","icon":"ShieldCheck"},{"title":"Priority Support SLA","description":"Managed-support clients get defined response-time targets and a direct line to engineers who know your site.","icon":"Clock"},{"title":"Vendor-Neutral Advice","description":"We specify the right equipment for the job from the brands we genuinely deploy — not the one paying the highest margin.","icon":"Scale"}]'::jsonb),
('technologyPlatforms', '[{"name":"Hikvision","domain":"Surveillance"},{"name":"Dahua","domain":"Surveillance"},{"name":"Ubiquiti UniFi","domain":"Networking"},{"name":"Cisco","domain":"Networking"},{"name":"MikroTik","domain":"Networking"},{"name":"Fortinet FortiGate","domain":"Network Security"},{"name":"SonicWall","domain":"Network Security"},{"name":"ZKTeco","domain":"Access Control & Biometrics"},{"name":"Honeywell","domain":"Fire & Intrusion"},{"name":"Bosch","domain":"Security & Audio"},{"name":"APC by Schneider","domain":"Power & Data Centre"},{"name":"Microsoft","domain":"IT Infrastructure"},{"name":"Veeam","domain":"Backup & Recovery"},{"name":"Bitdefender","domain":"Endpoint Security"}]'::jsonb),
('differentiators', '[{"title":"One partner, full stack","description":"Networking, cybersecurity, CCTV, access control, alarms, fire safety and IT infrastructure — engineered together by one accountable team instead of five disconnected vendors.","icon":"Layers"},{"title":"Engineering-led, field-tested","description":"Led by an Electrical & Electronics Engineer, our work is grounded in proper design, load calculations, cable specs and signal integrity — not guesswork.","icon":"Cpu"},{"title":"Designed for your site","description":"We assess your environment, risk profile and growth plans, then design systems that fit — not generic packages pushed onto every client.","icon":"Map"},{"title":"Integrated, not isolated","description":"CCTV that talks to access control, networks that carry surveillance cleanly, alarms that escalate to your phone. Systems that work as one.","icon":"Network"},{"title":"Rapid local response","description":"Based in Nigeria with field engineers who can get to your site fast — critical when a camera, firewall or door access system goes down.","icon":"Zap"},{"title":"Lifecycle support","description":"Preventive maintenance, monitoring and managed services that keep systems healthy long after the installers have left.","icon":"LifeBuoy"},{"title":"Honest specification","description":"We specify equipment that fits the risk and the budget — and we''ll tell you when a cheaper option is enough, or when it isn''t.","icon":"Scale"},{"title":"Documented & transferable","description":"As-built drawings, credentials, manuals and maintenance schedules, so your systems are manageable — by us or anyone who follows.","icon":"FileCheck"}]'::jsonb);

-- ═══════════════════════════════════════════════════════════
--  LOGIN INSTRUCTIONS
-- ═══════════════════════════════════════════════════════════
--  After running this script, log in to the admin panel at:
--
--    https://<your-domain>/admin/login
--
--  With:
--    Email:    admin@allisonglobal.tech
--    Password: Admin@2025
--
--  IMPORTANT: Change the password immediately after first login.
--
--  Tables created (15):
--    AdminUser, AuditLog, Lead, Category, Service, Project,
--    BlogPost, Industry, Testimonial, Faq, Solution,
--    CompanySettings, PageContent, Redirect, Media
--
--  Content seeded:
--    1 AdminUser (superadmin)
--    6 Categories (with slug as id)
--    26 Services (with slug as id)
--    13 Industries (id = slug = old id, e.g. 'corporate', 'retail')
--    9 Projects (slug generated from title)
--    6 BlogPosts (status=published)
--    6 Solutions (slug generated from name)
--    8 Testimonials (published=true)
--    16 FAQs (published=true)
--    12 CompanySettings keys:
--      company, navigation, process, jobs, careers,
--      legal_privacy, legal_terms, stats, values, guarantees,
--      technologyPlatforms, differentiators
--    0 PageContent (empty — populate via admin)
--    0 Redirect (empty — populate via admin)
--    0 Media (empty — populate via admin)
-- ═══════════════════════════════════════════════════════════
