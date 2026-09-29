'use client';

import React, { useState } from 'react';
import { ShieldCheck, Check, X, Eye, FileText, UserCheck, MapPin, AlertCircle } from 'lucide-react';
import { ProviderItem } from '@/types/gig';
import { Modal } from '@/components/common/Modal';

interface VerificationQueueProps {
  providers: ProviderItem[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export const VerificationQueue: React.FC<VerificationQueueProps> = ({
  providers,
  onApprove,
  onReject,
}) => {
  const pendingProviders = providers.filter((p) => p.status === 'pending');
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Identity & Biometric Verification Queue
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Inspect government photo IDs, biometric selfie matches, and location metadata.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            {pendingProviders.length} Pending Approval
          </span>
        </div>
      </div>

      {/* Grid of Verification Cards */}
      {pendingProviders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-400 space-y-2">
          <UserCheck className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
          <h3 className="text-base font-bold text-slate-800">All verifications completed!</h3>
          <p className="text-xs text-slate-500">There are no pending identity review requests in the queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingProviders.map((provider) => {
            const initials = provider.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase();

            return (
              <div
                key={provider.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/40">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs ${provider.avatarBgColor}`}
                      >
                        {initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{provider.name}</h4>
                        <span className="text-xs text-slate-400">{provider.specialization}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Pending
                    </span>
                  </div>

                  {/* Document Preview Row */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {/* ID Front Preview */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          {provider.idType || 'Govt ID'}
                        </span>
                        <div
                          onClick={() => setSelectedProvider(provider)}
                          className="h-28 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer relative group"
                        >
                          {provider.idFrontUrl ? (
                            <img
                              src={provider.idFrontUrl}
                              alt="ID"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs text-slate-400">
                              No image
                            </div>
                          )}
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                            Inspect ID
                          </div>
                        </div>
                      </div>

                      {/* Biometric Selfie Preview */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          Biometric Selfie
                        </span>
                        <div
                          onClick={() => setSelectedProvider(provider)}
                          className="h-28 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer relative group"
                        >
                          {provider.selfieUrl ? (
                            <img
                              src={provider.selfieUrl}
                              alt="Selfie"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs text-slate-400">
                              No selfie
                            </div>
                          )}
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                            Inspect Selfie
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata summary */}
                    <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">ID Number:</span>
                        <span className="font-mono font-medium text-slate-800">
                          {provider.idNumber || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Location:</span>
                        <span className="font-medium text-slate-800">
                          {provider.area}, {provider.city}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 bg-slate-50/60 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onApprove(provider.id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve ID
                  </button>

                  <button
                    onClick={() => onReject(provider.id)}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Inspection Modal */}
      <Modal
        isOpen={!!selectedProvider}
        onClose={() => setSelectedProvider(null)}
        title={selectedProvider ? `Verification - ${selectedProvider.name}` : ''}
        subtitle="Full resolution document verification"
        maxWidth="max-w-4xl"
      >
        {selectedProvider && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  {selectedProvider.idType || 'Government ID Front'}
                </span>
                <img
                  src={selectedProvider.idFrontUrl}
                  alt="Front ID"
                  className="w-full h-64 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Biometric Facial Selfie
                </span>
                <img
                  src={selectedProvider.selfieUrl}
                  alt="Biometric Selfie"
                  className="w-full h-64 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onApprove(selectedProvider.id);
                  setSelectedProvider(null);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all shadow-xs"
              >
                Approve Verification
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
