import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRate: (rating: number) => void;
  currentRating?: number;
}

export function RatingModal({ isOpen, onClose, onRate, currentRating }: RatingModalProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Оцініть мангу</h3>
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              onClick={() => {
                onRate(value);
                onClose();
              }}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1"
            >
              <Star
                className={`w-8 h-8 ${
                  value <= (hoveredRating || currentRating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
}