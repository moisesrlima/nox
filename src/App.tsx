import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { WelcomeModal } from './components/WelcomeModal';
import { ResetModal } from './components/ResetModal';
import { SettingsModal } from './components/SettingsModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Note, Folder, INITIAL_NOTE, THEMES, ThemeId } from './types';

export default function App() {
  const [isFirstVisit, setIsFirstVisit] = useLocalStorage('nox-first-visit', true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notes, setNotes] = useLocalStorage<Note[]>('nox-notes', [INITIAL_NOTE]);
  const [folders, setFolders] = useLocalStorage<Folder[]>('nox-folders', []);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [currentThemeId, setCurrentThemeId] = useLocalStorage<ThemeId>('nox-theme', 'zinc');

  // Apply theme
  useEffect(() => {
    const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];
    const root = document.documentElement;
    
    root.style.setProperty('--bg-primary', theme.colors.primary);
    root.style.setProperty('--bg-surface', theme.colors.surface);
    root.style.setProperty('--bg-hover', theme.colors.hover);
    root.style.setProperty('--accent-primary', theme.colors.accent);
    root.style.setProperty('--accent-soft', theme.colors.accentSoft);
    root.style.setProperty('--text-primary', theme.colors.textPrimary);
    root.style.setProperty('--text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--text-muted', theme.colors.textMuted);
    root.style.setProperty('--border-color', theme.colors.border);
    root.style.setProperty('--app-font', theme.font);
    
    // Calculate contrast color for accent
    const isDarkTheme = theme.isDark;
    const accentContrast = isDarkTheme ? '#FFFFFF' : (theme.id === 'zinc' ? '#FFFFFF' : '#FFFFFF');
    
    // For light themes with dark accent (like Olive), we might want white text.
    // For light themes with light accent, we might want dark text.
    // But usually, the accent colors provided are meant to have white text on them.
    // Let's refine this:
    if (theme.id === 'zinc') {
      root.style.setProperty('--accent-contrast', '#FFFFFF');
    } else if (theme.id === 'sapphire') {
      root.style.setProperty('--accent-contrast', '#FFFFFF');
    } else if (theme.id === 'olive') {
      root.style.setProperty('--accent-contrast', '#FFFFFF');
    } else if (theme.id === 'sakura') {
      root.style.setProperty('--accent-contrast', '#FFFFFF');
    } else {
      root.style.setProperty('--accent-contrast', isDarkTheme ? '#FFFFFF' : '#000000');
    }
    
    // Update body font
    document.body.style.fontFamily = theme.font;
  }, [currentThemeId]);

  // Set initial active note
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      // Find the most recently updated note
      const mostRecent = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      setActiveNoteId(mostRecent.id);
    }
  }, [notes, activeNoteId]);

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
    setFolders([]);
    setActiveNoteId(null);
    setIsFirstVisit(true);
    setShowResetModal(false);
    setIsSidebarOpen(false);
  };

  const handleCreateFolder = () => {
    const newFolder: Folder = {
      id: uuidv4(),
      name: 'Nova Pasta',
      createdAt: Date.now(),
    };
    setFolders((prev) => [newFolder, ...prev]);
  };

  const handleUpdateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders((prev) =>
      prev.map((folder) => (folder.id === id ? { ...folder, ...updates } : folder))
    );
  };

  const handleDeleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((folder) => folder.id !== id));
    // Move notes in this folder to uncategorized
    setNotes((prev) =>
      prev.map((note) => (note.folderId === id ? { ...note, folderId: undefined } : note))
    );
  };

  const handleMoveNoteToFolder = (noteId: string, folderId?: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === noteId ? { ...note, folderId } : note))
    );
  };

  const handleImport = (importedNotes: Note[]) => {
    setNotes(importedNotes);
    if (importedNotes.length > 0) {
      setActiveNoteId(importedNotes[0].id);
    }
    setIsSidebarOpen(false);
  };

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans selection:bg-[var(--bg-hover)] selection:text-[var(--text-primary)]">
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
      
      <Sidebar
        notes={notes}
        folders={folders}
        activeNoteId={activeNoteId}
        onSelectNote={(id) => {
          setActiveNoteId(id);
          setIsSidebarOpen(false);
        }}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onCreateFolder={handleCreateFolder}
        onUpdateFolder={handleUpdateFolder}
        onDeleteFolder={handleDeleteFolder}
        onMoveNoteToFolder={handleMoveNoteToFolder}
        onBackup={handleBackup}
        onImport={handleImport}
        onShowInfo={() => setShowWelcomeModal(true)}
        onResetData={() => setShowResetModal(true)}
        onOpenThemes={() => setShowSettingsModal(true)}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentThemeId={currentThemeId}
      />
      
      <Editor
        note={activeNote}
        onUpdateNote={handleUpdateNote}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentThemeId={currentThemeId}
      />
    </div>
  );
}
