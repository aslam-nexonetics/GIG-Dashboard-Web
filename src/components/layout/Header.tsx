'use client';

import React from 'react';
import { User, Bell, Menu, ShieldCheck, Search, Sparkles } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, activeTab }) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'providers':
        return 'Users Management';
      case 'verifications':
        return 'Identity & Biometric Verification';
      case 'jobs':
        return 'Jobs & Marketplace Requests';
      case 'proposals':
        return 'Proposals & Bidding System';
      case 'reviews':
        return 'Reviews & Reputation Control';
      case 'payments':
        return 'Payments & Financial Ledger';
      case 'overview':
      default:
        return 'GIG Collection Dashboard';
    }
  };

  const getTabSubtitle = (tab: string) => {
    switch (tab) {
      case 'providers':
        return 'View and manage all registered users. Approve or reject their access.';
      case 'verifications':
        return 'Review identity documents, biometric selfies, and geographic coordinates.';
      case 'jobs':
        return 'Monitor live job requests, proof photos, and step-by-step timelines.';
      case 'proposals':
        return 'Analyze technician bids, duration estimates, and hiring decisions.';
      case 'reviews':
        return 'Moderate client ratings, review comments, and praise tag metrics.';
      case 'payments':
        return 'Track transaction statuses, receipt proofs, and payment releases.';
      case 'overview':
      default:
        return 'Real-time analytics and operations command center for GIG collection.';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-4 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Trigger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {getTabTitle(activeTab)}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                <Sparkles className="w-3 h-3 text-blue-500" /> Live Demo
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5 font-normal">
              {getTabSubtitle(activeTab)}
            </p>
          </div>
        </div>

        {/* Right Section: Global Quick Actions & Admin Panel Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="relative p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {/* Admin Panel Profile Pill (Matching Screenshot Top Right) */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/60 rounded-xl transition-all cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-medium text-xs shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-blue-900 hidden sm:inline-block">
              Admin Panel
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
