import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface CallGuardianButtonProps {
  guardianPhone: string;
  guardianName?: string;
}

const CallGuardianButton = ({ guardianPhone, guardianName = "Guardian" }: CallGuardianButtonProps) => {
  const handleCall = () => {
    // Trigger the phone's native dialer
    window.location.href = `tel:${guardianPhone}`;
    
    toast({
      title: `Calling ${guardianName}...`,
      description: "Your guardian will be able to help you.",
    });
  };

  return (
    <Button
      onClick={handleCall}
      className="w-full h-16 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
      size="lg"
    >
      <Phone className="h-6 w-6 mr-3" />
      Call {guardianName}
    </Button>
  );
};

export default CallGuardianButton;
