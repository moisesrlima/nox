import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Menu, Type, Code, Download, FileType2, FileCode2, FileText, Music, Pause, Speech, Undo, Redo } from 'lucide-react';
import { Note } from '../types';

interface EditorTopBarProps {
  note: Note;
  mode: 'visual' | 'markdown';
  setMode: (mode: 'visual' | 'markdown') => void;
  onToggleSidebar: () => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportTxt: () => void;
  onExportHtml: () => void;
  onExportPdf: () => void;
  isReading?: boolean;
  isGlobalPlaying?: boolean;
  onToggleReading?: () => void;
  onGlobalPlayPause?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function EditorTopBar({
  note,
  mode,
  setMode,
  onToggleSidebar,
  onTitleChange,
  onExportTxt,
  onExportHtml,
  onExportPdf,
  isReading = false,
  isGlobalPlaying = false,
  onToggleReading,
  onGlobalPlayPause,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}: EditorTopBarProps) {
  return (
    <>
      <header className="flex-none h-16 border-b border-[var(--border-color)] flex items-center justify-between px-4 bg-[var(--bg-surface)] backdrop-blur-sm z-10 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={note.title}
            onChange={onTitleChange}
            placeholder="Título da nota"
            className="flex-1 bg-transparent text-xl font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none truncate"
          />
        </div>

        <div className="flex items-center gap-2 ml-4">
          <div className="hidden sm:flex items-center bg-[var(--bg-primary)] rounded-lg p-1 border border-[var(--border-color)]">
            <button
              onClick={() => setMode('visual')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'visual' ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]/50'
              }`}
            >
              <Type className="w-4 h-4" /> Visual
            </button>
            <button
              onClick={() => setMode('markdown')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'markdown' ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]/50'
              }`}
            >
              <Code className="w-4 h-4" /> Markdown
            </button>
          </div>

          {mode === 'visual' && onUndo && onRedo && (
            <div className="hidden sm:flex items-center bg-[var(--bg-primary)] rounded-lg p-1 border border-[var(--border-color)] mr-1">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-1.5 rounded-md transition-colors ${
                  canUndo ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]/50' : 'text-[var(--text-muted)] cursor-not-allowed'
                }`}
                title="Desfazer"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-1.5 rounded-md transition-colors ${
                  canRedo ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]/50' : 'text-[var(--text-muted)] cursor-not-allowed'
                }`}
                title="Refazer"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
          )}

          {onGlobalPlayPause && (
            <button
              onClick={onGlobalPlayPause}
              className={`p-2 rounded-lg transition-colors ${
                isGlobalPlaying 
                  ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
              title={isGlobalPlaying ? "Pausar música/foco" : "Tocar música/foco"}
            >
              {isGlobalPlaying ? <Pause className="w-5 h-5" /> : <Music className="w-5 h-5" />}
            </button>
          )}

          {onToggleReading && (
            <button
              onClick={onToggleReading}
              className={`p-2 rounded-lg transition-colors ${
                isReading 
                  ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
              title={isReading ? "Parar leitura" : "Ler nota em voz alta"}
            >
              <Speech className="w-5 h-5" />
            </button>
          )}

          <div className="relative group">
            <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Exportar</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1">
              <button onClick={onExportTxt} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors">
                <FileType2 className="w-4 h-4" /> TXT
              </button>
              <button onClick={onExportHtml} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors">
                <FileCode2 className="w-4 h-4" /> HTML
              </button>
              <button onClick={onExportPdf} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors">
                <FileText className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-none px-4 py-2 bg-[var(--bg-primary)]/30 border-b border-[var(--border-color)]/50 flex items-center gap-4 text-xs text-[var(--text-muted)] transition-colors">
        <span>Criado: {format(note.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
        <span>Modificado: {format(note.updatedAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
      </div>
    </>
  );
}
