'use client';

import { useState } from 'react';
import { User, Shield, ArrowRight } from 'lucide-react';

interface SignInProps {
  onSignIn: (userType: 'patient' | 'caregiver', userData: any) => void;
}

export default function SignIn({ onSignIn }: SignInProps) {
  const [userType, setUserType] = useState<'patient' | 'caregiver' | null>(null);
  const [patientId, setPatientId] = useState('');
  const [caregiverId, setCaregiverId] = useState('');

  const handlePatientSignIn = () => {
    // In production, validate against database
    // For demo, use hardcoded patient
    onSignIn('patient', {
      id: 'P001',
      name: 'Eliza Wong',
      nric: 'S9876543A',
      phone: '9123 4567',
      caregiverName: 'Andrew Wong',
      caregiverPhone: '9876 5432',
      address: 'Blk 123A Punggol Ave 67 #10-15 S123456'
    });
  };

  const handleCaregiverSignIn = () => {
    // In production, validate against database
    onSignIn('caregiver', {
      id: 'C001',
      name: 'Andrew Wong',
      phone: '9876 5432',
      patientId: 'P001',
      patientName: 'Eliza Wong'
    });
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">SmartRoute Care</h1>
            <p className="text-gray-300">Dementia Navigation Assistant</p>
          </div>

          {/* User Type Selection */}
          <div className="space-y-4">
            <button
              onClick={() => setUserType('patient')}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 p-6 rounded-2xl transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Patient</p>
                  <p className="text-sm text-gray-600">I need navigation help</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setUserType('caregiver')}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 p-6 rounded-2xl transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Caregiver</p>
                  <p className="text-sm text-gray-600">Monitor my patient</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400">
              A Singapore Government Agency Initiative
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (userType === 'patient') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8">
          <button
            onClick={() => setUserType(null)}
            className="text-gray-600 hover:text-gray-900 mb-6"
          >
            ← Back
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Patient Sign In</h2>
            <p className="text-gray-600 mt-2">Enter your membership ID</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="e.g., P001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <button
              onClick={handlePatientSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Sign In
            </button>

            {/* Demo Quick Sign In */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 text-center mb-2">Demo Account:</p>
              <button
                onClick={handlePatientSignIn}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-lg text-sm"
              >
                Use Demo Patient (Eliza Wong)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userType === 'caregiver') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8">
          <button
            onClick={() => setUserType(null)}
            className="text-gray-600 hover:text-gray-900 mb-6"
          >
            ← Back
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Caregiver Sign In</h2>
            <p className="text-gray-600 mt-2">Monitor your patient's journey</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caregiver ID
              </label>
              <input
                type="text"
                value={caregiverId}
                onChange={(e) => setCaregiverId(e.target.value)}
                placeholder="e.g., C001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>

            <button
              onClick={handleCaregiverSignIn}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Sign In
            </button>

            {/* Demo Quick Sign In */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 text-center mb-2">Demo Account:</p>
              <button
                onClick={handleCaregiverSignIn}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-lg text-sm"
              >
                Use Demo Caregiver (Andrew Wong)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}