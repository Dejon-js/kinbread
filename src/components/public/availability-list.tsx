import { DateCard } from "./date-card";
import { NoAvailabilityMessage } from "./no-availability-message";
import type { PublicWindowView } from "@/types";

interface AvailabilityListProps {
  windows: PublicWindowView[];
  slug: string;
  timezone: string;
}

export function AvailabilityList({ windows, slug, timezone }: AvailabilityListProps) {
  if (windows.length === 0) {
    return <NoAvailabilityMessage type="no-dates" />;
  }

  const hasAvailable = windows.some((w) => w.is_available);

  if (!hasAvailable) {
    return (
      <div>
        <NoAvailabilityMessage type="all-sold-out" />
        <div className="mt-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Sold out dates
          </h3>
          <div className="space-y-3 opacity-60">
            {windows.map((window) => (
              <DateCard
                key={window.id}
                window={window}
                slug={slug}
                timezone={timezone}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {windows.map((window) => (
        <DateCard
          key={window.id}
          window={window}
          slug={slug}
          timezone={timezone}
        />
      ))}
    </div>
  );
}
