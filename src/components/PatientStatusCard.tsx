import { PatientInfo, SavedDestination } from "@/types";
import { MapPin, Navigation2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PatientStatusCardProps {
  patient: PatientInfo;
  destination: SavedDestination | null;
  onViewOnMap: () => void;
  isDeviated?: boolean;
}

const PatientStatusCard = ({ 
  patient, 
  destination, 
  onViewOnMap,
  isDeviated = false,
}: PatientStatusCardProps) => {
  return (
    <div className={cn(
      "p-4 rounded-2xl bg-card border space-y-4 transition-colors",
      isDeviated 
        ? "border-destructive/50 bg-destructive/5" 
        : "border-border"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full text-2xl",
          isDeviated ? "bg-destructive/20" : "bg-accent"
        )}>
          {patient.avatar}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground">{patient.name}</h3>
          <div className="flex items-center gap-2">
            {isDeviated ? (
              <span className="flex items-center gap-1 text-sm text-destructive font-medium">
                <AlertTriangle className="h-4 w-4 animate-pulse" />
                Off Route!
              </span>
            ) : destination ? (
              <span className="flex items-center gap-1 text-sm text-primary font-medium">
                <Navigation2 className="h-4 w-4" />
                Navigating
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                At Location
              </span>
            )}
          </div>
        </div>
      </div>

      {destination && (
        <div className={cn(
          "p-3 rounded-xl border",
          isDeviated 
            ? "bg-destructive/10 border-destructive/30" 
            : "bg-accent/50 border-primary/20"
        )}>
          <p className="text-sm text-muted-foreground">Heading to</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg">{destination.icon}</span>
            <span className="text-lg font-bold text-foreground">{destination.name}</span>
          </div>
        </div>
      )}

      <Button
        onClick={onViewOnMap}
        className="w-full rounded-xl"
        variant={isDeviated ? "destructive" : "outline"}
      >
        <MapPin className="h-4 w-4 mr-2" />
        {isDeviated ? "View Location Now" : "View on Map"}
      </Button>
    </div>
  );
};

export default PatientStatusCard;
