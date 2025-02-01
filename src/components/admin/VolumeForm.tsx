import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Volume } from '../../types/manga';

interface VolumeFormProps {
  volume?: Volume | null;
  mangaId: string;
  onClose: () => void;
  onSubmit: () => void;
}

export function VolumeForm({ volume, mangaId, onClose, onSubmit }: VolumeFormProps) {
  const [number, setNumber] = useState(volume?.number || 1);
  const [title, setTitle] = useState(volume?.title || '');
  const [coverImage, setCoverImage] = useState(volume?.cover_image || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (volume) {
        const { error } = await supabase
          .from('volumes')
          .update({
            number,
            title,
            cover_image: coverImage,
          })
          .eq('id', volume.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('volumes')
          .insert({
            manga_id: mangaId,
            number,
            title,
            cover_image: coverImage,
          });

        if (error) throw error;
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving volume:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {volume ? 'Редагувати том' : 'Додати том'}
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
              Номер тому
            </label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              min="1"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Назва тому
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL обкладинки
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}