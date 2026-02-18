export default function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Welcome, Dr.!</h1>
        <p className="text-slate-600">Manage your patients and consultations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-navy-600">0</div>
          <p className="text-slate-600 text-sm mt-2">Active Patients</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-navy-600">0</div>
          <p className="text-slate-600 text-sm mt-2">Today's Appointments</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-navy-600">0</div>
          <p className="text-slate-600 text-sm mt-2">Unread Messages</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-navy-600">0</div>
          <p className="text-slate-600 text-sm mt-2">Pending Consultations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4">My Patients</h2>
          <div className="text-center py-8">
            <p className="text-slate-500">No patients yet</p>
            <button className="mt-4 px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors">
              View Patient Requests
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              📅 View Schedule
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              📋 Manage Patient Records
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              💊 Prescription Management
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              ⚙️ Profile Settings
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Patient Messages</h2>
        <div className="text-center py-8">
          <p className="text-slate-500">No messages yet</p>
        </div>
      </div>
    </div>
  )
}
