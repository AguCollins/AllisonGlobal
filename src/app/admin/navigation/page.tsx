"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Menu as MenuIcon,
  ShieldAlert,
  Loader2,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  PageHeader,
  EmptyState,
  TableSkeleton,
  useUnsavedChanges,
  API,
} from "@/components/admin/shared";

// ─────────────────────────── Types ───────────────────────────

type NavType = "link" | "dropdown" | "cta";
type Group = "main" | "utility" | "legal";

interface NavItem {
  id: string;
  label: string;
  href: string;
  type: NavType;
  visible: boolean;
  openInNewTab: boolean;
  order: number;
}

interface NavStructure {
  main: NavItem[];
  utility: NavItem[];
  legal: NavItem[];
}

// ─────────────────────────── Helpers ───────────────────────────

function newId(): string {
  return `nav-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function emptyItem(order: number): NavItem {
  return {
    id: newId(),
    label: "",
    href: "",
    type: "link",
    visible: true,
    openInNewTab: false,
    order,
  };
}

const EMPTY_STRUCTURE: NavStructure = { main: [], utility: [], legal: [] };

const GROUP_LABELS: Record<Group, string> = {
  main: "Main navigation",
  utility: "Utility / More menu",
  legal: "Legal links (footer)",
};

const GROUP_DESCRIPTIONS: Record<Group, string> = {
  main: "Primary navigation bar — visible on all desktop and mobile menus.",
  utility: "Secondary items shown in the mobile 'More' section and footer.",
  legal: "Legal links shown in the footer only.",
};

// ─────────────────────────── Component ───────────────────────────

export default function NavigationPage() {
  const { data: session } = useSession();
  const isSuperadmin = (session?.user as { role?: string } | undefined)?.role === "superadmin";

  const [structure, setStructure] = React.useState<NavStructure>(EMPTY_STRUCTURE);
  const [original, setOriginal] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeGroup, setActiveGroup] = React.useState<Group>("main");

  // Load from API
  const loadNav = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API.navigation);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Partial<NavStructure>;
      const loaded: NavStructure = {
        main: Array.isArray(data.main) ? data.main : [],
        utility: Array.isArray(data.utility) ? data.utility : [],
        legal: Array.isArray(data.legal) ? data.legal : [],
      };
      setStructure(loaded);
      setOriginal(JSON.stringify(loaded));
    } catch {
      toast.error("Failed to load navigation");
      setStructure(EMPTY_STRUCTURE);
      setOriginal(JSON.stringify(EMPTY_STRUCTURE));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadNav();
  }, [loadNav]);

  const dirty = JSON.stringify(structure) !== original;
  useUnsavedChanges(dirty);

  // ── Item operations ──
  function updateItem(group: Group, id: string, patch: Partial<NavItem>) {
    setStructure((s) => ({
      ...s,
      [group]: s[group].map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addItem(group: Group) {
    const order = structure[group].length;
    setStructure((s) => ({
      ...s,
      [group]: [...s[group], emptyItem(order)],
    }));
  }

  function deleteItem(group: Group, id: string) {
    setStructure((s) => ({
      ...s,
      [group]: s[group].filter((item) => item.id !== id),
    }));
  }

  function moveItem(group: Group, id: string, direction: "up" | "down") {
    setStructure((s) => {
      const items = [...s[group]];
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return s;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= items.length) return s;
      [items[idx], items[swapIdx]] = [items[swapIdx], items[idx]];
      // Reassign order
      items.forEach((item, i) => (item.order = i));
      return { ...s, [group]: items };
    });
  }

  // ── Save ──
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(API.navigation, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(structure),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setOriginal(JSON.stringify(structure));
      toast.success("Navigation saved — changes are now live on the public site");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // ── Access control ──
  if (session && !isSuperadmin) {
    return (
      <div className="p-6">
        <Card className="mx-auto max-w-md border-amber-200 bg-amber-50 dark:bg-amber-500/10">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <ShieldAlert className="size-10 text-amber-600" />
            <h2 className="text-lg font-semibold">Superadmin access required</h2>
            <p className="text-sm text-muted-foreground">
              Navigation management is restricted to superadmin accounts.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        icon={MenuIcon}
        title="Navigation"
        description="Manage the header menu, utility links, and footer legal links. Changes appear on the public site immediately after saving."
        action={
          <Button
            onClick={handleSave}
            disabled={!dirty || saving || loading}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save changes
          </Button>
        }
      />

      {dirty && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          ● Unsaved changes — click &ldquo;Save changes&rdquo; to publish to the live site.
        </div>
      )}

      <Tabs value={activeGroup} onValueChange={(v) => setActiveGroup(v as Group)}>
        <TabsList>
          <TabsTrigger value="main">
            Main ({structure.main.length})
          </TabsTrigger>
          <TabsTrigger value="utility">
            Utility ({structure.utility.length})
          </TabsTrigger>
          <TabsTrigger value="legal">
            Legal ({structure.legal.length})
          </TabsTrigger>
        </TabsList>

        {(Object.keys(GROUP_LABELS) as Group[]).map((group) => (
          <TabsContent key={group} value={group} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{GROUP_LABELS[group]}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addItem(group)}
                  >
                    <Plus className="size-4" />
                    Add link
                  </Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {GROUP_DESCRIPTIONS[group]}
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <TableSkeleton rows={4} cols={5} />
                ) : structure[group].length === 0 ? (
                  <EmptyState
                    icon={MenuIcon}
                    title="No navigation items yet"
                    description="Add links to build this section of the navigation."
                    actionLabel="Add first link"
                    onAction={() => addItem(group)}
                  />
                ) : (
                  <div className="overflow-hidden rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">Order</TableHead>
                          <TableHead>Label</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead className="w-28">Type</TableHead>
                          <TableHead className="w-20">Visible</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {structure[group].map((item, idx) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground w-4">
                                  {idx + 1}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7"
                                  onClick={() => moveItem(group, item.id, "up")}
                                  disabled={idx === 0}
                                  title="Move up"
                                >
                                  <ArrowUp className="size-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7"
                                  onClick={() => moveItem(group, item.id, "down")}
                                  disabled={idx === structure[group].length - 1}
                                  title="Move down"
                                >
                                  <ArrowDown className="size-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.label}
                                onChange={(e) =>
                                  updateItem(group, item.id, { label: e.target.value })
                                }
                                className="h-9"
                                placeholder="Home"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Input
                                  value={item.href}
                                  onChange={(e) =>
                                    updateItem(group, item.id, { href: e.target.value })
                                  }
                                  className="h-9"
                                  placeholder="/about"
                                />
                                {item.href.startsWith("http") && (
                                  <a
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-brand"
                                  >
                                    <ExternalLink className="size-3.5" />
                                  </a>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={item.type}
                                onValueChange={(v) =>
                                  updateItem(group, item.id, { type: v as NavType })
                                }
                              >
                                <SelectTrigger className="h-9 w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="link">Link</SelectItem>
                                  <SelectItem value="dropdown">Dropdown</SelectItem>
                                  <SelectItem value="cta">CTA</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Switch
                                  checked={item.visible}
                                  onCheckedChange={(v) =>
                                    updateItem(group, item.id, { visible: v })
                                  }
                                />
                                {item.visible ? (
                                  <Eye className="size-3.5 text-muted-foreground" />
                                ) : (
                                  <EyeOff className="size-3.5 text-muted-foreground" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-9 text-destructive hover:text-destructive"
                                onClick={() => deleteItem(group, item.id)}
                                title="Delete"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="border-brand/20 bg-brand/5">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">How it works:</strong> Changes are saved
            to the database and immediately revalidate the public site cache. After
            saving, reload any public page to see the updated navigation in the header
            and footer. The &ldquo;Main&rdquo; group appears in the top navigation bar;
            &ldquo;Utility&rdquo; items appear in the mobile menu&apos;s &ldquo;More&rdquo;
            section; &ldquo;Legal&rdquo; items appear in the footer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
