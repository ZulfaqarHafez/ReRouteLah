import { Navigation, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveLocationBannerProps {
  patientName: string;
  isNavigating: boolean;
  isDeviated: boolean;
  lastUpdated: Date | null;
  className?: string;
}

const LiveLocationBanner = ({
  patientName,
  isNavigating,
  isDeviated,
  lastUpdated,
  className,
}: LiveLocationBannerProps) => {
  const getTimeAgo = (date: Date | null): string => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
        isDeviated
          ? "bg-destructive/10 border border-destructive/30"
          : isNavigating
          ? "bg-primary/10 border border-primary/30"
          : "bg-muted border border-border",
        className
      )}
    >
      {/* Status Icon */}
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          isDeviated
            ? "bg-destructive/20 text-destructive"
            : isNavigating
            ? "bg-primary/20 text-primary"
            : "bg-muted-foreground/20 text-muted-foreground"
        )}
      >
        {isDeviated ? (
          <AlertTriangle className="h-5 w-5 animate-pulse" />
        ) : (
          <Navigation className="h-5 w-5" />
        )}
      </div>

      {/* Status Text */}
      <div className="flex-1">
        <p
          className={cn(
            "font-medium",
            isDeviated ? "text-destructive" : "text-foreground"
          )}
        >
          {isDeviated
            ? `${patientName} went off route!`
            : isNavigating
            ? `${patientName} is navigating`
            : `${patientName} is stationary`}
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Updated {getTimeAgo(lastUpdated)}</span>
        </div>
      </div>

      {/* Live Indicator */}
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "h-2 w-2 rounded-full animate-pulse",
            isDeviated ? "bg-destructive" : isNavigating ? "bg-green-500" : "bg-muted-foreground"
          )}
        />
        <span
          className={cn(
            "text-xs font-medium",
            isDeviated ? "text-destructive" : isNavigating ? "text-green-600" : "text-muted-foreground"
          )}
        >
          {isNavigating ? "LIVE" : "IDLE"}
        </span>
      </div>
    </div>
  );
};

export default LiveLocationBanner;
