import { WindowCard } from "./window-card";
import type { WindowWithStats } from "@/types";

interface WindowsListProps {
  windows: WindowWithStats[];
  timezone: string;
}

export function WindowsList({ windows, timezone }: WindowsListProps) {
  if (windows.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="mb-2">No dates set up yet</p>
        <p className="text-sm">Add your first availability date to get started</p>
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
