"use client";

import { useState, useEffect } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
  } | null;
}

interface ReviewsSectionProps {
  productId: string;
}

function StarRatingInput({
  rating,
  onRatingChange,
  disabled,
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          className="p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onRatingChange(i)}
        >
          <Star
            className="h-5 w-5"
            fill={(hoverRating || rating) >= i ? "#7c3aed" : "none"}
            stroke={(hoverRating || rating) >= i ? "#7c3aed" : "#71717a"}
          />
        </button>
      ))}
    </div>
  );
}

function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="h-3 w-3"
          fill={i <= rating ? "#7c3aed" : "none"}
          stroke={i <= rating ? "#7c3aed" : "#71717a"}
        />
      ))}
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews || []);
      } else {
        console.error("Failed to fetch reviews:", data.error);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit review");
        return;
      }

      setSuccess(true);
      setRating(0);
      setComment("");
      fetchReviews(); // Refresh reviews list
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">
            {averageRating.toFixed(1)}
          </span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="h-4 w-4"
                fill={i <= Math.round(averageRating) ? "#7c3aed" : "none"}
                stroke={i <= Math.round(averageRating) ? "#7c3aed" : "#71717a"}
              />
            ))}
          </div>
        </div>
        <span className="text-sm text-muted">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </span>
      </div>

      {/* Submit Review Form */}
      {!success ? (
        <form
          onSubmit={handleSubmit}
          className="rounded border border-border bg-surface p-4"
        >
          <h3 className="mb-3 text-sm font-medium text-foreground">
            Write a Review
          </h3>

          <div className="mb-3">
            <label className="mb-1.5 block text-xs text-muted">
              Your Rating
            </label>
            <StarRatingInput
              rating={rating}
              onRatingChange={setRating}
              disabled={submitting}
            />
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block text-xs text-muted">
              Your Review (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
              placeholder="Share your experience with this product..."
              className="h-20 w-full resize-none rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="mb-3 text-xs text-red-400">{error}</p>
          )}

          <Button type="submit" disabled={submitting || rating === 0} size="sm">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit Review
          </Button>
        </form>
      ) : (
        <div className="rounded border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
          Thank you for your review!
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="rounded border border-border bg-surface p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {review.user?.name || "Anonymous"}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <StarRatingDisplay rating={review.rating} />
              </div>
              {review.comment && (
                <p className="text-sm text-muted">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
