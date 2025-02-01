import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MangaCard } from './MangaCard';
import { useAuthStore } from '../store/authStore';
import type { Manga, UserMangaProgress } from '../types/manga';

export function MangaCatalog() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [progress, setProgress] = useState<Record<string, UserMangaProgress>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadMangas() {
      try {
        const { data: mangaData, error: mangaError } = await supabase
          .from('manga')
          .select('*')
          .order('updated_at', { ascending: false });

        if (mangaError) throw mangaError;

        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_manga_progress')
            .select('*')
            .eq('user_id', user.id);

          if (progressError) throw progressError;

          const progressMap = progressData.reduce((acc, curr) => {
            acc[curr.manga_id] = curr;
            return acc;
          }, {} as Record<string, UserMangaProgress>);

          setProgress(progressMap);
        }

        setMangas(mangaData);
      } catch (error) {
        console.error('Error loading manga:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMangas();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {mangas.map((manga) => (
        <MangaCard
          key={manga.id}
          manga={manga}
          progress={progress[manga.id]}
        />
      ))}
    </div>
  );
}