"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/site/primitives";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users as UsersIcon,
  ScrollText,
  ExternalLink,
  LogOut,
  Menu,
  ClipboardList,
  Wrench,
  Newspaper,
  Briefcase,
  Building2,
  HelpCircle,
  Quote,
  Puzzle,
  Settings as SettingsIcon,
  Navigation as NavigationIcon,
  Megaphone,
  Workflow,
  FileText,
  Compass,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: ClipboardList },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/solutions", label: "Solutions", icon: Puzzle },
  { href: "/admin/industries", label: "Industries", icon: Building2 },
  { href: "/admin/projects", label: "Projects", icon: Briefcase },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/process", label: "Process", icon: Workflow },
  { href: "/admin/careers", label: "Careers", icon: Compass },
  { href: "/admin/ctas", label: "CTAs", icon: Megaphone },
  { href: "/admin/navigation", label: "Navigation", icon: NavigationIcon },
  { href: "/admin/legal", label: "Legal", icon: FileText },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon className="size-4.5" />
            {item.label}
          </Link>
        );
      })}
      <div className="my-3 border-t border-border" />
      <Link
        href="/"
        target="_blank"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <ExternalLink className="size-4.5" />
        View Public Site
      </Link>
    </nav>
  );
}

function SidebarFooter({ userName, userRole }: { userName: string; userRole: string }) {
  return (
    <div className="border-t border-border p-3">
      <div className="mb-3 flex items-center gap-2 px-3 py-2 text-sm">
        <div className="flex size-8 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{userName}</div>
          <div className="text-xs capitalize text-muted-foreground">{userRole}</div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-destructive"
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    </div>
  );
}

export function AdminSidebar({ userName, userRole }: { userName: string; userRole: string }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-muted/30 lg:flex">
        <div className="border-b border-border p-4">
          <LogoMark />
        </div>
        <NavLinks />
        <SidebarFooter userName={userName} userRole={userRole} />
      </aside>

      {/* Mobile nav trigger */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <LogoMark withText={false} />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu" className="size-10">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle asChild>
              <div className="border-b border-border p-4">
                <LogoMark />
              </div>
            </SheetTitle>
            <div className="flex h-[calc(100%-80px)] flex-col">
              <NavLinks />
              <SidebarFooter userName={userName} userRole={userRole} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
