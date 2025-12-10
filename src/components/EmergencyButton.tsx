import { ShieldAlert, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface EmergencyButtonProps {
  onEmergency?: () => void;
}

const EmergencyButton = ({ onEmergency }: EmergencyButtonProps) => {
  const handleEmergencyClick = () => {
    toast({
      title: "Finding safe location...",
      description: "Locating nearest Dementia Go-To Point",
    });
    onEmergency?.();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        variant="emergency"
        size="icon-xl"
        onClick={handleEmergencyClick}
        className="relative"
        aria-label="I'm Lost - Find Safe Location"
      >
        <ShieldAlert className="h-10 w-10" />
        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card text-xs font-bold text-emergency shadow-md">
          <Phone className="h-3 w-3" />
        </span>
      </Button>
      <span className="text-center text-sm font-semibold text-muted-foreground">
        I'm Lost
      </span>
    </div>
  );
};

export default EmergencyButton;
