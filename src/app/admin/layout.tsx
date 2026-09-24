import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Get the current pathname from headers (set by middleware) or fall back
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isLoginPage = pathname === "/admin/login" || pathname.endsWith("/admin/login");

  // If not logged in and NOT on login page → redirect to login
  if (!session && !isLoginPage) {
    redirect("/admin/login");
  }

  // If logged in and on login page → redirect to dashboard
  if (session && isLoginPage) {
    redirect("/admin");
  }

  // If not logged in and on login page → render login WITHOUT sidebar
  if (!session && isLoginPage) {
    return <>{children}</>;
  }

  const user = session!.user as { name: string; role: string };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar userName={user.name} userRole={user.role} />
      <main className="flex-1 overflow-x-hidden bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
