'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Welcome, {user?.name}!</h1>
        <p className="text-slate-600">Manage your health and connect with doctors</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-navy-600">0</div>
          <p className="text-slate-600 text-sm mt-2">Active Consultations</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-navy-600">0</div>
          <p className="text-slate-600 text-sm mt-2">Upcoming Appointments</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-navy-600">0</div>
          <p className="text-slate-600 text-sm mt-2">Messages</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-navy-600">0</div>
          <p className="text-slate-600 text-sm mt-2">Prescriptions</p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Consultations */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Recent Consultations</h2>
          <div className="text-center py-8">
            <p className="text-slate-500">No consultations yet</p>
            <button className="mt-4 px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors">
              Find a Doctor
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              📹 Schedule Video Consultation
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              📋 View Medical Records
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              💊 View Prescriptions
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              🔍 Find a Doctor
            </button>
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Messages</h2>
        <div className="text-center py-8">
          <p className="text-slate-500">No messages yet</p>
        </div>
      </div>
    </div>
  );
}
