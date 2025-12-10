import { ArrowUp, Compass } from "lucide-react";

interface ARViewProps {
  direction?: "straight" | "left" | "right";
  distance?: string;
}

const ARView = ({ direction = "straight", distance = "50m" }: ARViewProps) => {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b from-muted to-muted/80">
      {/* Simulated camera view background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlMGUwZTAiIGZpbGwtb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMCAwaDIwdjIwSDB6Ii8+PHBhdGggZD0iTTIwIDIwaDIwdjIwSDIweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      {/* Direction Arrow */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative animate-float">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full gradient-primary shadow-glow">
            <ArrowUp 
              className="h-20 w-20 text-primary-foreground" 
              style={{
                transform: direction === "left" ? "rotate(-45deg)" : direction === "right" ? "rotate(45deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease-out"
              }}
            />
          </div>
        </div>

        {/* Distance indicator */}
        <div className="mt-6 rounded-xl bg-card/90 px-6 py-3 shadow-md backdrop-blur-sm">
          <p className="text-center text-2xl font-bold text-foreground">{distance}</p>
          <p className="text-center text-sm text-muted-foreground">to next turn</p>
        </div>
      </div>

      {/* Compass */}
      <div className="absolute top-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-card/90 shadow-md backdrop-blur-sm">
        <Compass className="h-6 w-6 text-primary" />
      </div>

      {/* AR Mode indicator */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-card/90 px-4 py-2 shadow-md backdrop-blur-sm">
        <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
        <span className="text-xs font-medium text-foreground">AR Mode Active</span>
      </div>
    </div>
  );
};

export default ARView;
