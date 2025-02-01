import React from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen } from 'lucide-react';
import type { Manga } from '../types/manga';

interface MangaCardProps {
  manga: Manga;
  progress?: {
    is_favorite: boolean;
    rating?: number;
  };
}

export function MangaCard({ manga, progress }: MangaCardProps) {
  return (
    <Link to={`/manga/${manga.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={manga.cover_image || 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&q=80'}
            alt={manga.title}
            className="w-full h-full object-cover"
          />
          {progress?.is_favorite && (
            <div className="absolute top-2 right-2">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-white font-semibold truncate">{manga.title}</h3>
            {manga.original_title && (
              <p className="text-gray-300 text-sm truncate">{manga.original_title}</p>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
              ${manga.status === 'ongoing' ? 'bg-green-100 text-green-800' : 
                manga.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                'bg-yellow-100 text-yellow-800'}">
              {manga.status}
            </span>
            {progress?.rating && (
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1 text-sm">{progress.rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}