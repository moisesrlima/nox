import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { WelcomeModal } from './components/WelcomeModal';
import { ResetModal } from './components/ResetModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Note, INITIAL_NOTE } from './types';

export default function App() {
  const [isFirstVisit, setIsFirstVisit] = useLocalStorage('nox-first-visit', true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [notes, setNotes] = useLocalStorage<Note[]>('nox-notes', [INITIAL_NOTE]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-zinc-800 selection:text-zinc-100">
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
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <Editor
        note={activeNote}
        onUpdateNote={handleUpdateNote}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
}
