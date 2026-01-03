import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CapacityBadge } from "./capacity-badge";
import { formatDate, formatWeekday, isDateInPast } from "@/lib/utils/dates";
import type { WindowWithStats } from "@/types";
import { cn } from "@/lib/utils";

interface WindowCardProps {
  window: WindowWithStats;
  timezone: string;
}

export function WindowCard({ window, timezone }: WindowCardProps) {
  const isPast = isDateInPast(window.date, timezone);

  return (
    <Link href={`/dashboard/windows/${window.id}`}>
      <Card className={cn(
        "hover:bg-muted/50 transition-colors",
        isPast && "opacity-60"
      )}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center min-w-[60px]">
              <div className="text-2xl font-bold">
                {new Date(window.date + "T12:00:00").getDate()}
              </div>
              <div className="text-xs text-muted-foreground uppercase">
                {new Date(window.date + "T12:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  timeZone: timezone,
                })}
              </div>
            </div>
            <div>
              <div className="font-medium">
                {formatWeekday(window.date, timezone)}
              </div>
              {window.note && (
                <div className="text-sm text-muted-foreground">
                  {window.note}
                </div>
              )}
              {isPast && (
                <div className="text-xs text-muted-foreground italic">
                  Past date
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CapacityBadge used={window.used_slots} total={window.total_slots} />
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
