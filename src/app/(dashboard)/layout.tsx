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
      <DashboardNav baker={baker} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
