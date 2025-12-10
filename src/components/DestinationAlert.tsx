import { Bell, Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DestinationAlertProps {
  patientName: string;
  destinationName: string;
  destinationAddress: string;
  timestamp: string;
  onDismiss: () => void;
  onViewMap?: () => void;
}

const DestinationAlert = ({
  patientName,
  destinationName,
  destinationAddress,
  timestamp,
  onDismiss,
  onViewMap,
}: DestinationAlertProps) => {
  return (
    <Card className="border-2 border-blue-200 bg-blue-50 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white flex-shrink-0">
            <Bell className="h-6 w-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900">
                  {patientName} is navigating
                </h3>
                <p className="text-sm text-blue-700">
                  {new Date(timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="h-8 w-8 rounded-full hover:bg-blue-100 flex-shrink-0"
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4 text-blue-700" />
              </Button>
            </div>

            {/* Destination Info */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-600" />
                <p className="text-base font-semibold text-blue-900">
                  {destinationName}
                </p>
              </div>
              <p className="text-sm text-blue-700 pl-6">
                {destinationAddress}
              </p>
            </div>

            {/* Action Button */}
            {onViewMap && (
              <Button
                onClick={onViewMap}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                View on Map
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DestinationAlert;
