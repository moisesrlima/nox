import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Note } from '../types';
import { Plus, Search, Download, FileText, Trash2, MoreVertical, Menu, Info, AlertTriangle, Settings, ChevronUp, Upload, Palette } from 'lucide-react';

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
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 bg-zinc-100 rounded-md flex items-center justify-center text-zinc-950 text-sm font-black">N</span>
            Nox
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={onShowInfo}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Informações de Segurança"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={onCreateNote}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Nova Nota"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Pesquisar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 placeholder-zinc-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="text-center text-zinc-500 text-sm py-8">
              Nenhuma nota encontrada.
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  activeNoteId === note.id
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-sm font-medium truncate">
                    {note.title || 'Sem título'}
                  </h3>
                  <p className="text-xs text-zinc-500 truncate mt-1">
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
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-md transition-all"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </div>
            <ChevronUp className={`w-4 h-4 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSettingsOpen && (
            <div className="mt-2 space-y-1 pl-2 border-l-2 border-zinc-800 ml-2">
              <button
                onClick={onOpenThemes}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Palette className="w-4 h-4 text-emerald-400" />
                Temas
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Importar Backup
              </button>
              <button
                onClick={onBackup}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar Backup
              </button>
              <button
                onClick={onResetData}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-lg transition-colors mt-2"
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
