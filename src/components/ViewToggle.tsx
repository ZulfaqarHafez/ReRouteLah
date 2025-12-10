import { Map, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "map" | "ar";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-card p-1 shadow-md">
      <Button
        variant={currentView === "map" ? "hero" : "ghost"}
        size="sm"
        onClick={() => onViewChange("map")}
        className={cn(
          "gap-2 rounded-lg",
          currentView !== "map" && "text-muted-foreground"
        )}
      >
        <Map className="h-4 w-4" />
        Map
      </Button>
      <Button
        variant={currentView === "ar" ? "hero" : "ghost"}
        size="sm"
        onClick={() => onViewChange("ar")}
        className={cn(
          "gap-2 rounded-lg",
          currentView !== "ar" && "text-muted-foreground"
        )}
      >
        <Camera className="h-4 w-4" />
        AR
      </Button>
    </div>
  );
};

export default ViewToggle;
