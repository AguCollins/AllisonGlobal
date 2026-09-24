"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/site/primitives";
import { Lock, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else if (res?.ok) {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark withText={false} className="mb-3" />
          <h1 className="font-display text-2xl font-bold">Admin Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage Allison Global
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div>
            <Label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@allisonglobal.tech" autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" autoComplete="current-password" />
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
            {loading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in…
              </>
            ) : (
              <>
                <Lock className="size-4" />
                Sign in
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
