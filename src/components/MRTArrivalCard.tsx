import { Train, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MRTArrivalCardProps {
  line: string; // "Green Line", "Red Line", etc.
  platform?: string; // "Platform 1"
  destination: string;
  arrivalTime: string; // "2 min"
  nextArrival?: string; // "5 min"
  crowdLevel?: "low" | "medium" | "high";
}

const MRTArrivalCard = ({
  line,
  platform = "Platform 1",
  destination,
  arrivalTime,
  nextArrival,
  crowdLevel = "medium",
}: MRTArrivalCardProps) => {
  const getCrowdColor = () => {
    switch (crowdLevel) {
      case "low":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCrowdIcon = () => {
    switch (crowdLevel) {
      case "low":
        return <Users className="h-4 w-4" />;
      case "medium":
        return (
          <>
            <Users className="h-4 w-4" />
            <Users className="h-4 w-4 -ml-2" />
          </>
        );
      case "high":
        return (
          <>
            <Users className="h-4 w-4" />
            <Users className="h-4 w-4 -ml-2" />
            <Users className="h-4 w-4 -ml-2" />
          </>
        );
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getLineColor = () => {
    // Singapore MRT line colors
    if (line.includes("Red") || line.includes("North-South")) return "bg-red-600";
    if (line.includes("Green") || line.includes("East-West")) return "bg-green-600";
    if (line.includes("Purple") || line.includes("North-East")) return "bg-purple-600";
    if (line.includes("Orange") || line.includes("Circle")) return "bg-orange-500";
    if (line.includes("Blue") || line.includes("Downtown")) return "bg-blue-600";
    if (line.includes("Brown") || line.includes("Thomson")) return "bg-amber-700";
    return "bg-purple-600"; // Default purple for MRT
  };

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* MRT Line Icon */}
          <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${getLineColor()} text-white flex-shrink-0`}>
            <Train className="h-8 w-8" />
          </div>

          {/* Train Information */}
          <div className="flex-1 space-y-2">
            {/* Line and Platform */}
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-foreground">{line}</p>
              <Badge variant="outline" className="text-xs">
                {platform}
              </Badge>
            </div>

            {/* Destination */}
            <p className="text-sm text-muted-foreground">
              Towards {destination}
            </p>

            {/* Arrival Times */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xl font-bold text-primary">
                  {arrivalTime}
                </span>
              </div>
              {nextArrival && (
                <div className="text-sm text-muted-foreground">
                  Next: <span className="font-semibold">{nextArrival}</span>
                </div>
              )}
            </div>

            {/* Crowd Level */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getCrowdColor()}`}>
              {getCrowdIcon()}
              <span className="text-xs font-semibold capitalize">
                {crowdLevel} crowd
              </span>
            </div>
          </div>
        </div>

        {/* Service Status Note */}
        <div className="mt-3 text-xs text-muted-foreground italic">
          * Estimated arrival times based on typical service frequency
        </div>
      </CardContent>
    </Card>
  );
};

export default MRTArrivalCard;
