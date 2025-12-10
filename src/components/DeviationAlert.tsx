import { AlertTriangle, Phone, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientInfo } from "@/types";

interface DeviationAlertProps {
  patient: PatientInfo;
  deviationDistance?: number;
  onDismiss: () => void;
  onViewOnMap: () => void;
  onCallPatient: () => void;
}

export default function DeviationAlert(props: DeviationAlertProps) {
  // Destructure props inside the component to ensure they are captured
  const { patient, deviationDistance, onDismiss, onViewOnMap, onCallPatient } = props;

  const handleCall = () => {
    if (typeof onCallPatient === 'function') {
      onCallPatient();
    }
  };

  const handleViewLocation = () => {
    if (typeof onViewOnMap === 'function') {
      onViewOnMap();
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  };

  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-[#1A1A1A] text-white shadow-2xl border border-red-500/50 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between bg-red-600 px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-white fill-white" />
            <h2 className="text-lg font-bold text-white">Route Deviation Alert</h2>
          </div>
          <button 
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-red-700"
            aria-label="Close alert"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-2xl border border-gray-600">
              {patient.avatar || "👤"}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{patient.name}</h3>
              <p className="text-gray-400">Has gone off the planned route</p>
            </div>
          </div>

          {/* Distance Card */}
          <div className="rounded-2xl bg-red-950/30 border border-red-900/50 p-6 text-center">
            <div className="text-5xl font-bold text-red-500 drop-shadow-sm">
              {Math.round(deviationDistance || patient.deviationDistance || 0)}m
            </div>
            <p className="text-gray-400 mt-2 font-medium">from planned route</p>
          </div>

          <p className="text-center text-gray-300 text-sm leading-relaxed">
            The patient may need assistance. Please check on them.
          </p>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={handleViewLocation}
              className="h-14 rounded-xl border-gray-700 bg-transparent text-white hover:bg-gray-800 hover:text-white"
            >
              <MapPin className="mr-2 h-5 w-5" />
              View Location
            </Button>
            <Button 
              onClick={handleCall}
              className="h-14 rounded-xl bg-[#2DD4BF] text-black hover:bg-[#26b8a5] font-bold"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Patient
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
