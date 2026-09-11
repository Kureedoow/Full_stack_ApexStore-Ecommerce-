import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import { reviewApi } from '../../api/reviewApi';
import ProductRating from './ProductRating';
import { formatDate } from '../../utils/formatDate';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const ProductReviews = ({ productId, initialRating = 0, initialReviewCount = 0 }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const res = await reviewApi.getProductReviews(productId);
        setReviews(res.data?.reviews || res.data || []);
      } catch {
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await reviewApi.createProductReview(productId, { rating, comment });
      toast.success('Review submitted successfully!');
      const newReview = res.data?.review || res.data || {
        _id: Date.now().toString(),
        rating,
        comment,
        user: { firstName: user?.firstName || 'You', lastName: user?.lastName || '' },
        createdAt: new Date().toISOString(),
      };
      setReviews([newReview, ...reviews]);
      setComment('');
      setRating(5);
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Customer Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <ProductRating rating={initialRating} size="sm" />
            <span className="text-xs text-slate-500">Based on {reviews.length || initialReviewCount} reviews</span>
          </div>
        </div>
      </div>

      {/* Review Submission Box */}
      {isAuthenticated ? (
        <form
          onSubmit={handleSubmitReview}
          className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900">Write a Review</h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Your Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 hover:text-amber-400 transition-colors focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-transparent text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-semibold text-slate-700">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Your Review & Experience
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike about this product?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 text-center">
          Please <a href="/login" className="text-indigo-600 font-semibold underline">sign in</a> to leave a product review.
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-xs text-slate-400 py-4 text-center">Loading customer reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No reviews yet. Be the first to share your thoughts on this product!
          </p>
        ) : (
          reviews.map((rev) => {
            const author = rev.user
              ? typeof rev.user === 'object'
                ? `${rev.user.firstName || ''} ${rev.user.lastName || ''}`.trim() || 'Verified Buyer'
                : 'Customer'
              : 'Verified Shopper';

            return (
              <div
                key={rev._id}
                className="p-4 rounded-2xl border border-slate-100 bg-white space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {author[0]}
                    </div>
                    <span className="text-xs font-semibold text-slate-900">{author}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>
                <ProductRating rating={rev.rating} size="xs" showNumber={false} />
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
