import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { WelcomeModal } from './components/WelcomeModal';
import { ResetModal } from './components/ResetModal';
import { SettingsModal } from './components/SettingsModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Note, INITIAL_NOTE, THEMES, ThemeId } from './types';

export default function App() {
  const [isFirstVisit, setIsFirstVisit] = useLocalStorage('nox-first-visit', true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notes, setNotes] = useLocalStorage<Note[]>('nox-notes', [INITIAL_NOTE]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  // Detectar se é mobile e ajustar estado inicial do sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 768; // Aberto apenas em desktop
  });
  const [currentThemeId, setCurrentThemeId] = useLocalStorage<ThemeId>('nox-theme', 'zinc');

  const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  const themeStyles = {
    '--bg-primary': theme.colors.primary,
    '--bg-surface': theme.colors.surface,
    '--bg-hover': theme.colors.hover,
    '--bg-active': theme.colors.active,
    '--accent-primary': theme.colors.accent,
    '--accent-soft': theme.colors.accentSoft,
    '--text-primary': theme.colors.textPrimary,
    '--text-secondary': theme.colors.textSecondary,
    '--text-muted': theme.colors.textMuted,
    '--border-color': theme.colors.border,
    '--app-font': theme.font,
  } as React.CSSProperties;

  // Create dynamic font class based on theme font
  const fontClass = theme.font.toLowerCase().replace(/\s+/g, '-');
  const dynamicFontClass = fontClass === 'source-sans-3' ? 'font-source' : `font-${fontClass}`;

  // Set initial active note
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      // Find the most recently updated note
      const mostRecent = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      setActiveNoteId(mostRecent.id);
    }
  }, [notes, activeNoteId]);

  // Ajustar sidebar quando redimensionar a tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Em mobile, fechar o sidebar por padrão
        setIsSidebarOpen(false);
      }
    };

    // Executar uma vez no carregamento
    handleResize();

    // Adicionar listener para redimensionamento
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      if (remaining.length > 0) {
        setActiveNoteId(remaining.sort((a, b) => b.updatedAt - a.updatedAt)[0].id);
      } else {
        setActiveNoteId(null);
      }
    }
  };

  const handleBackup = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nox-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    setNotes([INITIAL_NOTE]);
    setActiveNoteId(null);
    setIsFirstVisit(true);
    setShowResetModal(false);
    setIsSidebarOpen(false);
  };

  const handleImport = (importedNotes: Note[]) => {
    setNotes(importedNotes);
    if (importedNotes.length > 0) {
      setActiveNoteId(importedNotes[0].id);
    }
    setIsSidebarOpen(false);
  };

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  // Debug: Verificar se há notas e qual é a nota ativa
  console.log('Debug App.tsx:', {
    notesCount: notes.length,
    activeNoteId,
    activeNote: activeNote ? { id: activeNote.id, title: activeNote.title } : null,
    isSidebarOpen,
    windowWidth: window.innerWidth
  });

  return (
    <div 
      className={`flex h-screen bg-background text-text-primary ${dynamicFontClass} selection:bg-surface selection:text-text-primary`}
      style={themeStyles}
    >
      <div className={`transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-72' : 'w-0 md:w-0'
      } overflow-hidden flex-shrink-0 ${isSidebarOpen ? 'block' : 'hidden md:block'}`}>
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={(id) => {
            setActiveNoteId(id);
            setIsSidebarOpen(false);
          }}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
          onBackup={handleBackup}
          onImport={handleImport}
          onShowInfo={() => setShowWelcomeModal(true)}
          onResetData={() => setShowResetModal(true)}
          onOpenThemes={() => setShowSettingsModal(true)}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          currentThemeId={currentThemeId}
        />
      </div>
      {(isFirstVisit || showWelcomeModal) && (
        <WelcomeModal 
          isFirstVisit={isFirstVisit}
          onAccept={() => {
            setIsFirstVisit(false);
            setShowWelcomeModal(false);
          }} 
        />
      )}

      {showResetModal && (
        <ResetModal 
          onConfirm={handleResetData}
          onCancel={() => setShowResetModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          currentThemeId={currentThemeId}
          onSelectTheme={setCurrentThemeId}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
      
      <div className="flex-1">
        <Editor
          note={activeNote}
          onUpdateNote={handleUpdateNote}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
    </div>
  );
}