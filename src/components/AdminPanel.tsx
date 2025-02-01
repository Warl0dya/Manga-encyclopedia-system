import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Manga, Volume, Chapter } from '../types/manga';
import { MangaForm } from './admin/MangaForm';
import { VolumeForm } from './admin/VolumeForm';
import { ChapterForm } from './admin/ChapterForm';

export function AdminPanel() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [volumes, setVolumes] = useState<Record<string, Volume[]>>({});
  const [chapters, setChapters] = useState<Record<string, Chapter[]>>({});
  const [expandedManga, setExpandedManga] = useState<string | null>(null);
  const [expandedVolume, setExpandedVolume] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMangaForm, setShowMangaForm] = useState(false);
  const [showVolumeForm, setShowVolumeForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedMangaId, setSelectedMangaId] = useState<string | null>(null);
  const [selectedVolumeId, setSelectedVolumeId] = useState<string | null>(null);

  useEffect(() => {
    loadMangas();
  }, []);

  async function loadMangas() {
    try {
      const { data: mangaData, error: mangaError } = await supabase
        .from('manga')
        .select('*')
        .order('title');

      if (mangaError) throw mangaError;
      setMangas(mangaData);
    } catch (error) {
      console.error('Error loading mangas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadVolumes(mangaId: string) {
    try {
      const { data: volumeData, error: volumeError } = await supabase
        .from('volumes')
        .select('*')
        .eq('manga_id', mangaId)
        .order('number');

      if (volumeError) throw volumeError;
      setVolumes(prev => ({ ...prev, [mangaId]: volumeData }));
    } catch (error) {
      console.error('Error loading volumes:', error);
    }
  }

  async function loadChapters(volumeId: string) {
    try {
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('volume_id', volumeId)
        .order('number');

      if (chapterError) throw chapterError;
      setChapters(prev => ({ ...prev, [volumeId]: chapterData }));
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  }

  async function handleMangaDelete(mangaId: string) {
    if (!confirm('Ви впевнені, що хочете видалити цю мангу?')) return;

    try {
      const { error } = await supabase
        .from('manga')
        .delete()
        .eq('id', mangaId);

      if (error) throw error;
      await loadMangas();
    } catch (error) {
      console.error('Error deleting manga:', error);
    }
  }

  async function handleVolumeDelete(volumeId: string) {
    if (!confirm('Ви впевнені, що хочете видалити цей том?')) return;

    try {
      const { error } = await supabase
        .from('volumes')
        .delete()
        .eq('id', volumeId);

      if (error) throw error;
      if (selectedMangaId) {
        await loadVolumes(selectedMangaId);
      }
    } catch (error) {
      console.error('Error deleting volume:', error);
    }
  }

  async function handleChapterDelete(chapterId: string) {
    if (!confirm('Ви впевнені, що хочете видалити цей розділ?')) return;

    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) throw error;
      if (selectedVolumeId) {
        await loadChapters(selectedVolumeId);
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  }

  const handleMangaClick = async (mangaId: string) => {
    if (expandedManga === mangaId) {
      setExpandedManga(null);
    } else {
      setExpandedManga(mangaId);
      setSelectedMangaId(mangaId);
      await loadVolumes(mangaId);
    }
  };

  const handleVolumeClick = async (volumeId: string) => {
    if (expandedVolume === volumeId) {
      setExpandedVolume(null);
    } else {
      setExpandedVolume(volumeId);
      setSelectedVolumeId(volumeId);
      await loadChapters(volumeId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Адмін панель</h1>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowMangaForm(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            Додати мангу
          </button>
        </div>

        <div className="space-y-4">
          {mangas.map((manga) => (
            <div key={manga.id} className="border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={() => handleMangaClick(manga.id)}
                  className="flex items-center gap-2"
                >
                  {expandedManga === manga.id ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                  <span className="font-medium">{manga.title}</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(manga);
                      setShowMangaForm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMangaDelete(manga.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {expandedManga === manga.id && (
                <div className="border-t border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Томи</h3>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setSelectedMangaId(manga.id);
                        setShowVolumeForm(true);
                      }}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Додати том
                    </button>
                  </div>

                  <div className="space-y-2 pl-4">
                    {volumes[manga.id]?.map((volume) => (
                      <div key={volume.id} className="border border-gray-100 rounded-lg">
                        <div className="flex items-center justify-between p-3">
                          <button
                            onClick={() => handleVolumeClick(volume.id)}
                            className="flex items-center gap-2"
                          >
                            {expandedVolume === volume.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span>Том {volume.number}</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(volume);
                                setSelectedMangaId(manga.id);
                                setShowVolumeForm(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleVolumeDelete(volume.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {expandedVolume === volume.id && (
                          <div className="border-t border-gray-100 p-3">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-medium">Розділи</h4>
                              <button
                                onClick={() => {
                                  setEditingItem(null);
                                  setSelectedMangaId(manga.id);
                                  setSelectedVolumeId(volume.id);
                                  setShowChapterForm(true);
                                }}
                                className="flex items-center gap-1 bg-indigo-600 text-white px-2 py-1 rounded-lg hover:bg-indigo-700 text-sm"
                              >
                                <Plus className="w-3 h-3" />
                                Додати розділ
                              </button>
                            </div>

                            <div className="space-y-2 pl-4">
                              {chapters[volume.id]?.map((chapter) => (
                                <div
                                  key={chapter.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                >
                                  <span className="text-sm">
                                    Розділ {chapter.number}
                                    {chapter.title && ` - ${chapter.title}`}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingItem(chapter);
                                        setSelectedMangaId(manga.id);
                                        setSelectedVolumeId(volume.id);
                                        setShowChapterForm(true);
                                      }}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleChapterDelete(chapter.id)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showMangaForm && (
        <MangaForm
          manga={editingItem}
          onClose={() => {
            setShowMangaForm(false);
            setEditingItem(null);
          }}
          onSubmit={async () => {
            await loadMangas();
            setShowMangaForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {showVolumeForm && selectedMangaId && (
        <VolumeForm
          volume={editingItem}
          mangaId={selectedMangaId}
          onClose={() => {
            setShowVolumeForm(false);
            setEditingItem(null);
          }}
          onSubmit={async () => {
            await loadVolumes(selectedMangaId);
            setShowVolumeForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {showChapterForm && selectedMangaId && selectedVolumeId && (
        <ChapterForm
          chapter={editingItem}
          mangaId={selectedMangaId}
          volumeId={selectedVolumeId}
          onClose={() => {
            setShowChapterForm(false);
            setEditingItem(null);
          }}
          onSubmit={async () => {
            await loadChapters(selectedVolumeId);
            setShowChapterForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}