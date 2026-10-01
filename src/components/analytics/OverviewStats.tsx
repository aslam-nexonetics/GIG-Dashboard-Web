'use client';

import React from 'react';
import { Users, ShieldCheck, Briefcase, DollarSign, ArrowUpRight } from 'lucide-react';
import { GigStats, ProviderItem, JobItem } from '@/types/gig';

interface OverviewStatsProps {
  stats: GigStats;
  providers: ProviderItem[];
  jobs: JobItem[];
  onNavigate: (tab: string) => void;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({
  stats,
  providers,
  jobs,
  onNavigate,
}) => {
  const kpiCards = [
    {
      title: 'Total Service Providers',
      value: stats.totalProviders,
      subtitle: `${stats.approvedProviders} Approved, ${stats.pendingApprovals} Pending`,
      icon: Users,
      color: 'bg-blue-500 text-white shadow-blue-500/20',
      actionTab: 'providers',
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingApprovals,
      subtitle: 'Requires identity & selfie approval',
      icon: ShieldCheck,
      color: 'bg-amber-500 text-white shadow-amber-500/20',
      actionTab: 'verifications',
    },
    {
      title: 'Active Marketplace Jobs',
      value: stats.activeJobs,
      subtitle: `${stats.completedJobs} total completed jobs`,
      icon: Briefcase,
      color: 'bg-purple-500 text-white shadow-purple-500/20',
      actionTab: 'jobs',
    },
    {
      title: 'Total GIG Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      subtitle: 'Across all completed bookings',
      icon: DollarSign,
      color: 'bg-emerald-500 text-white shadow-emerald-500/20',
      actionTab: 'payments',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100 border border-white/20">
            GIG Collection Control Center
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Welcome to Nexonetics GIG Management
          </h2>
          <p className="text-sm text-blue-100 opacity-90 leading-relaxed">
            Monitor real-time instant technician availability, approve identity & biometric verifications, manage service bidding, and review transaction ledgers.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigate('providers')}
              className="px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              Manage Users <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('verifications')}
              className="px-5 py-2.5 bg-blue-600/60 hover:bg-blue-600 text-white font-semibold rounded-xl text-xs transition-all border border-white/20 cursor-pointer"
            >
              Review Verification Queue ({stats.pendingApprovals})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(kpi.actionTab)}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
                <p className="text-xs text-slate-500 mt-1 font-normal">{kpi.subtitle}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>View Breakdown</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Registrations & Live Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations Queue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Recent User Registrations
            </h3>
            <button
              onClick={() => onNavigate('providers')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {providers.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="text-xs font-semibold text-slate-600">No registered providers</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Technicians and service providers will appear here</p>
              </div>
            ) : (
              providers.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${p.avatarBgColor}`}>
                      {p.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{p.name}</h4>
                      <span className="text-[11px] text-slate-400">{p.specialization} • {p.city}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      p.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Active Marketplace Jobs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" /> Live Job Postings
            </h3>
            <button
              onClick={() => onNavigate('jobs')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All Jobs
            </button>
          </div>

          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="text-xs font-semibold text-slate-600">No active job postings</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Marketplace jobs and requests will appear here</p>
              </div>
            ) : (
              jobs.slice(0, 4).map((j) => (
                <div
                  key={j.id}
                  className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                      {j.title}
                    </span>
                    <span className="font-extrabold text-xs text-emerald-600">₹{j.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Client: {j.clientName}</span>
                    <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                      {j.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
