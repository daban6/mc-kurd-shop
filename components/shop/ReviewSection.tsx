"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Send, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName?: string | null;
}

// ─── Static star row (display only) ───────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5"
          fill={i <= Math.floor(rating) ? "#7c3aed" : "none"}
          stroke={i <= Math.ceil(rating) ? "#7c3aed" : "#71717a"}
          opacity={i === Math.ceil(rating) && rating % 1 !== 0 ? 0.5 : 1}
        />
      ))}
    </div>
  );
}

// ─── Clickable star picker ─────────────────────────────────────────────────────

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className="h-6 w-6"
            fill={i <= active ? "#7c3aed" : "none"}
            stroke={i <= active ? "#7c3aed" : "#71717a"}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ReviewSection({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  const isKurdish = locale === "ku";

  const [reviews, setReviews]           = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalCount, setTotalCount]     = useState(0);
  const [loading, setLoading]           = useState(true);

  const [rating,  setRating]    = useState(0);
  const [comment, setComment]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res  = await fetch(`/api/products/${slug}/reviews`);
      const data = await res.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setAverageRating(typeof data.averageRating === "number" ? data.averageRating : 0);
      setTotalCount(typeof data.totalCount === "number" ? data.totalCount : 0);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0 || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          userId:  "8LUaQsVuXEqvMUnZIqL5Wl5KkVaEycMX",
          rating,
          comment,
        }),
      });

      if (res.status === 403) {
        setSubmitError(
          isKurdish
            ? "تەنها کڕیارانی ئەم بەرهەمە دەتوانن ڕەزامەندی بنووسن."
            : "You can only review products you have purchased."
        );
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(
          (data as { error?: string }).error ??
            (isKurdish ? "هەڵەیەک ڕوویدا." : "Something went wrong.")
        );
        return;
      }

      setSubmitSuccess(true);
      setRating(0);
      setComment("");
      await fetchReviews();
    } catch {
      setSubmitError(
        isKurdish ? "هەڵەی تۆڕ." : "Network error. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Average rating header */}
      {!loading && totalCount > 0 && (
        <div className="flex items-center gap-2.5">
          <StarRow rating={averageRating} />
          <span className="text-sm font-semibold text-foreground">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-sm text-muted">
            ({totalCount} {isKurdish ? "ڕەزامەندی" : "reviews"})
          </span>
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <p className="text-sm text-muted">{isKurdish ? "چاوەڕێبە…" : "Loading…"}</p>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded border border-border bg-surface py-8 text-center">
          <MessageSquare className="h-8 w-8 text-muted opacity-30" />
          <p className="text-sm text-muted">
            {isKurdish ? "هێشتا ڕەزامەندییەک نییە." : "No reviews yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded border border-border bg-surface p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-900">
                    <span className="text-xs font-bold text-white uppercase">
                      {(review.userName ?? "A")[0]}
                    </span>
                  </div>
                  <span className="mt-0.5 text-sm font-medium text-foreground">
                    {review.userName ?? "Anonymous"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StarRow rating={review.rating} />
                  <span className="text-xs text-muted">
                    {new Date(review.createdAt).toLocaleDateString("en-GB", {
                      day:   "numeric",
                      month: "short",
                      year:  "numeric",
                    })}
                  </span>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-muted">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write a review form */}
      <div className="rounded border border-border bg-surface p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          {isKurdish ? "ڕەزامەندی بنووسە" : "Write a Review"}
        </h3>

        {submitSuccess ? (
          <div className="rounded border border-green-500/30 bg-green-500/10 px-3 py-3 text-sm text-green-400">
            {isKurdish
              ? "سوپاس! ڕەزامەندیەکەت زیادکرا."
              : "Thanks! Your review has been submitted."}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Star picker */}
            <div>
              <p className="mb-1.5 text-xs text-muted">
                {isKurdish ? "هەڵسەنگاندن" : "Rating"}
              </p>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            {/* Comment textarea */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs text-muted">
                  {isKurdish ? "کۆمێنت" : "Comment"}
                </p>
                <span className={`text-xs ${comment.length >= 480 ? "text-yellow-500" : "text-muted"}`}>
                  {comment.length}/500
                </span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                rows={3}
                placeholder={
                  isKurdish
                    ? "بیرۆکەکانت لەسەر ئەم بەرهەمە…"
                    : "Share your thoughts on this product…"
                }
                className="w-full resize-none rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary/50 focus:outline-none"
              />
            </div>

            {/* Error */}
            {submitError && (
              <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={rating === 0 || submitting}
              className={`flex w-full items-center justify-center gap-2 rounded py-2.5 text-sm font-semibold transition-colors ${
                rating > 0 && !submitting
                  ? "bg-primary text-foreground hover:bg-primary-hover"
                  : "cursor-not-allowed bg-primary/40 text-foreground/50"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              {submitting
                ? isKurdish ? "نێردراوە…" : "Submitting…"
                : isKurdish ? "ناردن" : "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
