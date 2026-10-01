'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastContainer, ToastMessage } from '@/components/common/Toast';
import { AdminAuthModal } from '@/components/common/AdminAuthModal';
import { ActivityLogsModal } from '@/components/common/ActivityLogsModal';

import { OverviewStats } from '@/components/analytics/OverviewStats';
import { ProviderManagement } from '@/components/providers/ProviderManagement';
import { VerificationQueue } from '@/components/verifications/VerificationQueue';
import { JobsManagement } from '@/components/jobs/JobsManagement';
import { ProposalsManagement } from '@/components/proposals/ProposalsManagement';
import { ReviewsManagement } from '@/components/reviews/ReviewsManagement';
import { PaymentsManagement } from '@/components/payments/PaymentsManagement';

import {
  ProviderItem,
  JobItem,
  ProposalItem,
  ReviewItem,
  PaymentItem,
  ProviderStatus,
  GigStats,
  EMPTY_STATS,
} from '@/types/gig';
import { gigApi } from '@/services/gigApi';
import { Loader2 } from 'lucide-react';
import { logger } from '@/services/logger';

export default function Home() {
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Core App State (Clean initial empty state, strictly populated from live backend)
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [stats, setStats] = useState<GigStats>(EMPTY_STATS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const addToast = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    description?: string
  ) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ─── Fetch All Live Data from Backend ───────────────────────────────────────
  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setIsRefreshing(true);

    try {
      logger.info('DASHBOARD', 'Fetching live records across all admin endpoints...');

      // Parallel fetch across all admin endpoints
      const [
        statsRes,
        providersRes,
        jobsRes,
        proposalsRes,
        reviewsRes,
        paymentsRes,
      ] = await Promise.allSettled([
        gigApi.getAdminStats(),
        gigApi.getAdminProviders({ size: 100 }),
        gigApi.getAdminJobs({ size: 100 }),
        gigApi.getAdminProposals({ size: 100 }),
        gigApi.getAdminReviews({ size: 100 }),
        gigApi.getAdminPayments({ size: 100 }),
      ]);

      let anySuccess = false;

      // Handle stats
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
        anySuccess = true;
      }

      // Handle providers
      if (providersRes.status === 'fulfilled') {
        setProviders(providersRes.value.providers || []);
        anySuccess = true;
      }

      // Handle jobs
      if (jobsRes.status === 'fulfilled') {
        setJobs(jobsRes.value.jobs || []);
        anySuccess = true;
      }

      // Handle proposals
      if (proposalsRes.status === 'fulfilled') {
        setProposals(proposalsRes.value.proposals || []);
        anySuccess = true;
      }

      // Handle reviews
      if (reviewsRes.status === 'fulfilled') {
        setReviews(reviewsRes.value.reviews || []);
        anySuccess = true;
      }

      // Handle payments
      if (paymentsRes.status === 'fulfilled') {
        setPayments(paymentsRes.value.payments || []);
        anySuccess = true;
      }

      if (anySuccess && !isSilent) {
        addToast('success', 'Synchronized with Live Backend', 'Loaded live database records from api3.made2tech.com');
      }
    } catch (err: unknown) {
      logger.error('DASHBOARD', 'Data fetch error:', err);
      addToast('error', 'Sync Failed', 'Failed to retrieve records from the live backend server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  // Initial load upon authentication
  useEffect(() => {
    let cancelled = false;
    if (isAuthenticated) {
      void Promise.resolve().then(() => {
        if (!cancelled) {
          fetchDashboardData(true);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, fetchDashboardData]);

  // Dynamic calculated stats from live data or stats endpoint
  const computedStats: GigStats = stats.totalProviders > 0 || stats.activeJobs > 0
    ? stats
    : {
        totalProviders: providers.length,
        pendingApprovals: providers.filter((p) => p.status === 'pending').length,
        approvedProviders: providers.filter((p) => p.status === 'approved').length,
        activeJobs: jobs.filter((j) => j.status === 'open' || j.status === 'in_progress').length,
        completedJobs: jobs.filter((j) => j.status === 'completed').length,
        totalRevenue: payments.reduce((acc, curr) => acc + curr.amount, 0),
        averageRating: reviews.length > 0
          ? Number((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(2))
          : 0,
      };

  // ─── Actions & Handlers ─────────────────────────────────────────────────────

  // Provider Approval Trigger
  const handleApproveProvider = async (id: number) => {
    const target = providers.find((p) => p.id === id);

    // Optimistic UI update
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
      `${target?.name || 'Provider'} access has been approved.`
    );

    try {
      await gigApi.approveProvider(id);
      fetchDashboardData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not persist approval to server.';
      addToast('error', 'Backend Update Failed', msg);
    }
  };

  // Provider Rejection Trigger
  const handleRejectProvider = async (id: number, reason?: string) => {
    const target = providers.find((p) => p.id === id);

    // Optimistic UI update
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'rejected' as ProviderStatus } : p))
    );

    addToast(
      'error',
      'Provider Rejected',
      `${target?.name || 'Provider'}'s verification request has been rejected.`
    );

    try {
      await gigApi.rejectProvider(id, reason || 'Rejected by platform admin.');
      fetchDashboardData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not persist rejection to server.';
      addToast('error', 'Backend Update Failed', msg);
    }
  };

  // Reset Verification Trigger
  const handleResetVerification = async (id: number) => {
    const target = providers.find((p) => p.id === id);

    // Optimistic UI update
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'pending' as ProviderStatus } : p))
    );

    addToast(
      'warning',
      'Verification Reset',
      `${target?.name || 'Provider'}'s profile reset to pending review.`
    );

    try {
      await gigApi.resetProviderVerification(id);
      fetchDashboardData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not reset verification on server.';
      addToast('error', 'Backend Update Failed', msg);
    }
  };

  // Close / Cancel Job
  const handleCloseJob = async (id: number, reason?: string) => {
    // Optimistic UI update
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'cancelled' } : j))
    );

    addToast('info', 'Job Closed', `Job posting #${id} was cancelled by admin.`);

    try {
      await gigApi.cancelJob(id, reason || 'Cancelled by admin.');
      fetchDashboardData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not cancel job on server.';
      addToast('error', 'Backend Update Failed', msg);
    }
  };

  // Delete / Moderate Review
  const handleDeleteReview = async (id: number) => {
    // Optimistic UI update
    setReviews((prev) => prev.filter((r) => r.id !== id));

    addToast('info', 'Review Removed', `Review #${id} was deleted from platform.`);

    try {
      await gigApi.deleteReview(id);
      fetchDashboardData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not delete review on server.';
      addToast('error', 'Backend Update Failed', msg);
    }
  };

  // ─── Loading State Check ───────────────────────────────────────────────────
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">Loading GIG Control Center...</p>
        <span className="text-xs text-slate-500 mt-1">Connecting to api3.made2tech.com</span>
      </div>
    );
  }

  // ─── Unauthenticated Gate: Show Login Screen ───────────────────────────────
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // ─── Authenticated Dashboard View ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        pendingVerificationsCount={computedStats.pendingApprovals}
        openJobsCount={jobs.filter((j) => j.status === 'open').length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenLogs={() => setIsLogsModalOpen(true)}
          onRefresh={() => fetchDashboardData(false)}
          isRefreshing={isRefreshing}
          user={user}
          onLogout={logout}
        />

        {/* Dynamic Screen View */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {isLoading ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-slate-600">Connecting and synchronizing GIG dashboard...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewStats
                  stats={computedStats}
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
                <ReviewsManagement
                  reviews={reviews}
                  onDeleteReview={handleDeleteReview}
                />
              )}

              {activeTab === 'payments' && (
                <PaymentsManagement payments={payments} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Admin Authentication & Connection Modal */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          fetchDashboardData(false);
        }}
      />

      {/* Activity & System Logs Modal */}
      <ActivityLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />

      {/* Floating Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
