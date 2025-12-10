import { AlertTriangle, Phone, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientInfo } from "@/types/app";

interface DeviationAlertProps {
  patient: PatientInfo;
  deviationDistance: number;
  onDismiss: () => void;
  onViewOnMap: () => void;
  onCallPatient: () => void;
}

const DeviationAlert = ({
  patient,
  deviationDistance,
  onDismiss,
  onViewOnMap,
  onCallPatient,
}: DeviationAlertProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border-2 border-destructive rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-destructive px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-destructive-foreground">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <span className="font-bold">Route Deviation Alert</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive-foreground hover:bg-destructive-foreground/20"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-2xl">
              {patient.avatar}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">
                Has gone off the planned route
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-center">
              <span className="text-3xl font-bold text-destructive">
                {Math.round(deviationDistance)}m
              </span>
              <br />
              <span className="text-sm text-muted-foreground">from planned route</span>
            </p>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            The patient may need assistance. Please check on them.
          </p>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-14 flex-col gap-1"
              onClick={onViewOnMap}
            >
              <MapPin className="h-5 w-5" />
              <span className="text-xs">View Location</span>
            </Button>
            <Button
              className="h-14 flex-col gap-1 bg-primary"
              onClick={onCallPatient}
            >
              <Phone className="h-5 w-5" />
              <span className="text-xs">Call Patient</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviationAlert;
