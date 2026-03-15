import React from 'react';
import { PanelLeftClose, Type, Code, Download, Volume2, Maximize2, Minimize2, Menu, FileType2, FileCode2, FileText, Play, Pause, BookAudio } from 'lucide-react';

interface EditorHeaderProps {
  note: any;
  mode: 'visual' | 'markdown';
  isFullscreen: boolean;
  isReading: boolean;
  isMobileMenuOpen: boolean;
  isGlobalPlaying: boolean;
  onToggleSidebar: () => void;
  onModeChange: (mode: 'visual' | 'markdown') => void;
  onTitleChange: (title: string) => void;
  onToggleMobileMenu: () => void;
  onExportTxt: () => void;
  onExportHtml: () => void;
  onExportPdf: () => void;
  onToggleReading: () => void;
  onToggleFullscreen: () => void;
  onGlobalPlayPause: () => void;
}

export function EditorHeader({
  note,
  mode,
  isFullscreen,
  isReading,
  isMobileMenuOpen,
  isGlobalPlaying,
  onToggleSidebar,
  onModeChange,
  onTitleChange,
  onToggleMobileMenu,
  onExportTxt,
  onExportHtml,
  onExportPdf,
  onToggleReading,
  onToggleFullscreen,
  onGlobalPlayPause
}: EditorHeaderProps) {
  return (
    <header className="flex-none h-16 border-b border-border flex items-center justify-between px-4 bg-background/50 backdrop-blur-sm z-10">
      {/* Left side: Sidebar toggle and Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-hover rounded-lg transition-colors"
            title="Alternar menu lateral"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>
        <input
          type="text"
          value={note.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Título da nota"
          className="flex-1 bg-surface border border-border text-text-primary text-xl font-semibold rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent placeholder-text-muted truncate"
        />
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center bg-surface rounded-lg p-1 border border-border">
            <button
              onClick={() => onModeChange('visual')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'visual' ? 'bg-accent text-accent-contrast shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-hover/50'
              }`}
            >
              <Type className={`w-4 h-4 ${mode === 'visual' ? 'text-accent-contrast' : 'text-text-secondary group-hover:text-text-primary'}`} /> Visual
            </button>
            <button
              onClick={() => onModeChange('markdown')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'markdown' ? 'bg-accent text-accent-contrast shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-hover/50'
              }`}
            >
              <Code className={`w-4 h-4 ${mode === 'markdown' ? 'text-accent-contrast' : 'text-text-secondary group-hover:text-text-primary'}`} /> Markdown
            </button>
          </div>

          <div className="relative group">
            <button className="p-2 text-text-muted hover:text-text-primary hover:bg-hover rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1">
              <button onClick={onExportTxt} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors">
                <FileType2 className="w-4 h-4" /> TXT
              </button>
              <button onClick={onExportHtml} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors">
                <FileCode2 className="w-4 h-4" /> HTML
              </button>
              <button onClick={onExportPdf} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors">
                <FileText className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>

          <button
            onClick={onGlobalPlayPause}
            className={`p-2 rounded-lg transition-colors ${
              isGlobalPlaying 
                ? 'text-accent bg-accent/10' 
                : 'text-text-muted hover:text-text-primary hover:bg-hover'
            }`}
            title={isGlobalPlaying ? "Pausar música" : "Tocar música"}
          >
            {isGlobalPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={onToggleReading}
            className={`p-2 rounded-lg transition-colors ${
              isReading 
                ? 'text-accent bg-accent/10' 
                : 'text-text-muted hover:text-text-primary hover:bg-hover'
            }`}
            title={isReading ? "Parar leitura" : "Ler nota em voz alta"}
          >
            <BookAudio className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-hover rounded-lg transition-colors"
            title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Actions (Hamburger Menu) */}
        <div className="relative md:hidden">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-hover rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-text-secondary group-hover:text-text-primary" />
          </button>

          {isMobileMenuOpen && (
            <div 
              className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl z-50 py-2"
              onClick={() => onToggleMobileMenu()}
            >
              <div className="px-4 py-2">
                <p className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2">Modo</p>
                <div className="flex items-center bg-background rounded-lg p-1 border border-border">
                  <button
                    onClick={() => onModeChange('visual')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      mode === 'visual' ? 'bg-accent text-accent-contrast shadow-sm' : 'text-text-secondary'
                    }`}
                  >
                    <Type className="w-4 h-4" /> Visual
                  </button>
                  <button
                    onClick={() => onModeChange('markdown')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      mode === 'markdown' ? 'bg-accent text-accent-contrast shadow-sm' : 'text-text-secondary'
                    }`}
                  >
                    <Code className="w-4 h-4" /> Markdown
                  </button>
                </div>
              </div>
              
              <div className="border-t border-border my-1" />

              <div className="px-4 py-2">
                <p className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2">Ações</p>
                <button onClick={onGlobalPlayPause} className="w-full flex items-center gap-3 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors rounded-md">
                  {isGlobalPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isGlobalPlaying ? "Pausar música" : "Tocar música"}</span>
                </button>
                <button onClick={onToggleReading} className="w-full flex items-center gap-3 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors rounded-md">
                  <BookAudio className="w-4 h-4" />
                  <span>{isReading ? "Parar leitura" : "Ler nota em voz alta"}</span>
                </button>
                <button onClick={onToggleFullscreen} className="w-full flex items-center gap-3 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors rounded-md">
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span>{isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}</span>
                </button>
              </div>
              
              <div className="border-t border-border my-1" />

              <div className="px-4 py-2">
                <p className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2">Exportar</p>
                <button onClick={onExportTxt} className="w-full flex items-center gap-3 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors rounded-md">
                  <FileType2 className="w-4 h-4" /> TXT
                </button>
                <button onClick={onExportHtml} className="w-full flex items-center gap-3 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors rounded-md">
                  <FileCode2 className="w-4 h-4" /> HTML
                </button>
                <button onClick={onExportPdf} className="w-full flex items-center gap-3 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors rounded-md">
                  <FileText className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}