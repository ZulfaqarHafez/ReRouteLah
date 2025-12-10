import { ArrowUp, ArrowLeft, ArrowRight, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

type Direction = "straight" | "left" | "right" | "destination";

interface NavigationInstructionProps {
  direction: Direction;
  distance: string;
  instruction: string;
  isActive?: boolean;
}

const directionIcons: Record<Direction, React.ReactNode> = {
  straight: <ArrowUp className="h-8 w-8" />,
  left: <ArrowLeft className="h-8 w-8" />,
  right: <ArrowRight className="h-8 w-8" />,
  destination: <MapPin className="h-8 w-8" />,
};

const NavigationInstruction = ({
  direction,
  distance,
  instruction,
  isActive = false,
}: NavigationInstructionProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl p-4 transition-all",
        isActive
          ? "bg-primary text-primary-foreground shadow-lg"
          : "bg-card text-foreground shadow-md"
      )}
    >
      <div
        className={cn(
          "flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl",
          isActive ? "bg-primary-foreground/20" : "gradient-primary text-primary-foreground"
        )}
      >
        {directionIcons[direction]}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("text-lg font-bold", isActive ? "" : "text-foreground")}>
          {instruction}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Navigation className="h-4 w-4" />
          <span className={cn("text-sm", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {distance}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NavigationInstruction;
