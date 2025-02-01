import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Review } from '../types/manga';

interface ReviewSectionProps {
  reviews: Review[];
  mangaId: string;
  onReviewAdded: (review: Review) => void;
}

export function ReviewSection({ reviews, mangaId, onReviewAdded }: ReviewSectionProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content || !rating) return;

    setIsSubmitting(true);
    try {
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          manga_id: mangaId,
          user_id: user.id,
          content,
          rating,
        })
        .select(`
          *,
          user:auth_users!reviews_user_id_fkey (
            email
          )
        `)
        .single();

      if (reviewError) throw reviewError;

      onReviewAdded(reviewData);
      setContent('');
      setRating(0);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6">Рецензії</h2>

      {user && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 ${
                      value <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Напишіть свою рецензію..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !content || !rating}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Відправляємо...' : 'Відправити рецензію'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-medium">
                    {review.user?.email?.[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{review.user?.email}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{review.rating}</span>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}