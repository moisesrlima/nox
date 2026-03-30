import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { WelcomeModal } from './components/WelcomeModal';
import { ThemeGallery } from './components/ThemeGallery';
import { TemplateGallery } from './components/TemplateGallery';
import { ResetModal } from './components/ResetModal';
import { Note, Folder, INITIAL_NOTE, THEMES } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

export function NoxNoteApp() {
  const [notes, setNotes] = useLocalStorage<Note[]>('nox-notes', [INITIAL_NOTE]);
  const [folders, setFolders] = useLocalStorage<Folder[]>('nox-folders', []);
  const [currentNoteId, setCurrentNoteId] = useLocalStorage<string | null>('nox-current-note', INITIAL_NOTE.id);
  const [currentThemeId, setCurrentThemeId] = useLocalStorage<string>('nox-theme', 'zinc');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useLocalStorage('nox-welcome-seen', false);

  const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  useEffect(() => {
    const root = document.documentElement;
    if (theme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });
    root.style.setProperty('--font-family', theme.font);
  }, [theme]);

  const handleNoteCreate = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Nova Nota',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setCurrentNoteId(newNote.id);
  };

  const handleNoteUpdate = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  };

  const handleNoteDelete = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (currentNoteId === id) {
      setCurrentNoteId(notes.length > 1 ? notes.find(n => n.id !== id)?.id || null : null);
    }
  };

  const handleFolderCreate = () => {
    const name = prompt('Nome da nova pasta:');
    if (!name) return;
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
    };
    setFolders([...folders, newFolder]);
  };

  const handleFolderDelete = (id: string) => {
    setFolders(folders.filter(f => f.id !== id));
    setNotes(notes.map(n => n.folderId === id ? { ...n, folderId: undefined } : n));
  };

  const handleFolderUpdate = (id: string, updates: Partial<Folder>) => {
    setFolders(folders.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleNoteMove = (noteId: string, folderId?: string) => {
    setNotes(notes.map(n => n.id === noteId ? { ...n, folderId: folderId || undefined } : n));
  };

  const handleRestore = (data: { notes: Note[], folders: Folder[] }) => {
    setNotes(data.notes);
    setFolders(data.folders);
  };

  const handleBackup = () => {
    const data = { notes, folders };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nox-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    setNotes([INITIAL_NOTE]);
    setFolders([]);
    setCurrentNoteId(INITIAL_NOTE.id);
    setCurrentThemeId('zinc');
    setIsResetOpen(false);
  };

  const currentNote = notes.find(n => n.id === currentNoteId) || null;

  return (
    <div className="flex h-screen bg-[var(--primary)] text-[var(--text-primary)] font-[var(--font-family)] transition-colors duration-200">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        notes={notes}
        folders={folders}
        activeNoteId={currentNoteId}
        onSelectNote={setCurrentNoteId}
        onCreateNote={handleNoteCreate}
        onDeleteNote={handleNoteDelete}
        onCreateFolder={handleFolderCreate}
        onDeleteFolder={handleFolderDelete}
        onUpdateFolder={(id, updates) => handleFolderUpdate(id, updates)}
        onMoveNoteToFolder={handleNoteMove}
        onRestore={handleRestore}
        onBackup={handleBackup}
        onResetData={() => setIsResetOpen(true)}
        onOpenThemes={() => setIsThemeOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onShowInfo={() => setIsInfoOpen(true)}
        onImport={(importedNotes) => {
          setNotes([...importedNotes, ...notes]);
        }}
        onImportTemplate={(note) => {
          const newNote = { ...note, id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now() };
          setNotes([newNote, ...notes]);
          setCurrentNoteId(newNote.id);
          setIsGalleryOpen(false);
        }}
        currentThemeId={currentThemeId}
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {currentNote ? (
          <Editor
            note={currentNote}
            onUpdateNote={handleNoteUpdate}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            currentThemeId={currentThemeId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">
            Selecione ou crie uma nota para começar
          </div>
        )}
      </main>

      <WelcomeModal isOpen={!showWelcome} onClose={() => setShowWelcome(true)} />
      <ThemeGallery
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        currentThemeId={currentThemeId}
        onSelectTheme={setCurrentThemeId}
      />
      <TemplateGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectTemplate={(note) => {
          const newNote = { ...note, id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now() };
          setNotes([newNote, ...notes]);
          setCurrentNoteId(newNote.id);
          setIsGalleryOpen(false);
        }}
      />
      <ResetModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleResetData}
      />
    </div>
  );
}
