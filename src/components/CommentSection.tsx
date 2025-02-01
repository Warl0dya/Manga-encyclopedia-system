import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    email: string;
  };
}

interface CommentSectionProps {
  chapterId: string;
}

export function CommentSection({ chapterId }: CommentSectionProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [chapterId]);

  async function loadComments() {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('chapter_comments')
        .select(`
          *,
          user:auth_users!chapter_comments_user_id_fkey (
            email
          )
        `)
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setSubmitting(true);
    try {
      const { data: commentData, error: commentError } = await supabase
        .from('chapter_comments')
        .insert({
          chapter_id: chapterId,
          user_id: user.id,
          content: content.trim(),
        })
        .select(`
          *,
          user:auth_users!chapter_comments_user_id_fkey (
            email
          )
        `)
        .single();

      if (commentError) throw commentError;

      setComments([commentData, ...comments]);
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Напишіть коментар..."
            className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            rows={3}
            required
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Відправляємо...' : 'Відправити'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {comment.user?.email?.[0].toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium">{comment.user?.email}</div>
                <div className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <p className="text-gray-200 whitespace-pre-line">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}