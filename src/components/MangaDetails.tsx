import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, BookOpen, Heart, Share2, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Manga, Character, Review, Chapter, UserMangaProgress, Volume } from '../types/manga';
import { CharacterCard } from './CharacterCard';
import { ReviewSection } from './ReviewSection';
import { RatingModal } from './RatingModal';

export function MangaDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [manga, setManga] = useState<Manga | null>(null);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [progress, setProgress] = useState<UserMangaProgress | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [expandedVolumes, setExpandedVolumes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMangaDetails();
  }, [id, user]);

  async function loadMangaDetails() {
    if (!id) return;

    try {
      // Load manga details
      const { data: mangaData, error: mangaError } = await supabase
        .from('manga')
        .select('*')
        .eq('id', id)
        .single();

      if (mangaError) throw mangaError;
      setManga(mangaData);

      // Load volumes
      const { data: volumesData, error: volumesError } = await supabase
        .from('volumes')
        .select('*')
        .eq('manga_id', id)
        .order('number', { ascending: true });

      if (volumesError) throw volumesError;
      setVolumes(volumesData);

      // Initialize expanded state for volumes
      const initialExpandedState = volumesData.reduce((acc, volume) => {
        acc[volume.id] = true; // Start with all volumes expanded
        return acc;
      }, {} as Record<string, boolean>);
      setExpandedVolumes(initialExpandedState);

      // Load chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('manga_id', id)
        .order('number', { ascending: true });

      if (chaptersError) throw chaptersError;
      setChapters(chaptersData);

      // Load characters
      const { data: charactersData, error: charactersError } = await supabase
        .from('characters')
        .select('*')
        .eq('manga_id', id);

      if (charactersError) throw charactersError;
      setCharacters(charactersData);

      // Load reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          user:auth_users!reviews_user_id_fkey (
            email
          )
        `)
        .eq('manga_id', id);

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData);

      // Load user progress if authenticated
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_manga_progress')
          .select('*')
          .eq('manga_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!progressError && progressData) {
          setProgress(progressData);
        }
      }
    } catch (error) {
      console.error('Error loading manga details:', error);
    } finally {
      setLoading(false);
    }
  }

  const toggleVolumeExpanded = (volumeId: string) => {
    setExpandedVolumes(prev => ({
      ...prev,
      [volumeId]: !prev[volumeId]
    }));
  };

  const handleRating = async (rating: number) => {
    if (!user || !manga) return;

    try {
      const { data: progressData, error: progressError } = await supabase
        .from('user_manga_progress')
        .upsert({
          user_id: user.id,
          manga_id: manga.id,
          rating,
          is_favorite: progress?.is_favorite || false,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (progressError) throw progressError;

      setProgress(progressData);
      await loadMangaDetails();
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!manga) {
    return <div>Мангу не знайдено</div>;
  }

  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : null;

  const firstChapter = chapters[0];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <img
              src={manga.cover_image || 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&q=80'}
              alt={manga.title}
              className="w-full rounded-lg shadow-lg"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setIsRatingModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                <Star className="w-5 h-5" />
                {progress?.rating || 'Оцінити'}
              </button>
              <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                <Heart className={`w-5 h-5 ${progress?.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{manga.title}</h1>
                {manga.original_title && (
                  <p className="text-gray-600 mt-1">{manga.original_title}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{averageRating || '—'}</div>
                  <div className="text-sm text-gray-600">{reviews.length} оцінок</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize
                  ${manga.status === 'ongoing' ? 'bg-green-100 text-green-800' : 
                    manga.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'}`}
                >
                  {manga.status}
                </div>
              </div>
            </div>
            <p className="mt-4 text-gray-700 whitespace-pre-line">{manga.description}</p>
            {firstChapter && (
              <Link
                to={`/reader/${manga.id}/${firstChapter.id}`}
                className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
              >
                <BookOpen className="w-5 h-5" />
                Почати читати
              </Link>
            )}
          </div>
        </div>
      </div>

      {characters.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Головні герої</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {characters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Томи та розділи</h2>
        <div className="space-y-4">
          {volumes.map((volume) => {
            const volumeChapters = chapters.filter(
              chapter => chapter.volume_id === volume.id
            );

            return (
              <div key={volume.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleVolumeExpanded(volume.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    {volume.cover_image && (
                      <img
                        src={volume.cover_image}
                        alt={`Том ${volume.number}`}
                        className="w-16 h-24 object-cover rounded"
                      />
                    )}
                    <div className="text-left">
                      <h3 className="font-semibold">Том {volume.number}</h3>
                      {volume.title && (
                        <p className="text-gray-600">{volume.title}</p>
                      )}
                    </div>
                  </div>
                  {expandedVolumes[volume.id] ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedVolumes[volume.id] && (
                  <div className="border-t border-gray-200">
                    {volumeChapters.map((chapter) => (
                      <Link
                        key={chapter.id}
                        to={`/reader/${manga.id}/${chapter.id}`}
                        className="block p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">Розділ {chapter.number}</span>
                            {chapter.title && (
                              <span className="ml-2 text-gray-600">
                                {chapter.title}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(chapter.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ReviewSection
        reviews={reviews}
        mangaId={manga.id}
        onReviewAdded={(review) => {
          setReviews([...reviews, review]);
          loadMangaDetails();
        }}
      />

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onRate={handleRating}
        currentRating={progress?.rating}
      />
    </div>
  );
}