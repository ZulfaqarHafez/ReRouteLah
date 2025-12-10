import { Bus, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type CrowdLevel = "low" | "medium" | "high";

interface BusArrivalCardProps {
  busNumber: string;
  destination: string;
  arrivalTime: string;
  crowdLevel: CrowdLevel;
  nextArrival?: string;
}

const crowdConfig: Record<CrowdLevel, { label: string; color: string; bgColor: string }> = {
  low: {
    label: "Seats Available",
    color: "text-crowd-low",
    bgColor: "bg-success/10",
  },
  medium: {
    label: "Standing Only",
    color: "text-crowd-medium",
    bgColor: "bg-warning/10",
  },
  high: {
    label: "Very Crowded",
    color: "text-crowd-high",
    bgColor: "bg-destructive/10",
  },
};

const BusArrivalCard = ({
  busNumber,
  destination,
  arrivalTime,
  crowdLevel,
  nextArrival,
}: BusArrivalCardProps) => {
  const crowd = crowdConfig[crowdLevel];

  return (
    <div className="rounded-2xl bg-card p-4 shadow-md transition-all hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary shadow-sm">
            <Bus className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{busNumber}</span>
              <div className={cn("rounded-full px-2 py-0.5 text-xs font-medium", crowd.bgColor, crowd.color)}>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{crowd.label}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{destination}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-2xl font-bold text-primary">
            <Clock className="h-5 w-5" />
            <span>{arrivalTime}</span>
          </div>
          {nextArrival && (
            <p className="text-xs text-muted-foreground">
              Next: {nextArrival}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusArrivalCard;
