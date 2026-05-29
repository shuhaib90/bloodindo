'use client';

import HospitalRequestCard from '@/components/hospital/HospitalRequestCard';
import { PlusCircle, Activity } from 'lucide-react';

export default function HospitalDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Active Emergencies</h1>
          <p className="text-neutral-400 mt-1">Manage and track your facility's blood requests in real-time.</p>
        </div>
        <button className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-red-900/20">
          <PlusCircle className="w-5 h-5" />
          Create Request
        </button>
      </div>

      {/* Grid of Request Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <HospitalRequestCard 
          bloodType="O-"
          unitsNeeded={4}
          urgency="Critical"
          status="Pending"
          donorsResponding={2}
          timeAgo="10 mins ago"
        />
        <HospitalRequestCard 
          bloodType="A+"
          unitsNeeded={2}
          urgency="High"
          status="Pending"
          donorsResponding={1}
          timeAgo="1 hour ago"
        />
        <HospitalRequestCard 
          bloodType="AB+"
          unitsNeeded={1}
          urgency="Normal"
          status="Pending"
          donorsResponding={0}
          timeAgo="3 hours ago"
        />
      </div>

      {/* Stats Section */}
      <div className="mt-12 pt-8 border-t border-neutral-800">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-500" />
          Quick Analytics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
            <p className="text-neutral-400 text-sm font-medium">Total Requests (This Month)</p>
            <p className="text-3xl font-black text-white mt-2">24</p>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
            <p className="text-neutral-400 text-sm font-medium">Fulfilled</p>
            <p className="text-3xl font-black text-green-400 mt-2">18</p>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
            <p className="text-neutral-400 text-sm font-medium">Average Response Time</p>
            <p className="text-3xl font-black text-white mt-2">14m</p>
          </div>
        </div>
      </div>
    </div>
  );
}
