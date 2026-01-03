import { Calendar } from "lucide-react";

interface NoAvailabilityMessageProps {
  type?: "no-dates" | "all-sold-out" | "no-upcoming";
}

export function NoAvailabilityMessage({ type = "no-dates" }: NoAvailabilityMessageProps) {
  const messages = {
    "no-dates": {
      title: "No availability posted",
      description: "Check back later for available dates.",
    },
    "all-sold-out": {
      title: "All dates are sold out",
      description: "Check back later for new availability.",
    },
    "no-upcoming": {
      title: "No upcoming availability",
      description: "Check back later for new dates.",
    },
  };

  const { title, description } = messages[type];

  return (
    <div className="text-center py-12">
      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
