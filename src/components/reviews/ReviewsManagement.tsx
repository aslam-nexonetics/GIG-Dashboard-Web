'use client';

import React, { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { ReviewItem } from '@/types/gig';

interface ReviewsManagementProps {
  reviews: ReviewItem[];
  onDeleteReview?: (id: number) => void;
}

export const ReviewsManagement: React.FC<ReviewsManagementProps> = ({ reviews, onDeleteReview }) => {
  const [selectedReviewToDelete, setSelectedReviewToDelete] = useState<number | null>(null);

  const confirmDelete = (id: number) => {
    if (onDeleteReview) {
      onDeleteReview(id);
    }
    setSelectedReviewToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reviews & Reputation Moderation</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Client reviews, star ratings, and praise tags automatically calculated into provider ratings.
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
          {reviews.length} Total Reviews
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-400 space-y-2">
          <Star className="w-10 h-10 text-amber-400 mx-auto opacity-70" />
          <h3 className="text-base font-bold text-slate-800">No reviews yet</h3>
          <p className="text-xs text-slate-500">No reviews found matching the criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-sm transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{rev.clientName}</h4>
                    <span className="text-xs text-slate-400">Job #{rev.jobId}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-amber-700 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {rev.rating}.0
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                {/* Praise Tags */}
                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rev.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{rev.createdAt}</span>

                {selectedReviewToDelete === rev.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-600 font-medium">Delete review?</span>
                    <button
                      onClick={() => confirmDelete(rev.id)}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setSelectedReviewToDelete(null)}
                      className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedReviewToDelete(rev.id)}
                    className="text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    title="Moderate and delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Moderate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
