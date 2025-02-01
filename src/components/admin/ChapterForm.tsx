import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Chapter } from '../../types/manga';

interface ChapterFormProps {
  chapter?: Chapter | null;
  mangaId: string;
  volumeId: string;
  onClose: () => void;
  onSubmit: () => void;
}

export function ChapterForm({ chapter, mangaId, volumeId, onClose, onSubmit }: ChapterFormProps) {
  const [number, setNumber] = useState(chapter?.number || 1);
  const [title, setTitle] = useState(chapter?.title || '');
  const [pages, setPages] = useState<string[]>(chapter?.pages || ['']);
  const [submitting, setSubmitting] = useState(false);

  const handleAddPage = () => {
    setPages([...pages, '']);
  };

  const handleRemovePage = (index: number) => {
    setPages(pages.filter((_, i) => i !== index));
  };

  const handlePageChange = (index: number, value: string) => {
    const newPages = [...pages];
    newPages[index] = value;
    setPages(newPages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const filteredPages = pages.filter(page => page.trim() !== '');

      if (chapter) {
        const { error } = await supabase
          .from('chapters')
          .update({
            number,
            title,
            pages: filteredPages,
          })
          .eq('id', chapter.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('chapters')
          .insert({
            manga_id: mangaId,
            volume_id: volumeId,
            number,
            title,
            pages: filteredPages,
          });

        if (error) throw error;
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving chapter:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {chapter ? 'Редагувати розділ' : 'Додати розділ'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Номер розділу
            </label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(parseFloat(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              min="1"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Назва розділу
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Сторінки
              </label>
              <button
                type="button"
                onClick={handleAddPage}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Додати сторінку
              </button>
            </div>
            <div className="space-y-2">
              {pages.map((page, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={page}
                    onChange={(e) => handlePageChange(index, e.target.value)}
                    placeholder={`URL сторінки ${index + 1}`}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePage(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg -indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}