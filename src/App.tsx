import React, { useState, useEffect, Suspense, lazy } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './components/Sidebar';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Note, Folder, INITIAL_NOTE, THEMES, ThemeId } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';

import { NoxFlow } from './components/NoxFlow';
import { NoxFlowMini } from './components/NoxFlowMini';
import { FloatingNoxFlowWidget } from './components/FloatingNoxFlowWidget';

// Lazy load components
const Editor = lazy(() => import('./components/Editor').then(m => ({ default: m.Editor })));
const TemplateGallery = lazy(() => import('./components/TemplateGallery').then(m => ({ default: m.TemplateGallery })));
const WelcomeModal = lazy(() => import('./components/WelcomeModal').then(m => ({ default: m.WelcomeModal })));
const ResetModal = lazy(() => import('./components/ResetModal').then(m => ({ default: m.ResetModal })));
const ThemeGallery = lazy(() => import('./components/ThemeGallery').then(m => ({ default: m.ThemeGallery })));

export default function App() {
  const [isFirstVisit, setIsFirstVisit] = useLocalStorage('nox-first-visit', true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showThemeGallery, setShowThemeGallery] = useState(false);
  const [showNoxFlow, setShowNoxFlow] = useState(false);
  const [showNoxFlowMini, setShowNoxFlowMini] = useState(false);
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
    
    // Set accent contrast color
    // Most of our accent colors are vibrant/dark enough for white text
    root.style.setProperty('--accent-contrast', '#FFFFFF');
    
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

  const handleRestore = (data: { notes: Note[], folders: Folder[] }) => {
    if (data.notes && Array.isArray(data.notes)) {
      setNotes(data.notes);
    }
    if (data.folders && Array.isArray(data.folders)) {
      setFolders(data.folders);
    }
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

  const handleImportTemplate = (template: Note) => {
    setNotes((prev) => [template, ...prev]);
    setActiveNoteId(template.id);
    setIsSidebarOpen(false);
    setShowTemplateGallery(false);
    setShowThemeGallery(false);
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
    <ErrorBoundary>
      <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans selection:bg-[var(--bg-hover)] selection:text-[var(--text-primary)]">
        <Suspense fallback={null}>
          {(isFirstVisit || showWelcomeModal) && (
            <WelcomeModal 
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
        </Suspense>
        
        <Sidebar
          notes={notes}
          folders={folders}
          activeNoteId={activeNoteId}
          onSelectNote={(id) => {
            setActiveNoteId(id);
            setIsSidebarOpen(false);
            setShowTemplateGallery(false);
            setShowThemeGallery(false);
            setShowNoxFlow(false);
          }}
          onCreateNote={() => {
            handleCreateNote();
            setShowTemplateGallery(false);
            setShowThemeGallery(false);
            setShowNoxFlow(false);
          }}
          onDeleteNote={handleDeleteNote}
          onCreateFolder={handleCreateFolder}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
          onMoveNoteToFolder={handleMoveNoteToFolder}
          onBackup={handleBackup}
          onRestore={handleRestore}
          onImport={handleImport}
          onImportTemplate={handleImportTemplate}
          onShowInfo={() => setShowWelcomeModal(true)}
          onResetData={() => setShowResetModal(true)}
          onOpenThemes={() => {
            setShowThemeGallery(true);
            setShowTemplateGallery(false);
            setShowNoxFlow(false);
            setIsSidebarOpen(false);
          }}
          onOpenGallery={() => {
            setShowTemplateGallery(true);
            setShowThemeGallery(false);
            setShowNoxFlow(false);
            setIsSidebarOpen(false);
          }}
          onOpenNoxFlow={() => {
            setShowNoxFlow(true);
            setShowTemplateGallery(false);
            setShowThemeGallery(false);
            setIsSidebarOpen(false);
          }}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          currentThemeId={currentThemeId}
        />
        
        <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)]"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>}>
          <ErrorBoundary>
            {showNoxFlow ? (
              <NoxFlow onClose={() => setShowNoxFlow(false)} />
            ) : showTemplateGallery ? (
              <TemplateGallery
                onClose={() => setShowTemplateGallery(false)}
                onSelectTemplate={handleImportTemplate}
              />
            ) : showThemeGallery ? (
              <ThemeGallery
                currentThemeId={currentThemeId}
                onSelectTheme={setCurrentThemeId}
                onClose={() => setShowThemeGallery(false)}
              />
            ) : (
              <div className="flex-1 flex overflow-hidden">
                <Editor
                  note={activeNote}
                  onUpdateNote={handleUpdateNote}
                  onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  onToggleNoxFlowMini={() => setShowNoxFlowMini(!showNoxFlowMini)}
                  currentThemeId={currentThemeId}
                  autoFocus={!showWelcomeModal && !isFirstVisit && !showTemplateGallery && !showThemeGallery && !showNoxFlow}
                />
                {showNoxFlowMini && (
                  <NoxFlowMini 
                    onClose={() => setShowNoxFlowMini(false)} 
                    onOpenFull={() => {
                      setShowNoxFlowMini(false);
                      setShowNoxFlow(true);
                    }} 
                  />
                )}
                <FloatingNoxFlowWidget />
              </div>
            )}
          </ErrorBoundary>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
