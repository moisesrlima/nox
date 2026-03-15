import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Note } from '../types';
import { Plus, Search, Download, Trash2, Info, AlertTriangle, Settings, ChevronUp, Upload, Palette } from 'lucide-react';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onBackup: () => void;
  onImport: (notes: Note[]) => void;
  onShowInfo: () => void;
  onResetData: () => void;
  onOpenThemes: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentThemeId: string;
}

export function Sidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onBackup,
  onImport,
  onShowInfo,
  onResetData,
  onOpenThemes,
  isOpen,
  setIsOpen,
  currentThemeId,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
          onImport(parsed);
        } else {
          console.error('Formato de backup inválido.');
        }
      } catch (error) {
        console.error('Falha ao ler o arquivo de backup', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const filteredNotes = notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <>
      <div
        className={`absolute md:relative h-full w-72 bg-surface border-r border-border flex flex-col transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-md flex items-center justify-center text-sm font-black ${
                currentThemeId === 'zinc'
                  ? 'bg-background text-text-primary'
                  : 'bg-text-primary text-background'
              }`}
            >
              N
            </span>
            Nox
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={onShowInfo}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-hover rounded-lg transition-colors"
              title="Informações de Segurança"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={onCreateNote}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-hover rounded-lg transition-colors"
              title="Nova Nota"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Pesquisar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border text-text-secondary text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent placeholder-text-muted"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="text-center text-text-muted text-sm py-8">
              Nenhuma nota encontrada.
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  activeNoteId === note.id
                    ? 'bg-surface text-text-primary'
                    : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-sm font-medium truncate">
                    {note.title || 'Sem título'}
                  </h3>
                  <p className="text-xs text-text-muted truncate mt-1">
                    {format(note.updatedAt, "d 'de' MMM, yyyy", { locale: ptBR })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
                      onDeleteNote(note.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-text-muted hover:text-error hover:bg-surface rounded-md transition-all"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
              isSettingsOpen 
                ? 'bg-accent text-accent-contrast font-medium' 
                : 'text-text-secondary hover:text-text-primary hover:bg-hover'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </div>
            <ChevronUp
              className={`w-4 h-4 transition-transform ${
                isSettingsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isSettingsOpen && (
            <div className="mt-2 space-y-1 pl-2 border-l-2 border-border ml-2">
              <button
                onClick={onOpenThemes}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-accent hover:text-accent-contrast rounded-lg transition-colors"
              >
                <Palette className="w-4 h-4" />
                Temas
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-accent hover:text-accent-contrast rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Importar Backup
              </button>
              <button
                onClick={onBackup}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-accent hover:text-accent-contrast rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar Backup
              </button>
              <button
                onClick={onResetData}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:text-error hover:bg-error/10 rounded-lg transition-colors mt-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Limpar Dados
              </button>
            </div>
          )}
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}