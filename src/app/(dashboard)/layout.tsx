import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/nav";
import { getCurrentBaker } from "@/lib/queries";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baker = await getCurrentBaker();

  // If no baker profile, redirect to onboarding
  // (In real implementation, also check auth status)
  if (!baker) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:border focus:rounded-md focus:top-2 focus:left-2"
      >
        Skip to main content
      </a>
      <DashboardNav baker={baker} />
      <main id="main-content" className="flex-1 overflow-auto pt-16 lg:pt-0" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
