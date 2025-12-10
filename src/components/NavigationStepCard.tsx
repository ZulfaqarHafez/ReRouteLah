import { ArrowUp, ArrowRight, ArrowLeft, Bus, MapPin, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationStepCardProps {
  stepNumber: number;
  direction: "straight" | "left" | "right" | "bus" | "destination";
  instruction: string;
  distance?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  onSpeak?: () => void;
  isSpeaking?: boolean;
}

const NavigationStepCard = ({
  stepNumber,
  direction,
  instruction,
  distance,
  isActive = false,
  isCompleted = false,
  onSpeak,
  isSpeaking = false,
}: NavigationStepCardProps) => {
  const getDirectionIcon = () => {
    const iconClass = "h-12 w-12";
    switch (direction) {
      case "straight":
        return <ArrowUp className={iconClass} />;
      case "left":
        return <ArrowLeft className={iconClass} />;
      case "right":
        return <ArrowRight className={iconClass} />;
      case "bus":
        return <Bus className={iconClass} />;
      case "destination":
        return <MapPin className={iconClass} />;
      default:
        return <ArrowUp className={iconClass} />;
    }
  };

  const getDirectionColor = () => {
    if (isCompleted) return "bg-muted text-muted-foreground";
    if (isActive) {
      switch (direction) {
        case "straight":
          return "bg-primary text-primary-foreground";
        case "left":
          return "bg-amber-500 text-white";
        case "right":
          return "bg-amber-500 text-white";
        case "bus":
          return "bg-emerald-500 text-white";
        case "destination":
          return "bg-accent text-accent-foreground";
        default:
          return "bg-primary text-primary-foreground";
      }
    }
    return "bg-muted/50 text-muted-foreground";
  };

  return (
    <div
      className={cn(
        "relative rounded-3xl border-2 p-6 transition-all duration-300",
        isActive
          ? "border-primary bg-card shadow-lg scale-[1.02]"
          : isCompleted
          ? "border-muted bg-muted/30 opacity-60"
          : "border-border bg-card/50"
      )}
    >
      {/* Step number badge */}
      <div
        className={cn(
          "absolute -top-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold",
          isActive
            ? "bg-primary text-primary-foreground"
            : isCompleted
            ? "bg-muted text-muted-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {stepNumber}
      </div>

      <div className="flex items-center gap-6">
        {/* Large direction icon */}
        <div
          className={cn(
            "flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl transition-colors",
            getDirectionColor()
          )}
        >
          {getDirectionIcon()}
        </div>

        {/* Instruction text */}
        <div className="flex-1 space-y-2">
          <p
            className={cn(
              "text-xl font-bold leading-tight",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {instruction}
          </p>
          {distance && (
            <p
              className={cn(
                "text-lg font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {distance}
            </p>
          )}
        </div>

        {/* Voice button */}
        {onSpeak && isActive && (
          <Button
            onClick={onSpeak}
            variant="outline"
            size="icon"
            className={cn(
              "h-14 w-14 shrink-0 rounded-xl border-2",
              isSpeaking && "bg-primary text-primary-foreground border-primary"
            )}
          >
            {isSpeaking ? (
              <VolumeX className="h-7 w-7" />
            ) : (
              <Volume2 className="h-7 w-7" />
            )}
          </Button>
        )}
      </div>

      {/* Active indicator pulse */}
      {isActive && (
        <div className="absolute -inset-px rounded-3xl border-2 border-primary animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

export default NavigationStepCard;
