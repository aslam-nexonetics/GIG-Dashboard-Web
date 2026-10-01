'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Image as ImageIcon,
  MapPin,
  User,
} from 'lucide-react';
import { JobItem, JobStatus, TimelineStep } from '@/types/gig';
import { Modal } from '@/components/common/Modal';
import { gigApi } from '@/services/gigApi';

interface JobsManagementProps {
  jobs: JobItem[];
  onCloseJob: (id: number, reason?: string) => void;
}

export const JobsManagement: React.FC<JobsManagementProps> = ({ jobs, onCloseJob }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  // Close job dialog state
  const [closingJobId, setClosingJobId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  // Live timeline state
  const [fetchedTimeline, setFetchedTimeline] = useState<TimelineStep[] | null>(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedJob) {
      return;
    }

    if (!selectedJob.timeline || selectedJob.timeline.length === 0) {
      let cancelled = false;
      void Promise.resolve().then(() => {
        if (cancelled) return;
        setIsLoadingTimeline(true);
        gigApi
          .getJobTimeline(selectedJob.id)
          .then((steps) => {
            if (!cancelled) setFetchedTimeline(steps);
          })
          .catch(() => {
            if (!cancelled) setFetchedTimeline([]);
          })
          .finally(() => {
            if (!cancelled) setIsLoadingTimeline(false);
          });
      });
      return () => {
        cancelled = true;
      };
    }
  }, [selectedJob]);

  const timeline: TimelineStep[] =
    selectedJob?.timeline && selectedJob.timeline.length > 0
      ? selectedJob.timeline
      : (fetchedTimeline ?? []);

  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = selectedStatus === 'all' || job.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" /> In Progress
          </span>
        );
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <User className="w-3.5 h-3.5 text-purple-600" /> Assigned
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Closed
          </span>
        );
      case 'open':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Open for Bids
          </span>
        );
    }
  };

  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    if (closingJobId !== null) {
      onCloseJob(closingJobId, cancelReason || 'Cancelled by admin');
      setClosingJobId(null);
      setCancelReason('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Jobs & Service Requests</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Track client postings, assigned technicians, proof of work images, and timelines.
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
          {jobs.length} Total Jobs
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job title, category, client or city..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid / Feed */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-400 space-y-2">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No jobs found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    #{job.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {job.category}
                  </span>
                  {getStatusBadge(job.status)}
                  {job.proposalsCount > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      {job.proposalsCount} {job.proposalsCount === 1 ? 'Bid' : 'Bids'}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">{job.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1 font-semibold text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Client: {job.clientName}</span>
                  </div>
                  {job.assignedProviderName && (
                    <div className="flex items-center gap-1 font-semibold text-blue-700">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                      <span>Hired: {job.assignedProviderName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.area ? `${job.area}, ` : ''}{job.city}</span>
                  </div>
                  <div className="font-bold text-emerald-600">
                    Budget: ₹{job.budget ? job.budget.toLocaleString() : 'Open'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>

                {job.status !== 'cancelled' && job.status !== 'completed' && (
                  <button
                    onClick={() => {
                      setClosingJobId(job.id);
                      setCancelReason('');
                    }}
                    className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Close Job
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Close Job Confirmation Modal */}
      <Modal
        isOpen={closingJobId !== null}
        onClose={() => setClosingJobId(null)}
        title={`Cancel Job Posting #${closingJobId}`}
        subtitle="Provide a cancellation note for the client and bidders"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmClose} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cancellation Reason
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Duplicate request, cancelled per client request, safety compliance..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setClosingJobId(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              Confirm Cancel Job
            </button>
          </div>
        </form>
      </Modal>

      {/* Detailed Job Inspection Modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob ? `Job #${selectedJob.id} - ${selectedJob.title}` : ''}
        subtitle="Full job specifications, proof photos, and completion timeline"
        maxWidth="max-w-3xl"
      >
        {selectedJob && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</span>
                <p className="text-sm font-bold text-slate-900">{selectedJob.category}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget</span>
                <p className="text-sm font-bold text-emerald-600">
                  ₹{selectedJob.budget ? selectedJob.budget.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedJob.status)}</div>
              </div>
              {selectedJob.assignedProviderName && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technician</span>
                  <p className="text-sm font-bold text-blue-700">{selectedJob.assignedProviderName}</p>
                </div>
              )}
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</h5>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                {selectedJob.description}
              </p>
            </div>

            {/* Proof Images Gallery */}
            <div>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-500" /> Uploaded Proof Photos ({selectedJob.proofImages?.length || 0})
              </h5>
              {!selectedJob.proofImages || selectedJob.proofImages.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No job proof images uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {selectedJob.proofImages.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt={`Proof ${i + 1}`}
                      className="w-full h-44 object-cover rounded-xl border border-slate-200"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Timeline Steps */}
            <div>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Job Timeline History {isLoadingTimeline && '(Updating...)'}
              </h5>
              {timeline.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No timeline steps recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {timeline.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div className="flex-1 pb-2 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{step.title}</span>
                          <span className="text-slate-400">{step.timestamp}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5">
                          By {step.actor} {step.details ? `— ${step.details}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
