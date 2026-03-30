import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, Palette, Check, Moon, Sun } from 'lucide-react';
import { THEMES, ThemeId } from '../types';
import { AdUnit } from './AdUnit';

interface ThemeGalleryProps {
  currentThemeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  onClose: () => void;
}

export function ThemeGallery({ currentThemeId, onSelectTheme, onClose }: ThemeGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'dark' | 'light'>('all');

  const filteredThemes = THEMES.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         theme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'dark' && theme.isDark) || 
                         (filter === 'light' && !theme.isDark);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-6 bg-[var(--bg-surface)]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors text-[var(--text-secondary)]"
            title="Voltar ao Editor"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Galeria de Temas</h1>
        </div>

        <div className="relative max-w-md w-full mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <input
            type="text"
            placeholder="Buscar temas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all"
          />
        </div>
      </header>

      {/* Filters Bar */}
      <div className="flex items-center gap-2 p-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)]'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('dark')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === 'dark'
              ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)]'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <Moon size={14} />
          Escuros
        </button>
        <button
          onClick={() => setFilter('light')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === 'light'
              ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)]'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <Sun size={14} />
          Claros
        </button>
      </div>

      {/* Themes Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredThemes.map((theme, index) => {
            const isSelected = currentThemeId === theme.id;
            return (
              <React.Fragment key={theme.id}>
                {index === 6 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-1"
                  >
                    <AdUnit slot="THEME_GALLERY_SLOT" />
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`group relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    isSelected 
                      ? 'border-[var(--accent-primary)] shadow-xl shadow-[var(--accent-primary)]/20' 
                      : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
                  }`}
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {/* Theme Preview Card */}
                  <div className="p-5 flex flex-col h-full min-h-[180px]">
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                      >
                        <Palette size={20} />
                      </div>
                      {isSelected && (
                        <div className="bg-[var(--accent-primary)] text-[var(--accent-contrast)] p-1 rounded-full">
                          <Check size={14} />
                        </div>
                      )}
                    </div>

                    <h3 
                      className="text-lg font-bold mb-1"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {theme.name}
                    </h3>
                    <p 
                      className="text-xs line-clamp-2 opacity-70"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {theme.description}
                    </p>

                    {/* Color Swatches */}
                    <div className="mt-auto pt-4 flex gap-1.5">
                      <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: theme.colors.primary }} />
                      <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: theme.colors.surface }} />
                      <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: theme.colors.accent }} />
                    </div>
                  </div>

                  {/* Selection Overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-[var(--accent-primary)]/5 pointer-events-none" />
                  )}
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>

        {filteredThemes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mb-4 border border-[var(--border-color)]">
              <Search size={32} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Nenhum tema encontrado</h3>
            <p className="text-[var(--text-secondary)]">Tente buscar por outros termos ou filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
