export interface Manga {
  id: string;
  title: string;
  original_title?: string;
  description?: string;
  cover_image?: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  created_at: string;
  updated_at: string;
}

export interface Volume {
  id: string;
  manga_id: string;
  number: number;
  title?: string;
  cover_image?: string;
  created_at: string;
}

export interface Chapter {
  id: string;
  manga_id: string;
  volume_id: string;
  number: number;
  title?: string;
  pages: string[];
  created_at: string;
}

export interface Character {
  id: string;
  manga_id: string;
  name: string;
  description?: string;
  image?: string;
  created_at: string;
}

export interface Review {
  id: string;
  manga_id: string;
  user_id: string;
  content: string;
  rating: number;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
  };
}

export interface UserMangaProgress {
  id: string;
  user_id: string;
  manga_id: string;
  last_read_chapter?: string;
  is_favorite: boolean;
  rating?: number;
  created_at: string;
  updated_at: string;
}