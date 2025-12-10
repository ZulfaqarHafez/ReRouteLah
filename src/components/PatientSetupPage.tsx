import { useState } from "react";
import { MapPin, ArrowLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PatientSetupPageProps {
  onBack: () => void;
  onComplete: (name: string, phone: string) => void;
  pairingCode?: string;
}

const PatientSetupPage = ({ onBack, onComplete, pairingCode }: PatientSetupPageProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "code">("form");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Generate a temporary code for display
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
    setStep("code");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast({
      title: "Code copied!",
      description: "Share this code with your caregiver.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
    onComplete(name, phone);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">ReRouteLah</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {step === "form" ? (
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Traveler Setup</CardTitle>
              <CardDescription>
                Enter your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <Input
                    id="phone"
                    placeholder="+65 9123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Your Pairing Code</CardTitle>
              <CardDescription>
                Share this code with your caregiver so they can link to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-xl p-6 text-center">
                <p className="text-4xl font-mono font-bold tracking-[0.3em] text-primary">
                  {generatedCode}
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleCopyCode}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>

              <div className="text-sm text-muted-foreground text-center">
                <p>Your caregiver can use this code to:</p>
                <ul className="mt-2 space-y-1">
                  <li>• See your location</li>
                  <li>• Manage your destinations</li>
                  <li>• Get alerts when you need help</li>
                </ul>
              </div>

              <Button className="w-full" size="lg" onClick={handleFinish}>
                Start Using App
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PatientSetupPage;
