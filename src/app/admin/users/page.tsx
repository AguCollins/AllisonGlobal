"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users as UsersIcon,
  UserPlus,
  Trash2,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface UsersResponse {
  users: AdminUserRow[];
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function ForbiddenState() {
  return (
    <Card className="border-amber-300/40 bg-amber-50 dark:bg-amber-500/5">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
          <ShieldAlert className="size-7" />
        </div>
        <div>
          <p className="font-display text-lg font-bold">
            You need superadmin access to manage users
          </p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            User management is restricted to superadmin accounts. Contact a
            superadmin if you need to invite a teammate or change your own
            role.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col items-start gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Failed to load users</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        <Button variant="outline" size="lg" className="min-h-10" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string } | undefined)?.id;

  const [users, setUsers] = React.useState<AdminUserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [forbidden, setForbidden] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Add-user dialog state
  const [addOpen, setAddOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    email: "",
    name: "",
    password: "",
    role: "admin" as "admin" | "superadmin",
  });
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Per-row mutation state
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as UsersResponse;
      setUsers(json.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (form.password.length < 12) {
      setFormError("Password must be at least 12 characters.");
      return;
    }
    if (!form.email.includes("@")) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (form.name.trim().length < 2) {
      setFormError("Name must be at least 2 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as { user: AdminUserRow };
      setUsers((prev) => [...prev, json.user]);
      setForm({ email: "", name: "", password: "", role: "admin" });
      setAddOpen(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  async function patchUser(
    id: string,
    payload: { role?: string; active?: boolean },
  ) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as { user: AdminUserRow };
      setUsers((prev) => prev.map((u) => (u.id === id ? json.user : u)));
    } catch (e) {
      console.error("Failed to update user:", e);
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      console.error("Failed to delete user:", e);
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage admin accounts, roles and access.
          </p>
        </div>
        {!forbidden && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <UserPlus className="size-4" />
                Add user
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create admin user</DialogTitle>
                <DialogDescription>
                  New users receive their password from you. They can sign in
                  immediately at /admin/login.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="u-name">Name</Label>
                  <Input
                    id="u-name"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Ada Okoro"
                    autoComplete="name"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="u-email">Email</Label>
                  <Input
                    id="u-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="ada@allisonglobal.tech"
                    autoComplete="email"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="u-password">
                    Password{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (min 12 characters)
                    </span>
                  </Label>
                  <Input
                    id="u-password"
                    type="password"
                    required
                    minLength={12}
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, role: v as "admin" | "superadmin" }))
                    }
                  >
                    <SelectTrigger className="h-10 w-full" aria-label="Role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Superadmin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formError && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    {formError}
                  </div>
                )}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="min-h-10"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <UserPlus className="size-4" />
                        Create user
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Body */}
      {forbidden ? (
        <ForbiddenState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <Card>
          <CardContent className="px-0">
            {loading ? (
              <div className="space-y-2 px-6 pb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <UsersIcon className="size-12 text-muted-foreground/40" />
                <div>
                  <p className="font-medium">No admin users yet</p>
                  <p className="text-sm text-muted-foreground">
                    Add your first admin to get started.
                  </p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const isSelf = u.id === currentUserId;
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {u.name}
                            {isSelf && (
                              <Badge variant="outline" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={u.role}
                            disabled={busyId === u.id || isSelf}
                            onValueChange={(v) => patchUser(u.id, { role: v })}
                          >
                            <SelectTrigger
                              className="h-9 min-w-36 capitalize"
                              aria-label={`Role for ${u.name}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="superadmin">Superadmin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={u.active}
                              disabled={busyId === u.id || isSelf}
                              onCheckedChange={(checked) =>
                                patchUser(u.id, { active: checked })
                              }
                              aria-label={`Toggle active for ${u.name}`}
                            />
                            {u.active ? (
                              <CheckCircle2 className="size-4 text-emerald-500" />
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatDate(u.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={busyId === u.id || isSelf}
                                className="size-10 text-muted-foreground hover:text-destructive disabled:opacity-30"
                                aria-label={`Delete user ${u.name}`}
                                title={
                                  isSelf
                                    ? "You cannot delete your own account"
                                    : "Delete user"
                                }
                              >
                                {busyId === u.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Trash2 className="size-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete user?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This permanently deletes{" "}
                                  <span className="font-medium text-foreground">
                                    {u.name}
                                  </span>{" "}
                                  (&lt;{u.email}&gt;). They will immediately lose
                                  admin access. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="min-h-10">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="min-h-10 bg-destructive text-white hover:bg-destructive/90"
                                  onClick={() => deleteUser(u.id)}
                                >
                                  Delete user
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
