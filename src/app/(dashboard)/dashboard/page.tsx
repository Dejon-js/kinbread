import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowsList } from "@/components/dashboard/windows-list";
import { getCurrentBaker } from "@/lib/queries/baker";
import { getWindowsForBaker } from "@/lib/queries/capacity-windows";

export const metadata = {
  title: "Dashboard - Capacity Gate",
  description: "Manage your bakery capacity",
};

export default async function DashboardPage() {
  const baker = await getCurrentBaker();

  if (!baker) {
    return null; // Layout handles redirect
  }

  const windows = await getWindowsForBaker(baker.id);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Dates</h1>
          <p className="text-muted-foreground">
            Manage when you&apos;re available for orders
          </p>
        </div>
        <Link href="/dashboard/windows/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Date
          </Button>
        </Link>
      </div>

      <WindowsList windows={windows} timezone={baker.timezone} />
    </div>
  );
}
