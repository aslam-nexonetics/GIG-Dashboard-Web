'use client';

import React from 'react';
import { CreditCard, CheckCircle2, Clock } from 'lucide-react';
import { PaymentItem } from '@/types/gig';

interface PaymentsManagementProps {
  payments: PaymentItem[];
}

export const PaymentsManagement: React.FC<PaymentsManagementProps> = ({ payments }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Payments & Financial Ledger</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Monitor payments across cash, UPI QR, and bank transfers for completed GIG jobs.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-3.5 px-4">Payment ID</th>
                <th className="py-3.5 px-4">Job Title</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Technician</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">No payment records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Completed transactions and job payouts will be logged here.</p>
                  </td>
                </tr>
              ) : (
                payments.map((pmt) => (
                  <tr key={pmt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-medium text-slate-500 text-xs">#{pmt.id}</td>
                    <td className="py-4 px-4 font-bold text-slate-900 max-w-xs truncate">{pmt.jobTitle}</td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-800">{pmt.clientName}</td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-800">{pmt.providerName}</td>
                    <td className="py-4 px-4 font-extrabold text-emerald-600">₹{pmt.amount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-700 uppercase">{pmt.paymentMethod}</td>
                    <td className="py-4 px-4">
                      {pmt.paymentStatus === 'paid' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Pending Confirmation
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400">{pmt.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
