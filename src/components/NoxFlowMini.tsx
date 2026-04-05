import React, { useState } from 'react';
import { useNoxFlow } from '../contexts/NoxFlowContext';
import { Play, Pause, Volume2, Radio, Clock, Coffee, Bell, Timer, Hourglass, ChevronRight, ChevronDown, Maximize2, X, Trophy } from 'lucide-react';
import { NoxFlowGames } from './NoxFlowGames';

export function NoxFlowMini({ onClose, onOpenFull }: { onClose: () => void, onOpenFull: () => void }) {
  const {
    isPlaying, currentStation, volume, togglePlayPause, changeStation, setVolume, radioStations,
    pomodoroTime, setPomodoroTime, isTimerRunning, isBreak, setIsBreak, sessions, startPomodoro, startBreak, resumeTimer, pauseTimer, resetTimer,
    alarmTime, setAlarmTime, isAlarmActive, toggleAlarm,
    stopwatchTime, isStopwatchRunning, startStopwatch, pauseStopwatch, resetStopwatch,
    countdownTime, setCountdownTime, initialCountdownTime, isCountdownRunning, setInitialCountdownTime, startCountdown, pauseCountdown, resetCountdown,
    isReading, readingSpeed, setReadingSpeed, startReading, stopReading, pauseReading, resumeReading
  } = useNoxFlow();

  const [expandedWidget, setExpandedWidget] = useState<string | null>('radio');

  const toggleWidget = (widget: string) => {
    setExpandedWidget(prev => prev === widget ? null : widget);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-72 md:w-80 h-full bg-[var(--bg-surface)] border-l border-[var(--border-color)] flex flex-col shadow-xl z-20 transition-all duration-300">
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Radio className="w-5 h-5 text-[var(--accent-primary)]" />
          Nox Flow
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={onOpenFull} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors" title="Abrir página completa">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors" title="Fechar painel">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Radio Widget */}
        <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
          <button onClick={() => toggleWidget('radio')} className="w-full flex items-center justify-between p-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[var(--accent-primary)]" />
              Rádio Lo-Fi
            </div>
            {expandedWidget === 'radio' ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
          </button>
          {expandedWidget === 'radio' && (
            <div className="p-3 pt-0 border-t border-[var(--border-color)]/50 mt-1">
              <div className="text-xs text-center text-[var(--text-secondary)] mb-3 truncate px-2">{radioStations[currentStation].name}</div>
              <div className="flex items-center justify-center gap-4 mb-3">
                <button onClick={() => changeStation('prev')} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full transition-colors">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <button onClick={togglePlayPause} className="p-2 bg-[var(--accent-primary)] text-[var(--accent-contrast)] rounded-full hover:scale-105 transition-transform">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button onClick={() => changeStation('next')} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full h-1 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]" />
              </div>
            </div>
          )}
        </div>

        {/* Pomodoro Widget */}
        <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
          <button onClick={() => toggleWidget('pomodoro')} className="w-full flex items-center justify-between p-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
              Foco & Pausa
            </div>
            {expandedWidget === 'pomodoro' ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
          </button>
          {expandedWidget === 'pomodoro' && (
            <div className="p-3 pt-0 border-t border-[var(--border-color)]/50 mt-1">
              <div className={`text-3xl text-center font-mono font-bold mb-1 ${isBreak ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>
                {formatTime(pomodoroTime)}
              </div>
              <div className="text-[10px] text-center text-[var(--text-muted)] uppercase tracking-widest mb-3">
                {isBreak ? 'Pausa' : 'Foco'} • Sessões: {sessions}
              </div>
              <div className="flex gap-2">
                {!isTimerRunning ? (
                  <button onClick={() => {
                    if (pomodoroTime < (isBreak ? 5 * 60 : 25 * 60)) {
                      resumeTimer();
                    } else {
                      isBreak ? startBreak() : startPomodoro();
                    }
                  }} className="flex-1 py-1.5 bg-[var(--accent-primary)] text-[var(--accent-contrast)] rounded-lg text-xs font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-1">
                    <Play className="w-3 h-3" /> {pomodoroTime < (isBreak ? 5 * 60 : 25 * 60) ? 'Continuar' : 'Iniciar'}
                  </button>
                ) : (
                  <button onClick={pauseTimer} className="flex-1 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-1">
                    <Pause className="w-3 h-3" /> Pausar
                  </button>
                )}
                <button onClick={resetTimer} className="p-1.5 text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors" title="Resetar">
                  <Coffee className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Alarm Widget */}
        <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
          <button onClick={() => toggleWidget('alarm')} className="w-full flex items-center justify-between p-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--accent-primary)]" />
              Alarme
            </div>
            {expandedWidget === 'alarm' ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
          </button>
          {expandedWidget === 'alarm' && (
            <div className="p-3 pt-0 border-t border-[var(--border-color)]/50 mt-1">
              <div className="flex items-center gap-2">
                <input 
                  type="time" 
                  value={alarmTime} 
                  onChange={(e) => setAlarmTime(e.target.value)} 
                  disabled={isAlarmActive}
                  className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm rounded-lg p-1.5 focus:outline-none focus:border-[var(--accent-primary)]"
                />
                <button 
                  onClick={toggleAlarm}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isAlarmActive ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] hover:opacity-90'}`}
                >
                  {isAlarmActive ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stopwatch Widget */}
        <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
          <button onClick={() => toggleWidget('stopwatch')} className="w-full flex items-center justify-between p-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-[var(--accent-primary)]" />
              Cronômetro
            </div>
            {expandedWidget === 'stopwatch' ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
          </button>
          {expandedWidget === 'stopwatch' && (
            <div className="p-3 pt-0 border-t border-[var(--border-color)]/50 mt-1">
              <div className="text-2xl text-center font-mono font-bold text-[var(--text-primary)] mb-3">{formatStopwatch(stopwatchTime)}</div>
              <div className="flex gap-2">
                {!isStopwatchRunning ? (
                  <button onClick={startStopwatch} className="flex-1 py-1.5 bg-[var(--accent-primary)] text-[var(--accent-contrast)] rounded-lg text-xs font-bold hover:opacity-90 transition-colors">Iniciar</button>
                ) : (
                  <button onClick={pauseStopwatch} className="flex-1 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors">Pausar</button>
                )}
                <button onClick={resetStopwatch} className="px-3 py-1.5 bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg text-xs transition-colors">Zerar</button>
              </div>
            </div>
          )}
        </div>

        {/* Countdown Widget */}
        <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
          <button onClick={() => toggleWidget('countdown')} className="w-full flex items-center justify-between p-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
            <div className="flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-[var(--accent-primary)]" />
              Contagem Regressiva
            </div>
            {expandedWidget === 'countdown' ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
          </button>
          {expandedWidget === 'countdown' && (
            <div className="p-3 pt-0 border-t border-[var(--border-color)]/50 mt-1">
              <div className="text-2xl text-center font-mono font-bold text-[var(--text-primary)] mb-2">{formatTime(countdownTime)}</div>
              <div className="flex gap-1 mb-3">
                <button onClick={() => { setInitialCountdownTime(60); setCountdownTime(60); }} className="flex-1 py-1 text-[10px] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] rounded text-[var(--text-secondary)]">1m</button>
                <button onClick={() => { setInitialCountdownTime(5 * 60); setCountdownTime(5 * 60); }} className="flex-1 py-1 text-[10px] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] rounded text-[var(--text-secondary)]">5m</button>
                <button onClick={() => { setInitialCountdownTime(15 * 60); setCountdownTime(15 * 60); }} className="flex-1 py-1 text-[10px] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] rounded text-[var(--text-secondary)]">15m</button>
              </div>
              <div className="flex gap-2">
                {!isCountdownRunning ? (
                  <button onClick={startCountdown} className="flex-1 py-1.5 bg-[var(--accent-primary)] text-[var(--accent-contrast)] rounded-lg text-xs font-bold hover:opacity-90 transition-colors">Iniciar</button>
                ) : (
                  <button onClick={pauseCountdown} className="flex-1 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors">Pausar</button>
                )}
                <button onClick={resetCountdown} className="px-3 py-1.5 bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg text-xs transition-colors">Zerar</button>
              </div>
            </div>
          )}
        </div>

        {/* Reading Widget */}
        <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
          <button onClick={() => toggleWidget('reading')} className="w-full flex items-center justify-between p-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />
              Ler em Voz Alta
            </div>
            {expandedWidget === 'reading' ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
          </button>
          {expandedWidget === 'reading' && (
            <div className="p-3 pt-0 border-t border-[var(--border-color)]/50 mt-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Velocidade</span>
                <div className="flex gap-1">
                  {[1, 1.5, 2].map(speed => (
                    <button 
                      key={speed}
                      onClick={() => setReadingSpeed(speed)}
                      className={`px-2 py-0.5 text-[10px] rounded transition-colors ${readingSpeed === speed ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)]' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {!isReading ? (
                  <button onClick={() => startReading()} className="flex-1 py-1.5 bg-[var(--accent-primary)] text-[var(--accent-contrast)] rounded-lg text-xs font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-1">
                    <Play className="w-3 h-3" /> Iniciar Leitura
                  </button>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <button onClick={() => pauseReading()} className="flex-1 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-1">
                      <Pause className="w-3 h-3" /> Pausar
                    </button>
                    <button onClick={() => stopReading()} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors">
                      Parar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mini Games Widget */}
        <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
          <button onClick={() => toggleWidget('games')} className="w-full flex items-center justify-between p-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[var(--accent-primary)]" />
              Mini Games de Pausa
            </div>
            {expandedWidget === 'games' ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
          </button>
          {expandedWidget === 'games' && (
            <div className="p-1 pt-0 border-t border-[var(--border-color)]/50 mt-1 max-h-[400px] overflow-y-auto">
              <NoxFlowGames isBreak={isBreak} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
