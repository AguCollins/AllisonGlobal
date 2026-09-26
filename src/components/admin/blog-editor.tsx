"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Save,
  Trash2,
  Loader2,
  AlertCircle,
  Check,
  FileText,
  Image as ImageIcon,
  Search,
  Send,
  PlusCircle,
} from "lucide-react";
import {
  PageHeader,
  API,
  slugify,
  useUnsavedChanges,
} from "@/components/admin/shared";
import { BlogBlockEditor } from "@/components/admin/blog-block-editor";
import { BlogSeoTab, type BlogSeoState } from "@/components/admin/blog-seo-tab";
import {
  BlogPublishingTab,
  type BlogPublishingState,
  type BlogStatus,
} from "@/components/admin/blog-publishing-tab";
import {
  type BlogBlock,
  normalizeBlocks,
  createEmptyBlock,
} from "@/components/blog/blog-block-renderer";

// ───────────────────────── Types ─────────────────────────

/** The full editor state. Mirrors the API payload. */
export interface BlogEditorState {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  content: BlogBlock[];
  // Media
  featuredImage: string;
  imageQuery: string;
  // SEO
  seo: BlogSeoState;
  // Publishing
  publishing: BlogPublishingState;
}

/** The shape returned by the API (admin list view). */
export interface BlogRecord {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  authorRole: string;
  imageQuery: string;
  featuredImage?: string | null;
  content: unknown;
  tags: string[];
  featured: boolean;
  status?: string;
  scheduledAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface BlogEditorProps {
  mode: "create" | "edit";
  /** When mode=edit, the post ID. */
  postId?: string;
  /** When mode=edit, the loaded record (or null while still loading). */
  initial?: BlogRecord | null;
  /** True while the parent is fetching the record (edit mode only). */
  loading?: boolean;
  /** Error message from the parent (edit mode only). */
  error?: string | null;
  /** Retry handler (edit mode only). */
  onRetry?: () => void;
}

// ───────────────────────── Defaults ─────────────────────────

const today = () => new Date().toISOString().slice(0, 10);

function emptyState(): BlogEditorState {
  return {
    title: "",
    slug: "",
    excerpt: "",
    category: "Surveillance",
    content: [{ type: "paragraph", text: "" }],
    featuredImage: "",
    imageQuery: "",
    seo: {
      metaTitle: "",
      metaDescription: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      canonicalUrl: "",
      noindex: false,
      nofollow: false,
    },
    publishing: {
      status: "draft",
      scheduledAt: null,
      featured: false,
      tags: [],
      readTime: "5 min read",
      date: today(),
      author: "",
      authorRole: "",
    },
  };
}

function stateFromRecord(rec: BlogRecord): BlogEditorState {
  const blocks = normalizeBlocks(rec.content);
  return {
    title: rec.title ?? "",
    slug: rec.slug ?? "",
    excerpt: rec.excerpt ?? "",
    category: rec.category ?? "",
    content: blocks.length > 0 ? blocks : [createEmptyBlock("paragraph")],
    featuredImage: rec.featuredImage ?? "",
    imageQuery: rec.imageQuery ?? "",
    seo: {
      metaTitle: rec.metaTitle ?? "",
      metaDescription: rec.metaDescription ?? "",
      ogTitle: rec.ogTitle ?? "",
      ogDescription: rec.ogDescription ?? "",
      ogImage: rec.ogImage ?? "",
      canonicalUrl: rec.canonicalUrl ?? "",
      noindex: rec.noindex ?? false,
      nofollow: rec.nofollow ?? false,
    },
    publishing: {
      status: (rec.status as BlogStatus) || "draft",
      scheduledAt: rec.scheduledAt ?? null,
      featured: rec.featured ?? false,
      tags: Array.isArray(rec.tags) ? rec.tags : [],
      readTime: rec.readTime ?? "",
      date: rec.date || today(),
      author: rec.author ?? "",
      authorRole: rec.authorRole ?? "",
    },
  };
}

function buildPayload(state: BlogEditorState, id?: string) {
  const payload: Record<string, unknown> = {
    title: state.title.trim(),
    slug: state.slug.trim() || slugify(state.title),
    excerpt: state.excerpt.trim(),
    category: state.category.trim(),
    author: state.publishing.author.trim(),
    authorRole: state.publishing.authorRole.trim(),
    readTime: state.publishing.readTime.trim(),
    date: state.publishing.date,
    imageQuery: state.imageQuery.trim(),
    featuredImage: state.featuredImage.trim() || null,
    content: state.content,
    tags: state.publishing.tags,
    featured: state.publishing.featured,
    status: state.publishing.status,
    scheduledAt: state.publishing.scheduledAt,
    metaTitle: state.seo.metaTitle || null,
    metaDescription: state.seo.metaDescription || null,
    ogTitle: state.seo.ogTitle || null,
    ogDescription: state.seo.ogDescription || null,
    ogImage: state.seo.ogImage || null,
    canonicalUrl: state.seo.canonicalUrl || null,
    noindex: state.seo.noindex,
    nofollow: state.seo.nofollow,
  };
  if (id) payload.id = id;
  return payload;
}

// ───────────────────────── Helpers ─────────────────────────

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

const SAVE_INDICATOR: Record<
  SaveStatus,
  { label: string; icon: typeof Save; className: string }
> = {
  idle: {
    label: "All changes saved",
    icon: Check,
    className: "text-muted-foreground",
  },
  pending: {
    label: "Unsaved changes",
    icon: AlertCircle,
    className: "text-amber-600 dark:text-amber-400",
  },
  saving: {
    label: "Saving…",
    icon: Loader2,
    className: "text-muted-foreground",
  },
  saved: {
    label: "Saved",
    icon: Check,
    className: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    label: "Save failed",
    icon: AlertCircle,
    className: "text-destructive",
  },
};

const AUTOSAVE_DEBOUNCE_MS = 30_000;

// ───────────────────────── Editor ─────────────────────────

export function BlogEditor({
  mode,
  postId,
  initial,
  loading,
  error,
  onRetry,
}: BlogEditorProps) {
  const router = useRouter();
  const [state, setState] = React.useState<BlogEditorState>(() =>
    initial ? stateFromRecord(initial) : emptyState(),
  );
  const [original, setOriginal] = React.useState<string>("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [slugWarningShown, setSlugWarningShown] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("content");
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);
  const [publishingNow, setPublishingNow] = React.useState(false);
  const autosaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from `initial` when it arrives (edit mode).
  React.useEffect(() => {
    if (initial) {
      const s = stateFromRecord(initial);
      setState(s);
      setOriginal(JSON.stringify(s));
      setSaveStatus("idle");
    }
  }, [initial]);

  // Auto-generate slug from title (only if user hasn't manually edited slug).
  React.useEffect(() => {
    if (!slugTouched) {
      setState((s) => ({ ...s, slug: slugify(s.title) }));
    }
  }, [state.title, slugTouched]);

  const dirty = JSON.stringify(state) !== original;
  useUnsavedChanges(dirty);

  // ── State update helpers ──────────────────────────────
  function update<K extends keyof BlogEditorState>(
    key: K,
    next: BlogEditorState[K],
  ) {
    setState((s) => ({ ...s, [key]: next }));
  }

  // ── Save handlers ─────────────────────────────────────
  async function persistOnce(s: BlogEditorState, id?: string): Promise<string | null> {
    const payload = buildPayload(s, id);
    const res = await fetch(API.blog, {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(j?.error || `HTTP ${res.status}`);
    }
    const json = (await res.json()) as { item?: { id: string } };
    return json.item?.id ?? null;
  }

  async function handleCreate() {
    setSubmitting(true);
    setSaveStatus("saving");
    try {
      const newId = await persistOnce(state);
      toast.success("Post created");
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      router.push(`/admin/blog/${newId}`);
    } catch (e) {
      setSaveStatus("error");
      toast.error(e instanceof Error ? e.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSave() {
    if (mode === "create") {
      await handleCreate();
      return;
    }
    if (!postId) return;
    setSubmitting(true);
    setSaveStatus("saving");
    try {
      await persistOnce(state, postId);
      setOriginal(JSON.stringify(state));
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      toast.success("Saved");
    } catch (e) {
      setSaveStatus("error");
      toast.error(e instanceof Error ? e.message : "Failed to save post");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePublishNow() {
    if (!postId) return;
    setPublishingNow(true);
    try {
      const next: BlogEditorState = {
        ...state,
        publishing: {
          ...state.publishing,
          status: "published",
          scheduledAt: null,
          date: new Date().toISOString().slice(0, 10),
        },
      };
      const res = await fetch(API.blog, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(next, postId)),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setState(next);
      setOriginal(JSON.stringify(next));
      toast.success("Post published");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setPublishingNow(false);
    }
  }

  async function confirmDelete() {
    if (!postId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API.blog}?id=${encodeURIComponent(postId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Post deleted");
      router.push("/admin/blog");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete post");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  // ── Autosave ──────────────────────────────────────────
  // Debounced autosave every 30s if there are unsaved changes AND the post
  // has been saved at least once (has an ID). Also shows a "Unsaved
  // changes" indicator while the user is editing.
  React.useEffect(() => {
    if (mode !== "edit") return;
    if (!postId) return;
    if (submitting) return;

    if (!dirty) {
      // No unsaved changes. Don't override a recently-set "saved" / "error"
      // status — it will be reset to "idle" only when the user makes another
      // change. The initial render with dirty=false uses the default "idle".
      return;
    }

    // Mark pending (unsaved) only if we're not already mid-flight.
    setSaveStatus((prev) => (prev === "saving" ? prev : "pending"));

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await persistOnce(state, postId);
        setOriginal(JSON.stringify(state));
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        setSaveStatus("error");
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [state, postId, mode, dirty, submitting]);

  // ── Slug-change warning ───────────────────────────────
  // Show a one-time warning when slug changes from the original.
  React.useEffect(() => {
    if (mode !== "edit" || !postId) return;
    if (!original) return;
    if (slugWarningShown) return;
    try {
      const originalState = JSON.parse(original) as BlogEditorState;
      if (originalState.slug && state.slug && originalState.slug !== state.slug) {
        toast.info("Slug changed — a 301 redirect will be created automatically.");
        setSlugWarningShown(true);
      }
    } catch {
      // ignore parse errors
    }
  }, [state.slug, original, mode, postId, slugWarningShown]);

  // ── Render ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={PlusCircle}
          title={mode === "edit" ? "Edit post" : "New post"}
          backHref="/admin/blog"
        />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-muted/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={PlusCircle}
          title={mode === "edit" ? "Edit post" : "New post"}
          backHref="/admin/blog"
        />
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-start gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Failed to load</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
            {onRetry && (
              <Button variant="outline" className="min-h-10" onClick={onRetry}>
                Retry
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const SaveIndicator = SAVE_INDICATOR[saveStatus];
  const SaveIcon = SaveIndicator.icon;

  const permalink = state.slug
    ? `/blog/${state.slug}`
    : "/blog/your-slug-here";

  const headerAction =
    mode === "edit" ? (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="min-h-10 hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Delete
        </Button>
      </div>
    ) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title={mode === "edit" ? "Edit Blog Post" : "New Blog Post"}
        description={
          mode === "edit"
            ? state.title || "Editing existing post"
            : "Write an article or insight"
        }
        backHref="/admin/blog"
        action={headerAction}
      />

      {/* Save indicator */}
      {mode === "edit" && (
        <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">
          <div className={`flex items-center gap-1.5 ${SaveIndicator.className}`}>
            <SaveIcon
              className={`size-3.5 ${saveStatus === "saving" ? "animate-spin" : ""}`}
            />
            <span>{SaveIndicator.label}</span>
            {lastSavedAt && saveStatus === "saved" && (
              <span className="text-muted-foreground">
                · {lastSavedAt.toLocaleTimeString()}
              </span>
            )}
          </div>
          <span className="text-muted-foreground">
            Autosave every 30s when there are changes.
          </span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
        <TabsList className="h-10">
          <TabsTrigger value="content" className="min-h-8">
            <FileText className="size-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="media" className="min-h-8">
            <ImageIcon className="size-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="seo" className="min-h-8">
            <Search className="size-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="publishing" className="min-h-8">
            <Send className="size-4" />
            Publishing
          </TabsTrigger>
        </TabsList>

        {/* ───────────── Content tab ───────────── */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={state.title}
                  onChange={(e) => update("title", e.target.value)}
                  className="h-10"
                  placeholder="Post title"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={state.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update("slug", slugify(e.target.value));
                  }}
                  className="h-10 font-mono"
                  placeholder="auto-generated-from-title"
                />
                <p className="text-xs text-muted-foreground">
                  Permalink:{" "}
                  <span className="font-mono text-brand">{permalink}</span>
                </p>
                {mode === "edit" && dirty && slugTouched && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Changing the slug will create a 301 redirect from the old
                    URL to the new one. Existing links will still work.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={state.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="h-10"
                  placeholder="e.g. Surveillance"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={state.excerpt}
                  onChange={(e) => update("excerpt", e.target.value)}
                  rows={3}
                  placeholder="Short summary shown in cards and previews"
                />
              </div>
            </CardContent>
          </Card>

          <BlogBlockEditor
            blocks={state.content}
            onChange={(blocks) => update("content", blocks)}
          />
        </TabsContent>

        {/* ───────────── Media tab ───────────── */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="featuredImage">Featured image URL</Label>
                <Input
                  id="featuredImage"
                  value={state.featuredImage}
                  onChange={(e) => update("featuredImage", e.target.value)}
                  className="h-10"
                  placeholder="https://… (overrides image query)"
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  If provided, this URL is used as the post&apos;s hero image
                  on the public site. Falls back to the image query below.
                </p>
              </div>
              {state.featuredImage && (
                <div className="overflow-hidden rounded-md border border-border">
                  <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={state.featuredImage}
                      alt="Featured image preview"
                      className="absolute inset-0 size-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity =
                          "0.3";
                      }}
                    />
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="imageQuery">Image query (fallback)</Label>
                <Input
                  id="imageQuery"
                  value={state.imageQuery}
                  onChange={(e) => update("imageQuery", e.target.value)}
                  className="h-10"
                  placeholder="cctv security camera installation"
                />
                <p className="text-xs text-muted-foreground">
                  Used when no featured image URL is set. Generates a
                  placeholder image based on the query.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───────────── SEO tab ───────────── */}
        <TabsContent value="seo" className="space-y-6">
          <BlogSeoTab
            value={state.seo}
            onChange={(seo) => update("seo", seo)}
            title={state.title}
            slug={state.slug}
            featuredImage={state.featuredImage}
          />
        </TabsContent>

        {/* ───────────── Publishing tab ───────────── */}
        <TabsContent value="publishing" className="space-y-6">
          <BlogPublishingTab
            value={state.publishing}
            onChange={(publishing) => update("publishing", publishing)}
            slug={state.slug}
            isSaved={mode === "edit" && Boolean(postId)}
            onPublishNow={handlePublishNow}
            publishingNow={publishingNow}
          />
        </TabsContent>
      </Tabs>

      {/* Footer actions */}
      <div className="flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center">
        <div className="text-xs text-muted-foreground">
          {state.publishing.status === "published" && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              Will be published
            </Badge>
          )}
          {state.publishing.status === "draft" && (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              Will be saved as draft
            </Badge>
          )}
          {state.publishing.status === "scheduled" && (
            <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400">
              Scheduled
            </Badge>
          )}
          {state.publishing.status === "archived" && (
            <Badge variant="secondary">Will be archived</Badge>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-10"
            onClick={() => router.push("/admin/blog")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={handleSave}
            disabled={submitting || publishingNow}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {submitting
              ? "Saving…"
              : mode === "edit"
                ? "Save changes"
                : "Create post"}
          </Button>
        </div>
      </div>

      {/* Delete confirmation (edit mode) */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{" "}
              <span className="font-medium text-foreground">
                {state.title || "this post"}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
