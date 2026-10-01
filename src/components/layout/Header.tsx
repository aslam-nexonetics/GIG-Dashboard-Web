'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  RefreshCw,
  LogOut,
  Terminal,
  Shield,
  ChevronDown,
  ExternalLink,
  Settings,
} from 'lucide-react';
import { AuthUser } from '@/types/gig';

interface HeaderProps {
  onToggleSidebar?: () => void;
  activeTab: string;
  onOpenAuthModal?: () => void;
  onOpenLogs?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  user?: AuthUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  activeTab,
  onOpenAuthModal,
  onOpenLogs,
  onRefresh,
  isRefreshing = false,
  user,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'providers':
        return 'Users & Providers Directory';
      case 'verifications':
        return 'Identity & Biometric Queue';
      case 'jobs':
        return 'Jobs & Marketplace Requests';
      case 'proposals':
        return 'Proposals & Bidding System';
      case 'reviews':
        return 'Reviews & Reputation Moderation';
      case 'payments':
        return 'Payments & Financial Ledger';
      case 'overview':
      default:
        return 'GIG Operations Command Center';
    }
  };

  const getTabSubtitle = (tab: string) => {
    switch (tab) {
      case 'providers':
        return 'Search, verify, approve, reject, or reset service providers across the platform.';
      case 'verifications':
        return 'Review government identity documents, biometric selfies, and geographic coordinates.';
      case 'jobs':
        return 'Monitor live job requests, proof photos, and step-by-step audit timelines.';
      case 'proposals':
        return 'Analyze technician bids, duration estimates, proposed rates, and hiring statuses.';
      case 'reviews':
        return 'Moderate client ratings, review comments, and praise tags.';
      case 'payments':
        return 'Track transaction statuses, receipt proofs, settlement statuses, and GMV revenue.';
      case 'overview':
      default:
        return 'Real-time analytics and platform performance metrics for the GIG collection.';
    }
  };

  const displayName = user?.fullName || user?.username || 'Administrator';
  const displayRole = user?.role || 'Admin';
  const userInitials = (user?.username || 'AD').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Trigger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {getTabTitle(activeTab)}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live API
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5 font-normal">
              {getTabSubtitle(activeTab)}
            </p>
          </div>
        </div>

        {/* Right Section: Sync Refresh, Logs & Admin Profile Dropdown */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Refresh data from backend"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}

          {/* Activity Logs Trigger */}
          {onOpenLogs && (
            <button
              onClick={onOpenLogs}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="View API Activity & System Logs"
            >
              <Terminal className="w-4 h-4" />
            </button>
          )}

          {/* Admin User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition-all cursor-pointer text-left shadow-2xs bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-950"
            >
              <div className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs text-white bg-emerald-600">
                {userInitials}
              </div>
              <div className="hidden sm:block leading-tight pr-1">
                <span className="text-xs font-bold block truncate max-w-[120px]">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-500 font-normal block capitalize">
                  {displayRole}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* User info box */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email || 'api3.made2tech.com'}</p>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600">
                        {displayRole}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Connection Status Details */}
                <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Environment:</span>
                    <span className="font-semibold text-slate-700">Production API</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Collection:</span>
                    <span className="font-mono font-bold text-blue-600">GIG</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-1 space-y-0.5">
                  {onOpenAuthModal && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Connection & Token Setup</span>
                    </button>
                  )}

                  {onOpenLogs && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenLogs();
                      }}
                      className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Terminal className="w-3.5 h-3.5 text-slate-400" />
                      <span>API & System Logs</span>
                    </button>
                  )}

                  <a
                    href="https://api3.made2tech.com/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      <span>Backend Swagger Docs</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>

                {/* Sign Out */}
                {onLogout && (
                  <div className="p-1 border-t border-slate-100 mt-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
