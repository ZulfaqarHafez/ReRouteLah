'use client';

import { useState } from 'react';
import { User, Phone, MapPin, QrCode, ArrowLeft, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

type UserMode = 'patient' | 'caregiver';

interface PatientProfile {
  name: string;
  phoneNumber: string;
  nricNumber: string;
  membershipNumber: string;
  caregiverName: string;
  caregiverPhone: string;
  homeAddress: string;
}

interface CaregiverProfile {
  name: string;
  phoneNumber: string;
  email: string;
  patientsUnderCare: {
    name: string;
    phoneNumber: string;
    lastKnownLocation: string;
  }[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [userMode, setUserMode] = useState<UserMode>('patient');

  // Mock data - replace with actual data from your backend/state management
  const patientData: PatientProfile = {
    name: "Eliza Wong",
    phoneNumber: "9123 4567",
    nricNumber: "S9876543A",
    membershipNumber: "01448199600",
    caregiverName: "Andrew Wong",
    caregiverPhone: "9878 5432",
    homeAddress: "Blk 123A Punggol Ave 67 #10-15\nS123456"
  };

  const caregiverData: CaregiverProfile = {
    name: "Andrew Wong",
    phoneNumber: "9878 5432",
    email: "andrew.wong@email.com",
    patientsUnderCare: [
      {
        name: "Eliza Wong",
        phoneNumber: "9123 4567",
        lastKnownLocation: "Punggol MRT"
      }
    ]
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              color: '#1e40af'
            }}
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Profile</h1>
          
          <div style={{ width: '60px' }}></div>
        </div>

        {/* Mode Toggle */}
        <div style={{
          marginTop: '16px',
          display: 'flex',
          gap: '8px',
          backgroundColor: '#f0f0f0',
          padding: '4px',
          borderRadius: '12px'
        }}>
          <button
            onClick={() => setUserMode('patient')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: userMode === 'patient' ? '#3b82f6' : 'transparent',
              color: userMode === 'patient' ? 'white' : '#666',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Patient Mode
          </button>
          <button
            onClick={() => setUserMode('caregiver')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: userMode === 'caregiver' ? '#3b82f6' : 'transparent',
              color: userMode === 'caregiver' ? 'white' : '#666',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Caregiver Mode
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div style={{ padding: '20px' }}>
        {userMode === 'patient' ? (
          <PatientProfileView profile={patientData} />
        ) : (
          <CaregiverProfileView profile={caregiverData} />
        )}
      </div>
    </div>
  );
}

function PatientProfileView({ profile }: { profile: PatientProfile }) {
  return (
    <div>
      {/* Profile Picture & QR Code Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Profile Picture Placeholder */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={40} color="#9ca3af" />
          </div>

          {/* QR Code */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <QrCode size={100} />
            </div>
            <p style={{ 
              margin: 0, 
              fontSize: '12px', 
              color: '#6b7280',
              textAlign: 'center'
            }}>
              Membership no: {profile.membershipNumber}
            </p>
          </div>
        </div>

        <h2 style={{ 
          marginTop: '20px', 
          marginBottom: '4px',
          fontSize: '24px',
          fontWeight: 700 
        }}>
          {profile.name}
        </h2>
      </div>

      {/* Personal Information */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '18px', 
          fontWeight: 600,
          color: '#1f2937'
        }}>
          Personal Information
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <InfoRow icon={<Phone size={20} />} label="Phone No:" value={profile.phoneNumber} />
          <InfoRow icon={<User size={20} />} label="NRIC No:" value={profile.nricNumber} />
          <InfoRow 
            icon={<Users size={20} />} 
            label="Caregiver Name:" 
            value={profile.caregiverName} 
          />
          <InfoRow 
            icon={<Phone size={20} />} 
            label="Caregiver Phone No:" 
            value={profile.caregiverPhone} 
          />
          <InfoRow 
            icon={<MapPin size={20} />} 
            label="Home Address:" 
            value={profile.homeAddress}
            multiline 
          />
        </div>
      </div>
    </div>
  );
}

function CaregiverProfileView({ profile }: { profile: CaregiverProfile }) {
  const router = useRouter();

  return (
    <div>
      {/* Caregiver Profile Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={40} color="#9ca3af" />
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 700 }}>
              {profile.name}
            </h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Caregiver</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <InfoRow icon={<Phone size={20} />} label="Phone No:" value={profile.phoneNumber} />
          <InfoRow icon={<User size={20} />} label="Email:" value={profile.email} />
        </div>
      </div>

      {/* Patients Under Care */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '18px', 
          fontWeight: 600,
          color: '#1f2937'
        }}>
          Patients Under Care
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {profile.patientsUnderCare.map((patient, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                  {patient.name}
                </h4>
                <span style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  Active
                </span>
              </div>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
                📞 {patient.phoneNumber}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
                📍 Last seen: {patient.lastKnownLocation}
              </p>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginTop: '12px' 
              }}>
                <button
                  onClick={() => router.push('/caregiver-view')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  View Route
                </button>
                <button
                  onClick={() => router.push('/caregiver-camera')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  View Camera
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ 
  icon, 
  label, 
  value, 
  multiline = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  multiline?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: multiline ? 'flex-start' : 'center' }}>
      <div style={{ color: '#6b7280', flexShrink: 0, marginTop: multiline ? '2px' : 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', marginBottom: '2px' }}>
          {label}
        </p>
        <p style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: 500,
          whiteSpace: multiline ? 'pre-line' : 'normal'
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}