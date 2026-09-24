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
  FileText,
  ShieldAlert,
  Loader2,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ScrollText,
  Scale,
} from "lucide-react";
import {
  PageHeader,
  useUnsavedChanges,
  API,
} from "@/components/admin/shared";
import {
  privacyPolicy as staticPrivacy,
  termsAndConditions as staticTerms,
} from "@/lib/data/legal";

// ─────────────────────────── Types ───────────────────────────

type LegalType = "privacy" | "terms";

interface LegalSection {
  heading: string;
  body: string[];
}

interface LegalDoc {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}

interface LegalState {
  doc: LegalDoc;
  snapshot: string; // JSON snapshot for dirty tracking
  loading: boolean;
  saving: boolean;
}

// ─────────────────────────── Default docs ───────────────────────────

function defaultPrivacy(): LegalDoc {
  return {
    title: "Privacy Policy",
    intro: staticPrivacy.intro,
    updated: staticPrivacy.updated,
    sections: staticPrivacy.sections.map((s) => ({
      heading: s.heading,
      body: [...s.body],
    })),
  };
}

function defaultTerms(): LegalDoc {
  return {
    title: "Terms & Conditions",
    intro: staticTerms.intro,
    updated: staticTerms.updated,
    sections: staticTerms.sections.map((s) => ({
      heading: s.heading,
      body: [...s.body],
    })),
  };
}

// ─────────────────────────── Section editor ───────────────────────────

function SectionEditor({
  section,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  section: LegalSection;
  index: number;
  total: number;
  onChange: (next: LegalSection) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Section {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            title="Move up"
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            title="Move down"
          >
            <ArrowDown className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 hover:text-destructive"
            onClick={onRemove}
            title="Remove section"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={`sec-h-${index}`} className="text-sm">
            Heading
          </Label>
          <Input
            id={`sec-h-${index}`}
            className="h-10"
            value={section.heading}
            onChange={(e) => onChange({ ...section, heading: e.target.value })}
            placeholder="1. Information We Collect"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`sec-b-${index}`} className="text-xs text-muted-foreground">
            Body{" "}
            <span className="font-normal">
              (one paragraph per line — press Enter to start a new paragraph)
            </span>
          </Label>
          <Textarea
            id={`sec-b-${index}`}
            rows={4}
            className="font-mono text-sm leading-relaxed"
            value={section.body.join("\n")}
            onChange={(e) =>
              onChange({
                ...section,
                body: e.target.value.split(/\r?\n/).map((s) => s),
              })
            }
            placeholder={"First paragraph of this section…\nSecond paragraph…"}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Document editor ───────────────────────────

function LegalDocEditor({
  state,
  onChange,
  onSave,
}: {
  state: LegalState;
  onChange: (doc: LegalDoc) => void;
  onSave: () => void;
}) {
  const { doc, snapshot, saving } = state;
  const dirty = React.useMemo(
    () => JSON.stringify(doc) !== snapshot,
    [doc, snapshot],
  );

  function updateSection(idx: number, next: LegalSection) {
    const sections = doc.sections.slice();
    sections[idx] = next;
    onChange({ ...doc, sections });
  }
  function moveSection(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= doc.sections.length) return;
    const sections = doc.sections.slice();
    [sections[idx], sections[target]] = [sections[target], sections[idx]];
    onChange({ ...doc, sections });
  }
  function removeSection(idx: number) {
    const sections = doc.sections.filter((_, i) => i !== idx);
    onChange({ ...doc, sections });
  }
  function addSection() {
    onChange({
      ...doc,
      sections: [...doc.sections, { heading: "", body: [""] }],
    });
  }
  function reset() {
    if (snapshot) onChange(JSON.parse(snapshot));
  }

  return (
    <Card>
      <CardContent className="space-y-4 py-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <div className="space-y-1.5">
            <Label htmlFor="doc-title">Document title</Label>
            <Input
              id="doc-title"
              className="h-10"
              value={doc.title}
              onChange={(e) => onChange({ ...doc, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-updated">Last updated</Label>
            <Input
              id="doc-updated"
              className="h-10"
              value={doc.updated}
              onChange={(e) => onChange({ ...doc, updated: e.target.value })}
              placeholder="January 2026"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-intro">Introduction</Label>
          <Textarea
            id="doc-intro"
            rows={3}
            value={doc.intro}
            onChange={(e) => onChange({ ...doc, intro: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm font-medium text-muted-foreground">
            {doc.sections.length} section{doc.sections.length === 1 ? "" : "s"}
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-10"
            onClick={addSection}
          >
            <Plus className="size-4" /> Add section
          </Button>
        </div>

        <div className="space-y-3">
          {doc.sections.map((s, i) => (
            <SectionEditor
              key={i}
              section={s}
              index={i}
              total={doc.sections.length}
              onChange={(next) => updateSection(i, next)}
              onMove={(dir) => moveSection(i, dir)}
              onRemove={() => removeSection(i)}
            />
          ))}
          {doc.sections.length === 0 && (
            <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No sections. Click “Add section” to start writing the document.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button
            type="button"
            onClick={onSave}
            disabled={saving || !dirty}
            className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="size-4" /> Save document
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={reset}
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
      </CardContent>
    </Card>
  );
}

// ─────────────────────────── Page ───────────────────────────

export default function AdminLegalPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isSuperadmin = role === "superadmin";

  const [activeTab, setActiveTab] = React.useState<LegalType>("privacy");

  const [privacy, setPrivacy] = React.useState<LegalState>({
    doc: defaultPrivacy(),
    snapshot: JSON.stringify(defaultPrivacy()),
    loading: true,
    saving: false,
  });
  const [terms, setTerms] = React.useState<LegalState>({
    doc: defaultTerms(),
    snapshot: JSON.stringify(defaultTerms()),
    loading: true,
    saving: false,
  });

  const loadDoc = React.useCallback(async (type: LegalType) => {
    try {
      const res = await fetch(API.legal(type), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { document: LegalDoc | null };
      if (json.document) {
        const snap = JSON.stringify(json.document);
        if (type === "privacy") {
          setPrivacy({ doc: json.document, snapshot: snap, loading: false, saving: false });
        } else {
          setTerms({ doc: json.document, snapshot: snap, loading: false, saving: false });
        }
      } else {
        // No DB record → use default
        const def = type === "privacy" ? defaultPrivacy() : defaultTerms();
        const snap = JSON.stringify(def);
        if (type === "privacy") {
          setPrivacy({ doc: def, snapshot: snap, loading: false, saving: false });
        } else {
          setTerms({ doc: def, snapshot: snap, loading: false, saving: false });
        }
      }
    } catch {
      const def = type === "privacy" ? defaultPrivacy() : defaultTerms();
      const snap = JSON.stringify(def);
      if (type === "privacy") {
        setPrivacy({ doc: def, snapshot: snap, loading: false, saving: false });
      } else {
        setTerms({ doc: def, snapshot: snap, loading: false, saving: false });
      }
    }
  }, []);

  React.useEffect(() => {
    if (isSuperadmin) {
      loadDoc("privacy");
      loadDoc("terms");
    } else if (status !== "loading") {
      setPrivacy((p) => ({ ...p, loading: false }));
      setTerms((t) => ({ ...t, loading: false }));
    }
  }, [loadDoc, isSuperadmin, status]);

  const anyDirty = React.useMemo(() => {
    const pDirty = JSON.stringify(privacy.doc) !== privacy.snapshot;
    const tDirty = JSON.stringify(terms.doc) !== terms.snapshot;
    return pDirty || tDirty;
  }, [privacy, terms]);
  useUnsavedChanges(anyDirty);

  async function saveDoc(type: LegalType) {
    const state = type === "privacy" ? privacy : terms;
    const setState = type === "privacy" ? setPrivacy : setTerms;
    setState((s) => ({ ...s, saving: true }));
    try {
      const res = await fetch(API.legal(type), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.doc),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      const snap = JSON.stringify(state.doc);
      setState((s) => ({ ...s, snapshot: snap, saving: false }));
      toast.success(
        `${type === "privacy" ? "Privacy Policy" : "Terms & Conditions"} saved`,
      );
    } catch (e) {
      setState((s) => ({ ...s, saving: false }));
      toast.error(e instanceof Error ? e.message : "Failed to save document");
    }
  }

  // ── Forbidden ──
  if (status !== "loading" && !isSuperadmin) {
    return (
      <div className="space-y-6">
        <PageHeader icon={FileText} title="Legal Documents" />
        <Card className="border-amber-300/40 bg-amber-50 dark:bg-amber-500/5">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
              <ShieldAlert className="size-7" />
            </div>
            <div>
              <p className="font-display text-lg font-bold">Superadmin access required</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Editing legal documents is restricted to superadmin accounts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "loading" || (privacy.loading && activeTab === "privacy") || (terms.loading && activeTab === "terms")) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={FileText}
          title="Legal Documents"
          description="Edit the site-wide Privacy Policy and Terms & Conditions."
        />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Legal Documents"
        description="Edit the site-wide Privacy Policy and Terms & Conditions. Each section's body supports one paragraph per line."
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LegalType)}>
        <TabsList className="flex h-auto w-full max-w-fit flex-wrap gap-1">
          <TabsTrigger value="privacy" className="min-h-9">
            <ScrollText className="size-4" /> Privacy Policy
          </TabsTrigger>
          <TabsTrigger value="terms" className="min-h-9">
            <Scale className="size-4" /> Terms &amp; Conditions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="privacy" className="mt-4">
          <LegalDocEditor
            state={privacy}
            onChange={(doc) => setPrivacy((s) => ({ ...s, doc }))}
            onSave={() => saveDoc("privacy")}
          />
        </TabsContent>

        <TabsContent value="terms" className="mt-4">
          <LegalDocEditor
            state={terms}
            onChange={(doc) => setTerms((s) => ({ ...s, doc }))}
            onSave={() => saveDoc("terms")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
