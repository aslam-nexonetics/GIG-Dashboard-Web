'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastContainer, ToastMessage } from '@/components/common/Toast';

import { OverviewStats } from '@/components/analytics/OverviewStats';
import { ProviderManagement } from '@/components/providers/ProviderManagement';
import { VerificationQueue } from '@/components/verifications/VerificationQueue';
import { JobsManagement } from '@/components/jobs/JobsManagement';
import { ProposalsManagement } from '@/components/proposals/ProposalsManagement';
import { ReviewsManagement } from '@/components/reviews/ReviewsManagement';
import { PaymentsManagement } from '@/components/payments/PaymentsManagement';

import {
  INITIAL_PROVIDERS,
  INITIAL_JOBS,
  INITIAL_PROPOSALS,
  INITIAL_REVIEWS,
  INITIAL_PAYMENTS,
  INITIAL_STATS,
} from '@/data/mockGigData';
import { ProviderItem, JobItem, ProviderStatus } from '@/types/gig';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('providers'); // Default view matches reference screenshot!
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Core App State
  const [providers, setProviders] = useState<ProviderItem[]>(INITIAL_PROVIDERS);
  const [jobs, setJobs] = useState<JobItem[]>(INITIAL_JOBS);
  const [proposals] = useState(INITIAL_PROPOSALS);
  const [reviews] = useState(INITIAL_REVIEWS);
  const [payments] = useState(INITIAL_PAYMENTS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const addToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    description?: string
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Provider Approval Trigger
  const handleApproveProvider = (id: number) => {
    const target = providers.find((p) => p.id === id);
    if (!target) return;

    setProviders((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'approved' as ProviderStatus,
              isIdentityVerified: true,
              isSelfieVerified: true,
              isLocationVerified: true,
            }
          : p
      )
    );

    addToast(
      'success',
      'Provider Approved',
      `${target.name} (${target.specialization}) access has been approved successfully.`
    );
  };

  // Provider Rejection Trigger
  const handleRejectProvider = (id: number) => {
    const target = providers.find((p) => p.id === id);
    if (!target) return;

    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'rejected' as ProviderStatus } : p))
    );

    addToast(
      'error',
      'Provider Rejected',
      `${target.name}'s verification request has been rejected.`
    );
  };

  // Reset Verification Trigger
  const handleResetVerification = (id: number) => {
    const target = providers.find((p) => p.id === id);
    if (!target) return;

    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'pending' as ProviderStatus } : p))
    );

    addToast(
      'warning',
      'Verification Reset',
      `${target.name}'s profile reset to pending review.`
    );
  };

  // Close / Cancel Job
  const handleCloseJob = (id: number) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'cancelled' } : j))
    );

    addToast('info', 'Job Closed', `Job posting #${id} was closed by admin.`);
  };

  // Calculated Stats
  const stats = {
    totalProviders: providers.length,
    pendingApprovals: providers.filter((p) => p.status === 'pending').length,
    approvedProviders: providers.filter((p) => p.status === 'approved').length,
    activeJobs: jobs.filter((j) => j.status === 'open' || j.status === 'in_progress').length,
    completedJobs: jobs.filter((j) => j.status === 'completed').length,
    totalRevenue: payments.reduce((acc, curr) => acc + curr.amount, 0),
    averageRating: 4.86,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        pendingVerificationsCount={stats.pendingApprovals}
        openJobsCount={jobs.filter((j) => j.status === 'open').length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Dynamic Screen View */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {activeTab === 'overview' && (
            <OverviewStats
              stats={stats}
              providers={providers}
              jobs={jobs}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'providers' && (
            <ProviderManagement
              providers={providers}
              onApprove={handleApproveProvider}
              onReject={handleRejectProvider}
              onResetVerification={handleResetVerification}
            />
          )}

          {activeTab === 'verifications' && (
            <VerificationQueue
              providers={providers}
              onApprove={handleApproveProvider}
              onReject={handleRejectProvider}
            />
          )}

          {activeTab === 'jobs' && (
            <JobsManagement jobs={jobs} onCloseJob={handleCloseJob} />
          )}

          {activeTab === 'proposals' && (
            <ProposalsManagement proposals={proposals} />
          )}

          {activeTab === 'reviews' && (
            <ReviewsManagement reviews={reviews} />
          )}

          {activeTab === 'payments' && (
            <PaymentsManagement payments={payments} />
          )}
        </main>
      </div>

      {/* Floating Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
