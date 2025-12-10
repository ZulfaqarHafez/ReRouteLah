import { MapPin, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RoleSelectionPageProps {
  onSelectRole: (role: "patient" | "caregiver") => void;
}

const RoleSelectionPage = ({ onSelectRole }: RoleSelectionPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      {/* Header */}
      <header className="p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">ReRouteLah</h1>
        <p className="text-muted-foreground mt-2">Safe navigation for everyone</p>
      </header>

      {/* Role Selection */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12 gap-6">
        <h2 className="text-xl font-semibold text-foreground text-center mb-4">
          How will you use the app?
        </h2>

        <Card 
          className="w-full max-w-sm cursor-pointer hover:border-primary transition-all hover:shadow-elegant"
          onClick={() => onSelectRole("patient")}
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">I'm a Traveler</CardTitle>
            <CardDescription>
              I need help navigating to my destinations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg">
              Continue as Traveler
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="w-full max-w-sm cursor-pointer hover:border-secondary transition-all hover:shadow-elegant"
          onClick={() => onSelectRole("caregiver")}
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
              <Users className="h-8 w-8 text-secondary-foreground" />
            </div>
            <CardTitle className="text-xl">I'm a Caregiver</CardTitle>
            <CardDescription>
              I help someone navigate safely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full" size="lg">
              Continue as Caregiver
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RoleSelectionPage;
