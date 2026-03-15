import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Note } from '../types';
import { Plus, Search, Download, Trash2, Info, AlertTriangle, Settings, ChevronUp, Upload, Palette, Share2, Play, Pause, Volume2, Radio, Clock, Coffee } from 'lucide-react';

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
  const [isRadioOpen, setIsRadioOpen] = useState(false);
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
          console.error('Formato de backup inválido.');
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
      title: 'Conheça o Nox Note',
      text: 'Experimente o Nox Note, um bloco de notas rápido, seguro e 100% privado que funciona no seu navegador!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copiado para a área de transferência! Compartilhe com seus amigos.');
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
        className={`absolute md:relative h-full w-72 bg-surface border-r border-border flex flex-col transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center text-sm font-black bg-accent text-accent-contrast"
            >
              N
            </span>
            NoxNote
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={onShowInfo}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-hover rounded-lg transition-colors group"
              title="Informações de Segurança"
            >
              <Info className="w-5 h-5 text-text-secondary group-hover:text-text-primary" />
            </button>
            <button
              onClick={onCreateNote}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-hover rounded-lg transition-colors group"
              title="Nova Nota"
            >
              <Plus className="w-5 h-5 text-text-secondary group-hover:text-text-primary" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
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
            <div className="text-center text-text-secondary text-sm py-8">
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
                  <p className="text-xs text-text-secondary truncate mt-1">
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
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-text-secondary hover:text-error hover:bg-surface rounded-md transition-all"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border space-y-3">
          {/* Pomodoro Timer */}
          <div>
            <button
              onClick={() => setIsPomodoroOpen(!isPomodoroOpen)}
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
                  <div className={`text-3xl font-mono font-bold ${isBreak ? 'text-green-400' : 'text-text-primary'}`}>
                    {formatTime(pomodoroTime)}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {isBreak ? 'Pausa' : 'Foco'} • Sessões: {sessions}
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
                      className="flex-1 p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
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
                      isBreak ? 'bg-green-500 text-white' : 'bg-surface hover:bg-hover text-text-secondary'
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
              onClick={() => setIsRadioOpen(!isRadioOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                isRadioOpen 
                  ? 'bg-accent text-accent-contrast font-medium' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-hover'
              }`}
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Rádio Lo-Fi
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
    </>
  );
}