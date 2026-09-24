"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollText, ChevronLeft, ChevronRight, ShieldX } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  ip: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
  metadata: Record<string, unknown> | null;
}

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  UPDATE: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  DELETE: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  LOGIN: "bg-gray-50 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300",
  LOGOUT: "bg-gray-50 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300",
  LOGIN_FAILED: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  STATUS_CHANGE: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  ROLE_CHANGE: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  PUBLISH: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  UNPUBLISH: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  async function fetchLogs(p: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/audit?page=${p}`);
      if (res.status === 403) {
        setError("forbidden");
        return;
      }
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setLogs(data.logs);
      setPages(data.pages);
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  }

  if (error === "forbidden") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <ShieldX className="mb-4 size-12 text-muted-foreground" />
        <h1 className="font-display text-xl font-bold">Superadmin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">You need superadmin privileges to view the audit log.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <ScrollText className="size-6 text-brand" />
        <div>
          <h1 className="font-display text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">All admin actions are recorded</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">Failed to load audit log.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchLogs(page)}>Retry</Button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Timestamp</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">User</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Action</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Resource</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-border">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString("en-NG", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{log.user?.name || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${ACTION_STYLES[log.action] || "bg-muted text-muted-foreground"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{log.resource}{log.resourceId ? ` (${log.resourceId.slice(-8)})` : ""}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{log.ip || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="min-h-10">
                  <ChevronLeft className="size-4" /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)} className="min-h-10">
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
