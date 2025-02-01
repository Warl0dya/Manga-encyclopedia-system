import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { BookOpen, Star, MessageCircle, Search, Home, TrendingUp, Clock, BookmarkPlus, User, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { MangaCatalog } from './MangaCatalog';
import { MangaDetails } from './MangaDetails';
import { MangaReader } from './MangaReader';
import { AdminPanel } from './AdminPanel';

export function MainLayout() {
  const { signOut, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8" />
                <span className="text-xl font-bold">МангаЧит</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-1 hover:text-indigo-200">
                <Home className="h-5 w-5" />
                <span>Головна</span>
              </Link>
              <Link to="/popular" className="flex items-center space-x-1 hover:text-indigo-200">
                <TrendingUp className="h-5 w-5" />
                <span>Популярне</span>
              </Link>
              <Link to="/new" className="flex items-center space-x-1 hover:text-indigo-200">
                <Clock className="h-5 w-5" />
                <span>Нові</span>
              </Link>
              <Link to="/admin" className="flex items-center space-x-1 hover:text-indigo-200">
                <Settings className="h-5 w-5" />
                <span>Адмін</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Пошук манги..."
                  className="pl-10 pr-4 py-2 rounded-lg bg-indigo-700 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-indigo-300" />
              </div>
              <Link to="/profile" className="hover:text-indigo-200">
                <User className="h-6 w-6" />
              </Link>
              <button
                onClick={() => signOut()}
                className="hover:text-indigo-200"
                title="Вийти"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<MangaCatalog />} />
        <Route path="/manga/:id" element={<MangaDetails />} />
        <Route path="/reader/:mangaId/:chapterId" element={<MangaReader />} />
        <Route path="/popular" element={<div>Популярне</div>} />
        <Route path="/new" element={<div>Нові</div>} />
        <Route path="/profile" element={<div>Профіль</div>} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </div>
  );
}