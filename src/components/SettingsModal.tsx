import React from 'react';
import { X, Check, Palette, Type } from 'lucide-react';
import { THEMES, ThemeId } from '../types';

interface SettingsModalProps {
  currentThemeId: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  onClose: () => void;
}

export function SettingsModal({ currentThemeId, onSelectTheme, onClose }: SettingsModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800 rounded-lg text-emerald-400">
              <Palette className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-100">Configurações</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Temas Disponíveis
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    currentThemeId === theme.id 
                      ? 'bg-zinc-800 border-emerald-500/50 shadow-lg' 
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg shadow-inner flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.accent }}
                    >
                      <div className="w-4 h-4 bg-white/20 rounded-full" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-zinc-100">{theme.name}</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-1">
                        <Type className="w-3 h-3" /> {theme.font}
                      </div>
                    </div>
                  </div>
                  {currentThemeId === theme.id && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dica: Os temas alteram as cores de destaque e a tipografia do aplicativo para melhor se adequar ao seu estilo de trabalho.
            </p>
          </div>
        </div>

        <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-100 text-zinc-900 rounded-xl font-semibold hover:bg-white transition-colors"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}
