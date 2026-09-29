'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  RotateCcw,
  Check,
  X,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Star,
  Activity,
  Award,
} from 'lucide-react';
import { ProviderItem, ProviderStatus } from '@/types/gig';
import { Modal } from '@/components/common/Modal';

interface ProviderManagementProps {
  providers: ProviderItem[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onResetVerification: (id: number) => void;
}

export const ProviderManagement: React.FC<ProviderManagementProps> = ({
  providers,
  onApprove,
  onReject,
  onResetVerification,
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal inspection state
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);

  // Selected row checkboxes
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Unique roles for filter dropdown
  const availableRoles = useMemo(() => {
    const roles = Array.from(new Set(providers.map((p) => p.specialization)));
    return ['all', ...roles];
  }, [providers]);

  // Filtered providers calculation
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mobile.includes(searchTerm);

      const matchRole =
        selectedRole === 'all' || p.specialization.toLowerCase() === selectedRole.toLowerCase();

      const matchStatus =
        selectedStatus === 'all' || p.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchRole && matchStatus;
    });
  }, [providers, searchTerm, selectedRole, selectedStatus]);

  // Pagination slice
  const totalPages = Math.ceil(filteredProviders.length / pageSize) || 1;
  const paginatedProviders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProviders.slice(start, start + pageSize);
  }, [filteredProviders, currentPage, pageSize]);

  // Handle select all rows on current page
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(paginatedProviders.map((p) => p.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  // Helper badge color for Role/Specialization
  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case 'user':
      case 'electrician':
        return 'bg-blue-100/80 text-blue-700 border-blue-200';
      case 'creator':
      case 'plumber':
        return 'bg-purple-100/80 text-purple-700 border-purple-200';
      case 'admin':
      case 'ac service':
        return 'bg-rose-100/80 text-rose-700 border-rose-200';
      case 'painter':
        return 'bg-pink-100/80 text-pink-700 border-pink-200';
      case 'carpenter':
        return 'bg-amber-100/80 text-amber-700 border-amber-200';
      default:
        return 'bg-teal-100/80 text-teal-700 border-teal-200';
    }
  };

  // Helper badge for Status
  const getStatusBadge = (status: ProviderStatus) => {
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100/80 text-emerald-800 border border-emerald-200/80">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Approved
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-100/80 text-rose-800 border border-rose-200/80">
          <X className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100/80 text-amber-800 border border-amber-200/80">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Top Page Header Block (Matches Screenshot Title) ────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Users Management</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              View and manage all registered users. Approve or reject their access.
            </p>
          </div>
        </div>
      </div>

      {/* ── Search and Filters Control Bar ──────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, email, mobile or username..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Role Dropdown */}
        <div className="w-full md:w-44">
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">All Roles</option>
            {availableRoles
              .filter((r) => r !== 'all')
              .map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="w-full md:w-44">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleResetFilters}
          className="w-full md:w-auto px-4 py-2.5 border border-sky-300 text-sky-600 hover:bg-sky-50 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* ── Main Data Table Card Container (Direct Replica of Screenshot) ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Card Title Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            Users List
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              ({filteredProviders.length})
            </span>
          </h3>

          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  selectedRows.forEach((id) => onApprove(id));
                  setSelectedRows([]);
                }}
                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Approve Selected ({selectedRows.length})
              </button>
            </div>
          )}
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      paginatedProviders.length > 0 &&
                      paginatedProviders.every((p) => selectedRows.includes(p.id))
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3 w-12 text-slate-400">#</th>
                <th className="py-3.5 px-4 font-semibold text-slate-600">Name</th>
                <th className="py-3.5 px-4 font-semibold text-slate-600">Email</th>
                <th className="py-3.5 px-4 font-semibold text-slate-600">Mobile</th>
                <th className="py-3.5 px-4 font-semibold text-slate-600">Role</th>
                <th className="py-3.5 px-4 font-semibold text-slate-600">Status</th>
                <th className="py-3.5 px-4 font-semibold text-slate-600">Registered On</th>
                <th className="py-3.5 px-4 text-center font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedProviders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 opacity-30 text-slate-400" />
                      <p className="font-medium text-slate-500">No users found matching filters</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-1 text-xs text-blue-600 hover:underline font-semibold"
                      >
                        Clear search & filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProviders.map((provider, index) => {
                  const itemIndex = (currentPage - 1) * pageSize + index + 1;
                  const initials = provider.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={provider.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(provider.id)}
                          onChange={() => handleSelectRow(provider.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Row Index */}
                      <td className="py-4 px-3 text-xs font-semibold text-slate-400">
                        {itemIndex}
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${provider.avatarBgColor}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 leading-snug flex items-center gap-1.5">
                              <span>{provider.name}</span>
                              <button
                                onClick={() => setSelectedProvider(provider)}
                                className="text-slate-300 hover:text-blue-600 p-0.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="View Provider Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-xs text-slate-400 font-normal">
                              {provider.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-slate-600 font-normal text-xs md:text-sm">
                        {provider.email}
                      </td>

                      {/* Mobile */}
                      <td className="py-4 px-4 text-slate-600 font-normal text-xs md:text-sm">
                        {provider.mobile}
                      </td>

                      {/* Role / Specialization */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(
                            provider.specialization
                          )}`}
                        >
                          {provider.specialization}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">{getStatusBadge(provider.status)}</td>

                      {/* Registered On */}
                      <td className="py-4 px-4 text-xs text-slate-500 font-normal">
                        {provider.registeredOn}
                      </td>

                      {/* Actions Buttons (Direct Match to Screenshot Styling) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Approve Button */}
                          {provider.status === 'approved' ? (
                            <button
                              disabled
                              className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed border border-slate-200"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approved
                            </button>
                          ) : (
                            <button
                              onClick={() => onApprove(provider.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          )}

                          {/* Reject Button */}
                          {provider.status === 'rejected' ? (
                            <button
                              onClick={() => onResetVerification(provider.id)}
                              className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Reset Verification Status"
                            >
                              Reset
                            </button>
                          ) : (
                            <button
                              onClick={() => onReject(provider.id)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer Pagination Bar ────────────────────────────────────── */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {filteredProviders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(currentPage * pageSize, filteredProviders.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{filteredProviders.length}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Provider Detail Modal Drawer ─────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedProvider}
        onClose={() => setSelectedProvider(null)}
        title={selectedProvider ? `${selectedProvider.name} - Profile Details` : ''}
        subtitle="Verification documents, location radius, and operational metadata"
        maxWidth="max-w-3xl"
      >
        {selectedProvider && (
          <div className="space-y-6">
            {/* Top Identity Header Card */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-xs shrink-0 ${selectedProvider.avatarBgColor}`}
              >
                {selectedProvider.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-slate-900">{selectedProvider.name}</h4>
                  {getStatusBadge(selectedProvider.status)}
                </div>
                <p className="text-xs text-slate-500">@{selectedProvider.username}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {selectedProvider.rating} ({selectedProvider.reviewCount} reviews)
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedProvider.area}, {selectedProvider.city}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    Radius: {selectedProvider.workingRadius || 15} km
                  </span>
                </div>
              </div>
            </div>

            {/* Instant Availability Status */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <h5 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                    Instant Availability Status
                  </h5>
                  <p className="text-xs text-blue-800 mt-0.5">
                    {selectedProvider.availabilityNote || 'Available for immediate assignments'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 capitalize">
                {selectedProvider.availabilityStatus}
              </span>
            </div>

            {/* Contact & Registration Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-white border border-slate-100 rounded-xl space-y-1.5">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Contact Information
                </span>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedProvider.email}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {selectedProvider.mobile}
                </div>
              </div>

              <div className="p-3.5 bg-white border border-slate-100 rounded-xl space-y-1.5">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Verification Badges
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-[11px] font-medium border ${
                      selectedProvider.isIdentityVerified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    ID Document: {selectedProvider.isIdentityVerified ? 'Verified' : 'Pending'}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-[11px] font-medium border ${
                      selectedProvider.isSelfieVerified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    Selfie Match: {selectedProvider.isSelfieVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Identity Document & Selfie Photos Grid */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Submitted Verification Artifacts
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID Front */}
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-600 block">
                    ID Document ({selectedProvider.idType || 'Govt ID'})
                  </span>
                  <div className="h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                    {selectedProvider.idFrontUrl ? (
                      <img
                        src={selectedProvider.idFrontUrl}
                        alt="ID Front"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-slate-400">
                        No ID photo uploaded
                      </div>
                    )}
                  </div>
                </div>

                {/* Biometric Selfie */}
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-600 block">
                    Biometric Selfie Photo
                  </span>
                  <div className="h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                    {selectedProvider.selfieUrl ? (
                      <img
                        src={selectedProvider.selfieUrl}
                        alt="Biometric Selfie"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-slate-400">
                        No selfie uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action Controls */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>

              {selectedProvider.status !== 'approved' && (
                <button
                  onClick={() => {
                    onApprove(selectedProvider.id);
                    setSelectedProvider(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all shadow-xs"
                >
                  Approve Verification Access
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
