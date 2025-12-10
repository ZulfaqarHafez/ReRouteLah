import { SavedDestination } from "@/types";
import { MapPin, ChevronRight } from "lucide-react";

interface DestinationCardProps {
  destination: SavedDestination;
  onSelect: (destination: SavedDestination) => void;
}

const DestinationCard = ({ destination, onSelect }: DestinationCardProps) => {
  return (
    <button
      onClick={() => onSelect(destination)}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary hover:shadow-md transition-all group text-left"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-2xl">
        {destination.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
          {destination.name}
        </h3>
        <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {destination.address}
        </p>
      </div>
      <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
};

export default DestinationCard;
