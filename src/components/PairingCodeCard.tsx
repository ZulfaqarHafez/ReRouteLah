import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PairingCodeCardProps {
  pairingCode: string;
  patientName: string;
}

export default function PairingCodeCard({ pairingCode, patientName }: PairingCodeCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(pairingCode);
    toast({
      title: "Copied!",
      description: "Pairing code copied to clipboard",
    });
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Link with Caregiver</CardTitle>
        </div>
        <CardDescription>
          Share this code with your caregiver to link your accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-background border-2 border-dashed border-primary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Your Pairing Code</p>
              <p className="text-3xl font-bold font-mono tracking-wider text-primary">
                {pairingCode}
              </p>
            </div>
          </div>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Code
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Your caregiver can use this code to link to your account and monitor your navigation
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
