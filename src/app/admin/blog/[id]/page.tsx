"use client";

import * as React from "react";
import { toast } from "sonner";
import { BlogEditor, type BlogRecord } from "@/components/admin/blog-editor";
import { API } from "@/components/admin/shared";

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [record, setRecord] = React.useState<BlogRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API.blog}?drafts=true&limit=200`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: BlogRecord[] };
      const found = json.items.find((it) => it.id === id) ?? null;
      if (!found) throw new Error("Post not found");
      setRecord(found);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      toast.error("Failed to load post");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <BlogEditor
      mode="edit"
      postId={id}
      initial={record}
      loading={loading}
      error={error}
      onRetry={load}
    />
  );
}
