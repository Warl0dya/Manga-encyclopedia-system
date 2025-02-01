import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageSquare, X, Menu, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Chapter, Manga, Volume } from '../types/manga';
import { CommentSection } from './CommentSection';

export function MangaReader() {
  const { mangaId, chapterId } = useParams<{ mangaId: string; chapterId: string }>();
  const navigate = useNavigate();
  const [manga, setManga] = useState<Manga | null>(null);
  const [volume, setVolume] = useState<Volume | null>(null);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChapter() {
      if (!mangaId || !chapterId) return;

      try {
        // Load manga details
        const { data: mangaData, error: mangaError } = await supabase
          .from('manga')
          .select('*')
          .eq('id', mangaId)
          .single();

        if (mangaError) throw mangaError;
        setManga(mangaData);

        // Load all volumes
        const { data: volumesData, error: volumesError } = await supabase
          .from('volumes')
          .select('*')
          .eq('manga_id', mangaId)
          .order('number', { ascending: true });

        if (volumesError) throw volumesError;
        setVolumes(volumesData);

        // Load current chapter
        const { data: chapterData, error: chapterError } = await supabase
          .from('chapters')
          .select('*')
          .eq('id', chapterId)
          .single();

        if (chapterError) throw chapterError;
        setChapter(chapterData);

        // Load volume
        const { data: volumeData, error: volumeError } = await supabase
          .from('volumes')
          .select('*')
          .eq('id', chapterData.volume_id)
          .single();

        if (volumeError) throw volumeError;
        setVolume(volumeData);

        // Load all chapters for navigation
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('manga_id', mangaId)
          .order('number', { ascending: true });

        if (chaptersError) throw chaptersError;
        setChapters(chaptersData);
      } catch (error) {
        console.error('Error loading chapter:', error);
      } finally {
        setLoading(false);
      }
    }

    loadChapter();
  }, [mangaId, chapterId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!manga || !chapter || !volume) {
    return <div>Розділ не знайдено</div>;
  }

  const currentIndex = chapters.findIndex(c => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  const handleChapterClick = (selectedChapter: Chapter) => {
    navigate(`/reader/${manga.id}/${selectedChapter.id}`);
    setShowNavigation(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-gray-800 z-10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={`/manga/${manga.id}`}
                className="hover:text-indigo-400"
              >
                <ChevronLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="font-medium">{manga.title}</h1>
                <p className="text-sm text-gray-400">
                  Том {volume.number} - Розділ {chapter.number}
                  {chapter.title && ` - ${chapter.title}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowNavigation(!showNavigation)}
                className="hover:text-indigo-400"
                title="Навігація"
              >
                <Menu className="h-6 w-6" />
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="hover:text-indigo-400"
                title="Коментарі"
              >
                <MessageSquare className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reader */}
      <div className="container mx-auto px-4 pt-16 pb-20">
        <div className="max-w-3xl mx-auto space-y-4">
          {Array.isArray(chapter.pages) && chapter.pages.map((page, index) => (
            <img
              key={index}
              src={page}
              alt={`Сторінка ${index + 1}`}
              className="w-full"
              loading="lazy"
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {prevChapter ? (
              <Link
                to={`/reader/${manga.id}/${prevChapter.id}`}
                className="flex items-center gap-2 hover:text-indigo-400"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Розділ {prevChapter.number}</span>
              </Link>
            ) : (
              <div />
            )}
            {nextChapter && (
              <Link
                to={`/reader/${manga.id}/${nextChapter.id}`}
                className="flex items-center gap-2 hover:text-indigo-400"
              >
                <span>Розділ {nextChapter.number}</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sidebar */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-80 bg-gray-800 transform transition-transform duration-300 z-20 ${
          showNavigation ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-medium">Зміст</h2>
            <button
              onClick={() => setShowNavigation(false)}
              className="hover:text-indigo-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {volumes.map((vol) => {
              const volumeChapters = chapters.filter(
                (ch) => ch.volume_id === vol.id
              );

              return (
                <div key={vol.id} className="border-b border-gray-700">
                  <div className="p-4 bg-gray-750">
                    <div className="font-medium">Том {vol.number}</div>
                    {vol.title && (
                      <div className="text-sm text-gray-400">{vol.title}</div>
                    )}
                  </div>
                  <div className="divide-y divide-gray-700">
                    {volumeChapters.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => handleChapterClick(ch)}
                        className={`w-full text-left p-4 hover:bg-gray-700 flex items-center justify-between ${
                          ch.id === chapter.id ? 'bg-gray-700' : ''
                        }`}
                      >
                        <div>
                          <div>Розділ {ch.number}</div>
                          {ch.title && (
                            <div className="text-sm text-gray-400">
                              {ch.title}
                            </div>
                          )}
                        </div>
                        {ch.id === chapter.id && (
                          <BookOpen className="h-5 w-5 text-indigo-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comments Sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-96 bg-gray-800 transform transition-transform duration-300 z-20 ${
          showComments ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-medium">Коментарі</h2>
            <button
              onClick={() => setShowComments(false)}
              className="hover:text-indigo-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <CommentSection chapterId={chapter.id} />
          </div>
        </div>
      </div>
    </div>
  );
}