import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SoldOutBadge } from "./sold-out-badge";
import { formatWeekday, formatShortDate } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";
import type { PublicWindowView } from "@/types";

interface DateCardProps {
  window: PublicWindowView;
  slug: string;
  timezone: string;
}

export function DateCard({ window, slug, timezone }: DateCardProps) {
  const isSoldOut = !window.is_available;

  const content = (
    <Card className={cn(
      "transition-colors",
      isSoldOut ? "opacity-60 bg-muted/30" : "hover:bg-muted/50 cursor-pointer"
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
            {!isSoldOut && (
              <div className="text-sm text-muted-foreground">
                {window.available_slots} {window.available_slots === 1 ? "spot" : "spots"} available
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSoldOut ? (
            <SoldOutBadge />
          ) : (
            <>
              <span className="text-sm text-muted-foreground">Book</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isSoldOut) {
    return content;
  }

  return (
    <Link href={`/${slug}/book/${window.id}`}>
      {content}
    </Link>
  );
}
