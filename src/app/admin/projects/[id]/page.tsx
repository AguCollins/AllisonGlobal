"use client";

import * as React from "react";
import { toast } from "sonner";
import { ProjectEditor } from "@/components/admin/project-editor";
import type { ProjectRecord } from "@/components/admin/project-editor";
import { API } from "@/components/admin/shared";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [record, setRecord] = React.useState<ProjectRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API.projects}?drafts=true&limit=200`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: ProjectRecord[] };
      const found = json.items.find((p) => p.id === id) ?? null;
      if (!found) throw new Error("Project not found");
      setRecord(found);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <ProjectEditor
      mode="edit"
      projectId={id}
      initial={record}
      loading={loading}
      error={error}
      onRetry={load}
    />
  );
}
