'use client';

import React from 'react';
import { FileText, CheckCircle2, Clock, XCircle, DollarSign, User } from 'lucide-react';
import { ProposalItem } from '@/types/gig';

interface ProposalsManagementProps {
  proposals: ProposalItem[];
}

export const ProposalsManagement: React.FC<ProposalsManagementProps> = ({ proposals }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Proposals & Bidding Hub</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Review active provider quotes, proposed price bids, duration estimates, and hiring results.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-3.5 px-4">Job Title</th>
                <th className="py-3.5 px-4">Provider Bidding</th>
                <th className="py-3.5 px-4">Proposed Price</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Proposal Message</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submitted On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proposals.map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-semibold text-slate-900 max-w-xs truncate">
                    {prop.jobTitle}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-800">{prop.providerName}</div>
                    <span className="text-xs text-slate-400">{prop.providerSpecialization}</span>
                  </td>
                  <td className="py-4 px-4 font-bold text-emerald-600">
                    ₹{prop.proposedPrice.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-slate-700">
                    {prop.estimatedDuration}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500 max-w-sm">
                    <p className="line-clamp-2">{prop.message}</p>
                  </td>
                  <td className="py-4 px-4">
                    {prop.status === 'accepted' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                      </span>
                    ) : prop.status === 'rejected' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-400">{prop.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
