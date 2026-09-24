"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
  ShieldAlert,
  Loader2,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Building2,
  Phone,
  Share2,
  UserCircle2,
  PanelBottom,
  BarChart3,
} from "lucide-react";
import {
  PageHeader,
  useUnsavedChanges,
  API,
} from "@/components/admin/shared";
import { company as staticCompany, capabilityStats } from "@/lib/data/company";

// ─────────────────────────── Types ───────────────────────────

type CompanyTab = {
  name: string;
  legalName: string;
  tagline: string;
  shortPitch: string;
  longPitch: string;
  foundedYear: string;
  foundedLabel: string;
  rcNumber: string;
};
type ContactTab = {
  phone: string;
  phoneDisplay: string;
  phoneIntl: string;
  email: string;
  salesEmail: string;
  supportEmail: string;
  whatsapp: string;
  hours: string;
};
type SocialTab = {
  linkedin: string;
  facebook: string;
  instagram: string;
  x: string;
  youtube: string;
};
type FounderTab = {
  name: string;
  title: string;
  discipline: string;
  bio: string;
  phone: string;
};
type FooterTab = {
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonLabel: string;
  copyrightText: string;
};
type StatItem = { value: string; label: string; sub: string };
type StatsTab = StatItem[];

type TabKey =
  | "company"
  | "contact"
  | "social"
  | "founder"
  | "footer"
  | "stats";

// ─────────────────────────── Defaults from static seed ───────────────────────────

function defaultCompany(): CompanyTab {
  return {
    name: staticCompany.name,
    legalName: staticCompany.legalName,
    tagline: staticCompany.tagline,
    shortPitch: staticCompany.shortPitch,
    longPitch: staticCompany.longPitch,
    foundedYear: staticCompany.foundedYear,
    foundedLabel: staticCompany.foundedLabel,
    rcNumber: staticCompany.rcNumber,
  };
}
function defaultContact(): ContactTab {
  return {
    phone: staticCompany.contact.phone,
    phoneDisplay: staticCompany.contact.phoneDisplay,
    phoneIntl: staticCompany.contact.phoneIntl,
    email: staticCompany.contact.email,
    salesEmail: staticCompany.contact.salesEmail,
    supportEmail: staticCompany.contact.supportEmail,
    whatsapp: staticCompany.contact.whatsapp,
    hours: staticCompany.contact.hours,
  };
}
function defaultSocial(): SocialTab {
  return {
    linkedin: staticCompany.social.linkedin,
    facebook: staticCompany.social.facebook,
    instagram: staticCompany.social.instagram,
    x: staticCompany.social.x,
    youtube: "",
  };
}
function defaultFounder(): FounderTab {
  return {
    name: staticCompany.founder.name,
    title: staticCompany.founder.title,
    discipline: staticCompany.founder.discipline,
    bio: staticCompany.founder.bio,
    phone: staticCompany.founder.phone,
  };
}
function defaultFooter(): FooterTab {
  return {
    ctaTitle: "Let's secure what matters",
    ctaDescription:
      "Choose the path that fits — or just reach out. One conversation with our engineering team is usually all it takes to get clarity on your next step.",
    ctaButtonLabel: "Talk to us",
    copyrightText: `© ${new Date().getFullYear()} ${staticCompany.legalName}. All rights reserved.`,
  };
}
function defaultStats(): StatsTab {
  return capabilityStats.map((s) => ({
    value: s.value,
    label: s.label,
    sub: s.sub ?? "",
  }));
}

// ─────────────────────────── Field components ───────────────────────────

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface SaveBarProps {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}

function SaveBar({ dirty, saving, onSave, onReset }: SaveBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <Button
        type="button"
        onClick={onSave}
        disabled={saving || !dirty}
        className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
      >
        {saving ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <Save className="size-4" />
            Save changes
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={saving || !dirty}
        className="min-h-10"
      >
        Discard
      </Button>
      {dirty && (
        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
          ● Unsaved changes
        </span>
      )}
    </div>
  );
}

// ─────────────────────────── Main page ───────────────────────────

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isSuperadmin = role === "superadmin";

  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabKey>("company");

  // Per-tab state
  const [company, setCompany] = React.useState<CompanyTab>(defaultCompany);
  const [contact, setContact] = React.useState<ContactTab>(defaultContact);
  const [social, setSocial] = React.useState<SocialTab>(defaultSocial);
  const [founder, setFounder] = React.useState<FounderTab>(defaultFounder);
  const [footer, setFooter] = React.useState<FooterTab>(defaultFooter);
  const [stats, setStats] = React.useState<StatsTab>(defaultStats);

  // Original snapshots (for dirty tracking)
  const [companySnap, setCompanySnap] = React.useState<string>("");
  const [contactSnap, setContactSnap] = React.useState<string>("");
  const [socialSnap, setSocialSnap] = React.useState<string>("");
  const [founderSnap, setFounderSnap] = React.useState<string>("");
  const [footerSnap, setFooterSnap] = React.useState<string>("");
  const [statsSnap, setStatsSnap] = React.useState<string>("");

  const [savingTab, setSavingTab] = React.useState<TabKey | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API.settings, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        settings: Record<string, unknown>;
      };
      const s = json.settings ?? {};
      if (s.company && typeof s.company === "object") {
        const merged = { ...defaultCompany(), ...(s.company as Partial<CompanyTab>) };
        setCompany(merged);
        setCompanySnap(JSON.stringify(merged));
      } else {
        const d = defaultCompany();
        setCompanySnap(JSON.stringify(d));
      }
      if (s.contact && typeof s.contact === "object") {
        const merged = { ...defaultContact(), ...(s.contact as Partial<ContactTab>) };
        setContact(merged);
        setContactSnap(JSON.stringify(merged));
      } else {
        const d = defaultContact();
        setContactSnap(JSON.stringify(d));
      }
      if (s.social && typeof s.social === "object") {
        const merged = { ...defaultSocial(), ...(s.social as Partial<SocialTab>) };
        setSocial(merged);
        setSocialSnap(JSON.stringify(merged));
      } else {
        const d = defaultSocial();
        setSocialSnap(JSON.stringify(d));
      }
      if (s.founder && typeof s.founder === "object") {
        const merged = { ...defaultFounder(), ...(s.founder as Partial<FounderTab>) };
        setFounder(merged);
        setFounderSnap(JSON.stringify(merged));
      } else {
        const d = defaultFounder();
        setFounderSnap(JSON.stringify(d));
      }
      if (s.footer && typeof s.footer === "object") {
        const merged = { ...defaultFooter(), ...(s.footer as Partial<FooterTab>) };
        setFooter(merged);
        setFooterSnap(JSON.stringify(merged));
      } else {
        const d = defaultFooter();
        setFooterSnap(JSON.stringify(d));
      }
      if (Array.isArray(s.stats)) {
        const loaded = s.stats as StatsTab;
        setStats(loaded);
        setStatsSnap(JSON.stringify(loaded));
      } else {
        const d = defaultStats();
        setStatsSnap(JSON.stringify(d));
      }
    } catch {
      // Fall back to static defaults; keep snapshots in sync.
      setCompanySnap(JSON.stringify(defaultCompany()));
      setContactSnap(JSON.stringify(defaultContact()));
      setSocialSnap(JSON.stringify(defaultSocial()));
      setFounderSnap(JSON.stringify(defaultFounder()));
      setFooterSnap(JSON.stringify(defaultFooter()));
      setStatsSnap(JSON.stringify(defaultStats()));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isSuperadmin) load();
    else if (status !== "loading") setLoading(false);
  }, [load, isSuperadmin, status]);

  // Dirty per tab
  const dirty = React.useMemo(() => {
    return {
      company: JSON.stringify(company) !== companySnap,
      contact: JSON.stringify(contact) !== contactSnap,
      social: JSON.stringify(social) !== socialSnap,
      founder: JSON.stringify(founder) !== founderSnap,
      footer: JSON.stringify(footer) !== footerSnap,
      stats: JSON.stringify(stats) !== statsSnap,
    };
  }, [company, contact, social, founder, footer, stats, companySnap, contactSnap, socialSnap, founderSnap, footerSnap, statsSnap]);

  const anyDirty = Object.values(dirty).some(Boolean);
  useUnsavedChanges(anyDirty);

  async function saveTab(key: TabKey, value: unknown) {
    setSavingTab(key);
    try {
      const res = await fetch(API.settings, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      // Update snapshot to mark clean
      const snap = JSON.stringify(value);
      switch (key) {
        case "company": setCompanySnap(snap); break;
        case "contact": setContactSnap(snap); break;
        case "social": setSocialSnap(snap); break;
        case "founder": setFounderSnap(snap); break;
        case "footer": setFooterSnap(snap); break;
        case "stats": setStatsSnap(snap); break;
      }
      toast.success(`${labelFor(key)} settings saved`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSavingTab(null);
    }
  }

  function updateStat(idx: number, patch: Partial<StatItem>) {
    setStats((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    );
  }

  // ── Forbidden state ──
  if (status !== "loading" && !isSuperadmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={SettingsIcon}
          title="Settings"
          description="Global site configuration (superadmin only)."
        />
        <Card className="border-amber-300/40 bg-amber-50 dark:bg-amber-500/5">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
              <ShieldAlert className="size-7" />
            </div>
            <div>
              <p className="font-display text-lg font-bold">
                You need superadmin access to manage settings
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Site-wide settings, navigation, CTAs, process steps, careers and
                legal documents are restricted to superadmin accounts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || status === "loading") {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={SettingsIcon}
          title="Settings"
          description="Global site configuration (superadmin only)."
        />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full max-w-2xl" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Global site configuration (superadmin only). Changes propagate to the live site."
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
        <TabsList className="flex h-auto w-full max-w-fit flex-wrap gap-1">
          <TabsTrigger value="company" className="min-h-9">
            <Building2 className="size-4" /> Company
          </TabsTrigger>
          <TabsTrigger value="contact" className="min-h-9">
            <Phone className="size-4" /> Contact
          </TabsTrigger>
          <TabsTrigger value="social" className="min-h-9">
            <Share2 className="size-4" /> Social
          </TabsTrigger>
          <TabsTrigger value="founder" className="min-h-9">
            <UserCircle2 className="size-4" /> Founder
          </TabsTrigger>
          <TabsTrigger value="footer" className="min-h-9">
            <PanelBottom className="size-4" /> Footer
          </TabsTrigger>
          <TabsTrigger value="stats" className="min-h-9">
            <BarChart3 className="size-4" /> Stats
          </TabsTrigger>
        </TabsList>

        {/* ── Company tab ── */}
        <TabsContent value="company" className="mt-4">
          <Card>
            <CardContent className="space-y-4 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Display name" htmlFor="c-name">
                  <Input id="c-name" className="h-10" value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                </Field>
                <Field label="Legal name" htmlFor="c-legal">
                  <Input id="c-legal" className="h-10" value={company.legalName}
                    onChange={(e) => setCompany({ ...company, legalName: e.target.value })} />
                </Field>
              </div>
              <Field label="Tagline" htmlFor="c-tag" hint="Short brand statement shown in the header.">
                <Input id="c-tag" className="h-10" value={company.tagline}
                  onChange={(e) => setCompany({ ...company, tagline: e.target.value })} />
              </Field>
              <Field label="Short pitch" htmlFor="c-short">
                <Textarea id="c-short" rows={3} value={company.shortPitch}
                  onChange={(e) => setCompany({ ...company, shortPitch: e.target.value })} />
              </Field>
              <Field label="Long pitch" htmlFor="c-long">
                <Textarea id="c-long" rows={5} value={company.longPitch}
                  onChange={(e) => setCompany({ ...company, longPitch: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Founded year" htmlFor="c-year">
                  <Input id="c-year" className="h-10" value={company.foundedYear}
                    onChange={(e) => setCompany({ ...company, foundedYear: e.target.value })} />
                </Field>
                <Field label="Founded label" htmlFor="c-label">
                  <Input id="c-label" className="h-10" value={company.foundedLabel}
                    onChange={(e) => setCompany({ ...company, foundedLabel: e.target.value })} />
                </Field>
                <Field label="RC number" htmlFor="c-rc">
                  <Input id="c-rc" className="h-10" value={company.rcNumber}
                    onChange={(e) => setCompany({ ...company, rcNumber: e.target.value })} />
                </Field>
              </div>
              <SaveBar
                dirty={dirty.company}
                saving={savingTab === "company"}
                onSave={() => saveTab("company", company)}
                onReset={() => setCompany(JSON.parse(companySnap))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Contact tab ── */}
        <TabsContent value="contact" className="mt-4">
          <Card>
            <CardContent className="space-y-4 py-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Phone (raw)" htmlFor="ct-phone">
                  <Input id="ct-phone" className="h-10" value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                </Field>
                <Field label="Phone (display)" htmlFor="ct-display">
                  <Input id="ct-display" className="h-10" value={contact.phoneDisplay}
                    onChange={(e) => setContact({ ...contact, phoneDisplay: e.target.value })} />
                </Field>
                <Field label="Phone (intl)" htmlFor="ct-intl">
                  <Input id="ct-intl" className="h-10" value={contact.phoneIntl}
                    onChange={(e) => setContact({ ...contact, phoneIntl: e.target.value })} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="General email" htmlFor="ct-email">
                  <Input id="ct-email" type="email" className="h-10" value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                </Field>
                <Field label="Sales email" htmlFor="ct-sales">
                  <Input id="ct-sales" type="email" className="h-10" value={contact.salesEmail}
                    onChange={(e) => setContact({ ...contact, salesEmail: e.target.value })} />
                </Field>
                <Field label="Support email" htmlFor="ct-support">
                  <Input id="ct-support" type="email" className="h-10" value={contact.supportEmail}
                    onChange={(e) => setContact({ ...contact, supportEmail: e.target.value })} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="WhatsApp" htmlFor="ct-wa" hint="Digits only, including country code (e.g. 2349152158801).">
                  <Input id="ct-wa" className="h-10" value={contact.whatsapp}
                    onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} />
                </Field>
                <Field label="Hours" htmlFor="ct-hours">
                  <Input id="ct-hours" className="h-10" value={contact.hours}
                    onChange={(e) => setContact({ ...contact, hours: e.target.value })} />
                </Field>
              </div>
              <SaveBar
                dirty={dirty.contact}
                saving={savingTab === "contact"}
                onSave={() => saveTab("contact", contact)}
                onReset={() => setContact(JSON.parse(contactSnap))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Social tab ── */}
        <TabsContent value="social" className="mt-4">
          <Card>
            <CardContent className="space-y-4 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="LinkedIn URL" htmlFor="s-li">
                  <Input id="s-li" className="h-10" value={social.linkedin}
                    onChange={(e) => setSocial({ ...social, linkedin: e.target.value })} />
                </Field>
                <Field label="Facebook URL" htmlFor="s-fb">
                  <Input id="s-fb" className="h-10" value={social.facebook}
                    onChange={(e) => setSocial({ ...social, facebook: e.target.value })} />
                </Field>
                <Field label="Instagram URL" htmlFor="s-ig">
                  <Input id="s-ig" className="h-10" value={social.instagram}
                    onChange={(e) => setSocial({ ...social, instagram: e.target.value })} />
                </Field>
                <Field label="X (Twitter) URL" htmlFor="s-x">
                  <Input id="s-x" className="h-10" value={social.x}
                    onChange={(e) => setSocial({ ...social, x: e.target.value })} />
                </Field>
                <Field label="YouTube URL" htmlFor="s-yt">
                  <Input id="s-yt" className="h-10" value={social.youtube}
                    onChange={(e) => setSocial({ ...social, youtube: e.target.value })} />
                </Field>
              </div>
              <SaveBar
                dirty={dirty.social}
                saving={savingTab === "social"}
                onSave={() => saveTab("social", social)}
                onReset={() => setSocial(JSON.parse(socialSnap))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Founder tab ── */}
        <TabsContent value="founder" className="mt-4">
          <Card>
            <CardContent className="space-y-4 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="f-name">
                  <Input id="f-name" className="h-10" value={founder.name}
                    onChange={(e) => setFounder({ ...founder, name: e.target.value })} />
                </Field>
                <Field label="Title" htmlFor="f-title">
                  <Input id="f-title" className="h-10" value={founder.title}
                    onChange={(e) => setFounder({ ...founder, title: e.target.value })} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Discipline" htmlFor="f-disc">
                  <Input id="f-disc" className="h-10" value={founder.discipline}
                    onChange={(e) => setFounder({ ...founder, discipline: e.target.value })} />
                </Field>
                <Field label="Phone" htmlFor="f-phone">
                  <Input id="f-phone" className="h-10" value={founder.phone}
                    onChange={(e) => setFounder({ ...founder, phone: e.target.value })} />
                </Field>
              </div>
              <Field label="Bio" htmlFor="f-bio">
                <Textarea id="f-bio" rows={6} value={founder.bio}
                  onChange={(e) => setFounder({ ...founder, bio: e.target.value })} />
              </Field>
              <SaveBar
                dirty={dirty.founder}
                saving={savingTab === "founder"}
                onSave={() => saveTab("founder", founder)}
                onReset={() => setFounder(JSON.parse(founderSnap))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Footer tab ── */}
        <TabsContent value="footer" className="mt-4">
          <Card>
            <CardContent className="space-y-4 py-6">
              <Field label="CTA title" htmlFor="fo-title">
                <Input id="fo-title" className="h-10" value={footer.ctaTitle}
                  onChange={(e) => setFooter({ ...footer, ctaTitle: e.target.value })} />
              </Field>
              <Field label="CTA description" htmlFor="fo-desc">
                <Textarea id="fo-desc" rows={3} value={footer.ctaDescription}
                  onChange={(e) => setFooter({ ...footer, ctaDescription: e.target.value })} />
              </Field>
              <Field label="CTA button label" htmlFor="fo-btn">
                <Input id="fo-btn" className="h-10" value={footer.ctaButtonLabel}
                  onChange={(e) => setFooter({ ...footer, ctaButtonLabel: e.target.value })} />
              </Field>
              <Field label="Copyright text" htmlFor="fo-cp">
                <Input id="fo-cp" className="h-10" value={footer.copyrightText}
                  onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })} />
              </Field>
              <SaveBar
                dirty={dirty.footer}
                saving={savingTab === "footer"}
                onSave={() => saveTab("footer", footer)}
                onReset={() => setFooter(JSON.parse(footerSnap))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Stats tab ── */}
        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardContent className="space-y-4 py-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Capability stats shown across the site. Reorder, edit or add new entries.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-10"
                  onClick={() =>
                    setStats((prev) => [
                      ...prev,
                      { value: "", label: "", sub: "" },
                    ])
                  }
                >
                  <Plus className="size-4" /> Add stat
                </Button>
              </div>

              <div className="space-y-3">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3 sm:grid-cols-[auto_1fr_1fr_1fr_auto]"
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        disabled={i === 0}
                        onClick={() =>
                          setStats((prev) => {
                            const next = [...prev];
                            [next[i - 1], next[i]] = [next[i], next[i - 1]];
                            return next;
                          })
                        }
                        title="Move up"
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        disabled={i === stats.length - 1}
                        onClick={() =>
                          setStats((prev) => {
                            const next = [...prev];
                            [next[i + 1], next[i]] = [next[i], next[i + 1]];
                            return next;
                          })
                        }
                        title="Move down"
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                    </div>
                    <Field label="Value">
                      <Input className="h-10" value={s.value}
                        onChange={(e) => updateStat(i, { value: e.target.value })} />
                    </Field>
                    <Field label="Label">
                      <Input className="h-10" value={s.label}
                        onChange={(e) => updateStat(i, { label: e.target.value })} />
                    </Field>
                    <Field label="Sub">
                      <Input className="h-10" value={s.sub}
                        onChange={(e) => updateStat(i, { sub: e.target.value })} />
                    </Field>
                    <div className="flex items-end pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-10 hover:text-destructive"
                        onClick={() =>
                          setStats((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        title="Remove stat"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {stats.length === 0 && (
                  <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                    No stats. Click “Add stat” to create one.
                  </p>
                )}
              </div>

              <SaveBar
                dirty={dirty.stats}
                saving={savingTab === "stats"}
                onSave={() => saveTab("stats", stats)}
                onReset={() => setStats(JSON.parse(statsSnap))}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function labelFor(key: TabKey): string {
  switch (key) {
    case "company": return "Company";
    case "contact": return "Contact";
    case "social": return "Social";
    case "founder": return "Founder";
    case "footer": return "Footer";
    case "stats": return "Stats";
  }
}
