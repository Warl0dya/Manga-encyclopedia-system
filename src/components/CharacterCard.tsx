import React from 'react';
import type { Character } from '../types/manga';

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div className="aspect-square overflow-hidden">
        <img
          src={character.image || 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&q=80'}
          alt={character.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{character.name}</h3>
        {character.description && (
          <p className="text-gray-600 text-sm line-clamp-2">{character.description}</p>
        )}
      </div>
    </div>
  );
}