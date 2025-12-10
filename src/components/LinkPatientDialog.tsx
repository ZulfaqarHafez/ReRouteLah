import { useState } from "react";
import { Link2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface LinkPatientDialogProps {
  trigger?: React.ReactNode;
}

const LinkPatientDialog = ({ trigger }: LinkPatientDialogProps) => {
  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);
  const { linkPatient, getPatientByCode } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const patient = getPatientByCode(code.toUpperCase());
    if (!patient) {
      toast({
        title: "Invalid code",
        description: "No traveler found with this pairing code. Please check and try again.",
        variant: "destructive",
      });
      return;
    }

    const success = linkPatient(code.toUpperCase());
    if (success) {
      toast({
        title: "Traveler linked!",
        description: `You are now connected to ${patient.name}.`,
      });
      setCode("");
      setOpen(false);
    } else {
      toast({
        title: "Link failed",
        description: "Unable to link traveler. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Link Traveler
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Link a Traveler
          </DialogTitle>
          <DialogDescription>
            Enter the 6-character pairing code from your traveler's app to connect.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pairing-code">Pairing Code</Label>
            <Input
              id="pairing-code"
              placeholder="ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center text-2xl font-mono tracking-[0.2em]"
              maxLength={6}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={code.length !== 6}>
              Link Traveler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LinkPatientDialog;
