import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Note, Folder } from '../types';
import { Plus, Search, Download, Trash2, Info, AlertTriangle, Settings, ChevronUp, Upload, Palette, Share2, Play, Pause, Volume2, Radio, Clock, Coffee, Folder as FolderIcon, ChevronRight, MoreVertical, Edit2, FolderPlus, Sparkles, FileText } from 'lucide-react';
import { TEMPLATES, createNoteFromTemplate } from '../templates';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { GoogleDriveSync } from './GoogleDriveSync';

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onCreateFolder: () => void;
  onUpdateFolder: (id: string, updates: Partial<Folder>) => void;
  onDeleteFolder: (id: string) => void;
  onMoveNoteToFolder: (noteId: string, folderId?: string) => void;
  onBackup: () => void;
  onRestore: (data: { notes: Note[], folders: Folder[] }) => void;
  onImport: (notes: Note[]) => void;
  onImportTemplate: (template: Note) => void;
  onShowInfo: () => void;
  onResetData: () => void;
  onOpenThemes: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentThemeId: string;
}

export function Sidebar({
  notes,
  folders,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onMoveNoteToFolder,
  onBackup,
  onRestore,
  onImport,
  onImportTemplate,
  onShowInfo,
  onResetData,
  onOpenThemes,
  isOpen,
  setIsOpen,
  currentThemeId,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<{ title: string; description: string; content: string } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pomodoro states
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Folder states
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [isFoldersOpen, setIsFoldersOpen] = useState(true);

  const toggleAccordion = (section: 'templates' | 'pomodoro' | 'radio' | 'settings') => {
    setIsTemplatesOpen(section === 'templates' ? !isTemplatesOpen : false);
    setIsPomodoroOpen(section === 'pomodoro' ? !isPomodoroOpen : false);
    setIsRadioOpen(section === 'radio' ? !isRadioOpen : false);
    setIsSettingsOpen(section === 'settings' ? !isSettingsOpen : false);
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const startRenaming = (folder: Folder) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
  };

  const handleRenameFolder = (id: string) => {
    if (editingFolderName.trim()) {
      onUpdateFolder(id, { name: editingFolderName.trim() });
    }
    setEditingFolderId(null);
  };

  // Drag and Drop
  const onDragStart = (e: React.DragEvent, noteId: string) => {
    e.dataTransfer.setData('noteId', noteId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, folderId?: string) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('noteId');
    if (noteId) {
      onMoveNoteToFolder(noteId, folderId);
    }
  };

  // Global play/pause state for header button
  const [isGlobalPlaying, setIsGlobalPlaying] = useState(false);

  const radioStations = [
    { name: 'Lo-Fi Fire FM', url: 'https://stream.laut.fm/lo-firefm' },
    { name: 'Radio Record Lo-Fi', url: 'https://online.radiorecord.com.ua/lofi' },
    { name: 'Lo-Fi Radio', url: 'https://live.lofiradio.ru/mp3_128' },
    { name: 'Zen Lo-Fi', url: 'https://stream.zeno.fm/z65dsrrsrg0uv' },
  ];

  // Listen for radio control events from header
  useEffect(() => {
    const handleRadioControl = (event: CustomEvent) => {
      if (event.detail.action === 'play') {
        if (!isPlaying) {
          handlePlayPause();
        }
        setIsGlobalPlaying(true);
      } else if (event.detail.action === 'pause') {
        if (isPlaying) {
          handlePlayPause();
        }
        setIsGlobalPlaying(false);
      }
    };

    window.addEventListener('radio-control', handleRadioControl as EventListener);
    return () => {
      window.removeEventListener('radio-control', handleRadioControl as EventListener);
    };
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setIsGlobalPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.src = radioStations[currentStation].url;
        audioRef.current.volume = volume;
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
        setIsGlobalPlaying(true);
      }
    }
  };

  const handleStationChange = (direction: 'next' | 'prev') => {
    const newStation = direction === 'next' 
      ? (currentStation + 1) % radioStations.length
      : (currentStation - 1 + radioStations.length) % radioStations.length;
    
    setCurrentStation(newStation);
    
    if (isPlaying && audioRef.current) {
      audioRef.current.src = radioStations[newStation].url;
      audioRef.current.volume = volume;
      audioRef.current.play().catch(console.error);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Pomodoro functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startPomodoro = () => {
    setIsTimerRunning(true);
    setIsBreak(false);
    setPomodoroTime(25 * 60);
  };

  const startBreak = () => {
    setIsTimerRunning(true);
    setIsBreak(true);
    setPomodoroTime(5 * 60); // 5 minute break
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setIsBreak(false);
    setPomodoroTime(25 * 60);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Timer effect
  React.useEffect(() => {
    if (isTimerRunning && pomodoroTime > 0) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime(time => {
          if (time <= 1) {
            setIsTimerRunning(false);
            if (!isBreak) {
              setSessions(prev => prev + 1);
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, pomodoroTime, isBreak]);

  // Global play/pause function
  const handleGlobalPlayPause = () => {
    if (isGlobalPlaying) {
      // Pause both radio and pomodoro if they're running
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
      if (isTimerRunning) {
        pauseTimer();
      }
      setIsGlobalPlaying(false);
    } else {
      // Play radio if it's open, otherwise start pomodoro
      if (isRadioOpen && audioRef.current) {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      } else if (isPomodoroOpen && !isTimerRunning) {
        startPomodoro();
      }
      setIsGlobalPlaying(true);
    }
  };

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
          console.error('Formato de backup invÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡lido.');
        }
      } catch (error) {
        console.error('Falha ao ler o arquivo de backup', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleShare = async () => {
    const shareData = {
      title: 'ConheÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§a o Nox Note',
      text: 'Experimente o Nox Note, um bloco de notas rÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡pido, seguro e 100% privado que funciona no seu navegador!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copiado para a ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡rea de transferÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âªncia! Compartilhe com seus amigos.');
      }
    } catch (error) {
      console.error('Falha ao compartilhar', error);
      alert('Ocorreu um erro ao tentar compartilhar.');
    }
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
        className={`absolute md:relative h-full w-72 bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <img src="/icon.svg" alt="NoxNote Logo" className="w-6 h-6 rounded-md" />
            NoxNote
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={onShowInfo}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors group"
              title="InformaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes de SeguranÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§a"
            >
              <Info className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
            </button>
            <button
              onClick={onCreateNote}
              className="p-2 bg-[var(--accent-primary)] text-[var(--accent-contrast)] hover:opacity-90 rounded-lg transition-all shadow-sm flex items-center justify-center group"
              title="Nova Nota"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Pesquisar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] placeholder-[var(--text-muted)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Folders Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <button 
                onClick={() => setIsFoldersOpen(!isFoldersOpen)}
                className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider hover:text-[var(--text-primary)] transition-colors"
              >
                <ChevronRight className={`w-3 h-3 transition-transform ${isFoldersOpen ? 'rotate-90' : ''}`} />
                Pastas
              </button>
              <button 
                onClick={onCreateFolder}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-hover)] rounded transition-colors"
                title="Nova Pasta"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {isFoldersOpen && (
              <div className="space-y-1">
                {folders.map(folder => (
                  <div key={folder.id} className="space-y-1">
                    <div 
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, folder.id)}
                      className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all hover:bg-[var(--bg-hover)] ${expandedFolders[folder.id] ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                      onClick={() => toggleFolder(folder.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <ChevronRight className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform ${expandedFolders[folder.id] ? 'rotate-90' : ''}`} />
                        <FolderIcon className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                        {editingFolderId === folder.id ? (
                          <input
                            autoFocus
                            value={editingFolderName}
                            onChange={(e) => setEditingFolderName(e.target.value)}
                            onBlur={() => handleRenameFolder(folder.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder(folder.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[var(--bg-primary)] text-sm border border-[var(--accent-primary)] rounded px-1 w-full outline-none"
                          />
                        ) : (
                          <span className="text-sm font-medium truncate">{folder.name}</span>
                        )}
                      </div>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); startRenaming(folder); }}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (confirm(`Excluir pasta "${folder.name}"? As notas serÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o movidas para fora.`)) {
                              onDeleteFolder(folder.id);
                            }
                          }}
                          className="p-1 text-[var(--text-muted)] hover:text-red-500 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {expandedFolders[folder.id] && (
                      <div className="pl-6 space-y-1">
                        {notes.filter(n => n.folderId === folder.id).length === 0 ? (
                          <div className="text-[10px] text-[var(--text-muted)] py-1 px-2 italic">Pasta vazia</div>
                        ) : (
                          notes
                            .filter(n => n.folderId === folder.id)
                            .sort((a, b) => b.updatedAt - a.updatedAt)
                            .map(note => (
                              <div
                                key={note.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, note.id)}
                                onClick={() => onSelectNote(note.id)}
                                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                                  activeNoteId === note.id
                                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/50 hover:text-[var(--text-primary)]'
                                }`}
                              >
                                <span className="text-xs truncate flex-1">{note.title || 'Sem tÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­tulo'}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Excluir nota?')) onDeleteNote(note.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-red-500 transition-all"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Uncategorized Notes Section */}
          <div 
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, undefined)}
            className="space-y-1"
          >
            <h4 className="px-2 mb-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Notas</h4>
            {filteredNotes.filter(n => !n.folderId).length === 0 ? (
              <div className="text-center text-[var(--text-muted)] text-xs py-4">
                {searchQuery ? 'Nenhuma nota encontrada.' : 'Sem notas avulsas.'}
              </div>
            ) : (
              filteredNotes
                .filter(n => !n.folderId)
                .map((note) => (
                  <div
                    key={note.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, note.id)}
                    onClick={() => onSelectNote(note.id)}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                      activeNoteId === note.id
                        ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/50 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-sm font-medium truncate">
                        {note.title || 'Sem tÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­tulo'}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] truncate mt-1">
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
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--bg-surface)] rounded-md transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border space-y-3">
          {/* Galeria de Templates */}
          <div>
            <button
              onClick={() => toggleAccordion('templates')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                isTemplatesOpen 
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] font-medium' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Galeria de Templates
              </div>
              <ChevronUp
                className={`w-4 h-4 transition-transform ${
                  isTemplatesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isTemplatesOpen && (
              <div className="mt-2 space-y-2 p-2 bg-[var(--bg-surface)]/50 rounded-lg border border-[var(--border-color)]/50">
                {TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setPreviewTemplate(template);
                      setIsPreviewOpen(true);
                    }}
                    className="w-full text-left p-2 rounded-md hover:bg-[var(--bg-hover)] transition-all group"
                  >
                    <div className="text-xs font-bold text-[var(--text-primary)] mb-0.5">{template.title}</div>
                    <div className="text-[10px] text-[var(--text-muted)] line-clamp-1">{template.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pomodoro Timer */}
          <div>
            <button
              onClick={() => toggleAccordion('pomodoro')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                isPomodoroOpen 
                  ? 'bg-accent text-accent-contrast font-medium' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-hover'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Foco & Pausa
              </div>
              <ChevronUp
                className={`w-4 h-4 transition-transform ${
                  isPomodoroOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isPomodoroOpen && (
              <div className="mt-2 space-y-3 p-3 bg-surface/50 rounded-lg border border-border/50">
                <div className="text-center">
                  <div className={`text-3xl font-mono font-bold ${isBreak ? 'text-emerald-500' : 'text-text-primary'}`}>
                    {formatTime(pomodoroTime)}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {isBreak ? 'Pausa' : 'Foco'} ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ SessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes: {sessions}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isTimerRunning ? (
                    <button
                      onClick={isBreak ? startBreak : startPomodoro}
                      className="flex-1 p-2 bg-accent text-accent-contrast rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      {isBreak ? 'Pausa' : 'Foco'}
                    </button>
                  ) : (
                    <button
                      onClick={pauseTimer}
                      className="flex-1 p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      Pausar
                    </button>
                  )}
                  <button
                    onClick={resetTimer}
                    className="p-2 text-text-secondary bg-surface hover:bg-hover rounded-lg transition-colors"
                    title="Resetar"
                  >
                    <Coffee className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsBreak(false);
                      setPomodoroTime(25 * 60);
                      pauseTimer();
                    }}
                    className={`flex-1 p-2 text-xs rounded-lg transition-colors ${
                      !isBreak ? 'bg-accent text-accent-contrast' : 'bg-surface hover:bg-hover text-text-secondary'
                    }`}
                  >
                    25min Foco
                  </button>
                  <button
                    onClick={() => {
                      setIsBreak(true);
                      setPomodoroTime(5 * 60);
                      pauseTimer();
                    }}
                    className={`flex-1 p-2 text-xs rounded-lg transition-colors ${
                      isBreak ? 'bg-emerald-500 text-white' : 'bg-surface hover:bg-hover text-text-secondary'
                    }`}
                  >
                    5min Pausa
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Radio Player */}
          <div>
            <button
              onClick={() => toggleAccordion('radio')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                isRadioOpen 
                  ? 'bg-accent text-accent-contrast font-medium' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-hover'
              }`}
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4" />
                RÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡dio Lo-Fi
              </div>
              <ChevronUp
                className={`w-4 h-4 transition-transform ${
                  isRadioOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isRadioOpen && (
              <div className="mt-2 space-y-3 p-3 bg-surface/50 rounded-lg border border-border/50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleStationChange('prev')}
                    className="p-1 text-text-secondary hover:text-text-primary hover:bg-hover rounded-full transition-colors"
                  >
                    <ChevronUp className="w-4 h-4 rotate-180" />
                  </button>
                  <span className="text-sm font-medium text-text-primary text-center flex-1 px-2 truncate">
                    {radioStations[currentStation].name}
                  </span>
                  <button
                    onClick={() => handleStationChange('next')}
                    className="p-1 text-text-secondary hover:text-text-primary hover:bg-hover rounded-full transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 bg-accent text-accent-contrast rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <div className="flex items-center gap-2 flex-1">
                    <Volume2 className="w-4 h-4 text-text-secondary" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => toggleAccordion('settings')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
              isSettingsOpen 
                ? 'bg-accent text-accent-contrast font-medium' 
                : 'text-text-secondary hover:text-text-primary hover:bg-hover'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              ConfiguraÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes
            </div>
            <ChevronUp
              className={`w-4 h-4 transition-transform ${
                isSettingsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isSettingsOpen && (
            <div className="mt-2 space-y-4 p-3 bg-surface/50 rounded-lg border border-border/50">
              
              <div>
                <h4 className="px-3 pb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Geral</h4>
                <div className="space-y-1">
                  <button
                    onClick={onOpenThemes}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-accent hover:text-accent-contrast rounded-lg transition-colors"
                  >
                    <Palette className="w-4 h-4" />
                    Temas
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-accent hover:text-accent-contrast rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Convidar Amigo
                  </button>
                </div>
              </div>

              <div className="border-t border-border/50"></div>

              <GoogleDriveSync notes={notes} folders={folders} onRestore={onRestore} />

              <div className="border-t border-border/50 mt-4"></div>

              <div>
                <h4 className="px-3 pb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Dados</h4>
                <div className="space-y-1">
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
                </div>
              </div>

              <div className="border-t border-border/50"></div>

              <div>
                <h4 className="px-3 pb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Sobre</h4>
                <a
                  href="/privacy-policy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-accent hover:text-accent-contrast rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  PolÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­tica de Privacidade
                </a>
                <a
                  href="/terms-of-service.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-accent hover:text-accent-contrast rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Termos de ServiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§o
                </a>
              </div>

              <div className="border-t border-border/50"></div>

              <div>
                <h4 className="px-3 pb-2 text-xs font-semibold text-error/80 uppercase tracking-wider">Zona de Perigo</h4>
                <button
                  onClick={onResetData}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Limpar Dados
                </button>
              </div>
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
      <audio ref={audioRef} />

      <TemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirm={() => {
          if (previewTemplate) {
            const templateId = TEMPLATES.find(t => t.title === previewTemplate.title)?.id;
            if (templateId) {
              onImportTemplate(createNoteFromTemplate(templateId));
            }
          }
        }}
        template={previewTemplate}
      />
    </>
  );
}