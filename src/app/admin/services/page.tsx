"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, ExternalLink, Info } from "lucide-react";
import { serviceCategories, services } from "@/lib/data/services";

export default function AdminServicesPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Wrench className="size-6 text-brand" />
        <div>
          <h1 className="font-display text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">{services.length} services across {serviceCategories.length} categories</p>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
        <Info className="mt-0.5 size-5 shrink-0 text-brand" />
        <div>
          <p className="text-sm font-medium">Content management</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Full CRUD editing will be available after the database seed is run against Neon PostgreSQL.
            Until then, services are managed via the codebase and deployed with each release.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {serviceCategories.map((cat) => {
          const catServices = services.filter((s) => s.categoryId === cat.id);
          return (
            <div key={cat.id} className="overflow-hidden rounded-xl border border-border">
              <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-5 py-3">
                <cat.icon className="size-5 text-brand" />
                <h2 className="font-display text-lg font-semibold">{cat.name}</h2>
                <Badge variant="secondary" className="ml-auto">{catServices.length} services</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="px-5 py-2 font-semibold">Name</th>
                      <th className="px-5 py-2 font-semibold">Slug</th>
                      <th className="px-5 py-2 font-semibold">Featured</th>
                      <th className="px-5 py-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catServices.map((s) => (
                      <tr key={s.slug} className="border-b border-border/50 last:border-0">
                        <td className="px-5 py-3 font-medium">{s.name}</td>
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{s.slug}</td>
                        <td className="px-5 py-3">{s.featured ? <Badge className="bg-brand text-brand-foreground">Yes</Badge> : <span className="text-muted-foreground">—</span>}</td>
                        <td className="px-5 py-3">
                          <Button variant="ghost" size="sm" asChild className="min-h-10">
                            <Link href={`/services/${s.slug}`} target="_blank">
                              View <ExternalLink className="ml-1 size-3" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
