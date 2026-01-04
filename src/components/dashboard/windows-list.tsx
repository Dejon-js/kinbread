import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { WindowCard } from "./window-card";
import { Button } from "@/components/ui/button";
import type { WindowWithStats } from "@/types";

interface WindowsListProps {
  windows: WindowWithStats[];
  timezone: string;
}

export function WindowsList({ windows, timezone }: WindowsListProps) {
  if (windows.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="mb-2 text-muted-foreground">No dates set up yet</p>
        <p className="text-sm text-muted-foreground mb-6">
          Add your first availability date to get started
        </p>
        <Button asChild>
          <Link href="/dashboard/windows/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Date
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {windows.map((window) => (
        <WindowCard key={window.id} window={window} timezone={timezone} />
      ))}
    </div>
  );
}
