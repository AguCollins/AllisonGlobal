"use client";

import * as React from "react";
import { toast } from "sonner";
import { ServiceEditor } from "@/components/admin/service-editor";
import type { ServiceRecord } from "@/components/admin/service-editor";
import { API } from "@/components/admin/shared";

export default function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [record, setRecord] = React.useState<ServiceRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API.services}?drafts=true&limit=200`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: ServiceRecord[] };
      const found = json.items.find((it) => it.id === id) ?? null;
      if (!found) throw new Error("Service not found");
      setRecord(found);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      toast.error("Failed to load service");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <ServiceEditor
      mode="edit"
      serviceId={id}
      initial={record}
      loading={loading}
      error={error}
      onRetry={load}
    />
  );
}
