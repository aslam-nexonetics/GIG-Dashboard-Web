'use client';

import React, { useState } from 'react';
import { Briefcase, Search, Clock, CheckCircle2, AlertCircle, Eye, Image as ImageIcon, MapPin, DollarSign, ChevronRight, User } from 'lucide-react';
import { JobItem, JobStatus } from '@/types/gig';
import { Modal } from '@/components/common/Modal';

interface JobsManagementProps {
  jobs: JobItem[];
  onCloseJob: (id: number) => void;
}

export const JobsManagement: React.FC<JobsManagementProps> = ({ jobs, onCloseJob }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

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
            <option value="cancelled">Closed</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid/Table */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-400">
            No jobs found matching your criteria.
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {job.category}
                  </span>
                  {getStatusBadge(job.status)}
                  <span className="text-xs text-slate-400">ID #{job.id}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{job.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    Budget: ₹{job.budget.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.area}, {job.city}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    Posted by: <strong className="text-slate-800 font-semibold">{job.clientName}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>

                {job.status !== 'cancelled' && job.status !== 'completed' && (
                  <button
                    onClick={() => onCloseJob(job.id)}
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
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</span>
                <p className="text-sm font-bold text-slate-900">{selectedJob.category}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget</span>
                <p className="text-sm font-bold text-emerald-600">₹{selectedJob.budget.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedJob.status)}</div>
              </div>
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
                <ImageIcon className="w-4 h-4 text-blue-500" /> Uploaded Proof Photos ({selectedJob.proofImages.length})
              </h5>
              {selectedJob.proofImages.length === 0 ? (
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
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Job Timeline History</h5>
              <div className="space-y-3">
                {selectedJob.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div className="flex-1 pb-2 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{step.title}</span>
                        <span className="text-slate-400">{step.timestamp}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">By {step.actor} {step.details ? `— ${step.details}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
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
