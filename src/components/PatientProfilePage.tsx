'use client';

import { QRCodeSVG } from "qrcode.react";
import { Phone, User, Home, ArrowLeft } from "lucide-react";
import { PatientInfo } from "@/types";
import { Button } from "@/components/ui/button";

interface PatientProfilePageProps {
  patient: PatientInfo;
  onBack: () => void;
}

const PatientProfilePage = ({ patient, onBack }: PatientProfilePageProps) => {
  const { profile } = patient;
  
  const handleEmergencyCall = () => {
    window.location.href = `tel:${patient.guardianPhone}`;
  };

  // Generate QR code data with patient info for passerby assistance
  const qrData = JSON.stringify({
    name: profile.name,
    membershipNo: profile.membershipNo,
    emergencyContact: patient.guardianPhone,
    message: "This person may need assistance. Please help them contact their caregiver."
  });

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-lg font-bold text-white">GuideMeSG</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-slate-400" />
            <User className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-700 border-2 border-slate-600">
            <User className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{profile.name}</h1>
            <p className="text-slate-400">Patient Profile</p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex gap-4">
          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG 
              value={qrData} 
              size={80}
              level="M"
            />
          </div>
          <div className="flex-1 flex items-center">
            <p className="text-slate-400 text-sm text-center w-full">
              Membership no: {profile.membershipNo}
            </p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
            Personal Information
          </h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-slate-500 text-sm">Phone No:</p>
              <p className="text-white font-medium">{profile.phone}</p>
            </div>
            
            <div>
              <p className="text-slate-500 text-sm">NRIC No:</p>
              <p className="text-white font-medium">{profile.nricNo}</p>
            </div>
            
            <div>
              <p className="text-slate-500 text-sm">Caregiver Name:</p>
              <p className="text-white font-medium">
                {/* This would come from caregiver data */}
                Andrew Wong
              </p>
            </div>
            
            <div>
              <p className="text-slate-500 text-sm">Caregiver Phone No:</p>
              <p className="text-white font-medium">{patient.guardianPhone.replace("+65", "")}</p>
            </div>
            
            <div>
              <p className="text-slate-500 text-sm">Home Address:</p>
              <p className="text-white font-medium">{profile.homeAddress}</p>
              <p className="text-white font-medium">{profile.postalCode}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4">
          <Button
            onClick={handleEmergencyCall}
            className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg rounded-lg flex items-center justify-center gap-2"
          >
            <Phone className="h-5 w-5" />
            Emergency Contact
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientProfilePage;
