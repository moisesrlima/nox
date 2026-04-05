import React from 'react';
import { useNoxFlow } from '../contexts/NoxFlowContext';
import { Play, Pause, Volume2, Radio, Clock, Coffee, Bell, Timer, Hourglass, ChevronUp, ChevronDown, X } from 'lucide-react';
import { NoxFlowGames } from './NoxFlowGames';

export function NoxFlow({ onClose }: { onClose: () => void }) {
  const {
    isPlaying, currentStation, volume, togglePlayPause, changeStation, setVolume, radioStations,
    pomodoroTime, setPomodoroTime, isTimerRunning, isBreak, setIsBreak, sessions, startPomodoro, startBreak, resumeTimer, pauseTimer, resetTimer,
    alarmTime, setAlarmTime, isAlarmActive, toggleAlarm,
    stopwatchTime, isStopwatchRunning, startStopwatch, pauseStopwatch, resetStopwatch,
    countdownTime, setCountdownTime, initialCountdownTime, isCountdownRunning, setInitialCountdownTime, startCountdown, pauseCountdown, resetCountdown,
    isReading, readingSpeed, setReadingSpeed, startReading, stopReading, pauseReading, resumeReading
  } = useNoxFlow();

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
    <div className="flex-1 flex flex-col h-screen bg-[var(--bg-primary)] overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <Radio className="w-8 h-8 text-[var(--accent-primary)]" />
            Nox Flow
          </h1>
          <button onClick={onClose} className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-lg transition-colors">
            Voltar às Notas
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lo-Fi Radio */}
              <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[var(--accent-primary)]" />
                  Rádio Lo-Fi
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-[var(--bg-primary)] p-4 rounded-xl">
                    <button onClick={() => changeStation('prev')} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-full transition-colors">
                      <ChevronUp className="w-6 h-6 -rotate-90" />
                    </button>
                    <div className="text-center flex-1 px-4">
                      <div className="text-lg font-medium text-[var(--text-primary)] truncate">{radioStations[currentStation].name}</div>
                      <div className="text-sm text-[var(--text-muted)] mt-1">{isPlaying ? 'Tocando agora' : 'Pausado'}</div>
                    </div>
                    <button onClick={() => changeStation('next')} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-full transition-colors">
                      <ChevronUp className="w-6 h-6 rotate-90" />
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <button
                      onClick={togglePlayPause}
                      className="w-16 h-16 flex items-center justify-center bg-[var(--accent-primary)] text-[var(--accent-contrast)] rounded-full hover:scale-105 transition-transform shadow-lg shadow-[var(--accent-primary)]/20"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>
                    <div className="flex items-center gap-3 flex-1">
                      <Volume2 className="w-5 h-5 text-[var(--text-secondary)]" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-2 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pomodoro Timer */}
              <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[var(--accent-primary)]" />
                  Foco & Pausa
                </h2>
                <div className="text-center mb-8">
                  <div className={`text-7xl font-mono font-bold tracking-tight ${isBreak ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>
                    {formatTime(pomodoroTime)}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] mt-2 font-medium uppercase tracking-widest">
                    {isBreak ? 'Pausa' : 'Foco'} • Sessões: {sessions}
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-4 mb-6">
                  {!isTimerRunning ? (
                    <button 
                      onClick={resumeTimer} 
                      className="px-8 py-3 bg-[var(--accent-primary)] text-[var(--accent-contrast)] rounded-xl hover:opacity-90 transition-colors flex items-center gap-2 font-bold"
                    >
                      <Play className="w-5 h-5" /> 
                      {pomodoroTime === (isBreak ? 5 * 60 : 25 * 60) || pomodoroTime === (isBreak ? 15 * 60 : 30 * 60) ? 'Iniciar' : 'Continuar'} {isBreak ? 'Pausa' : 'Foco'}
                    </button>
                  ) : (
                    <button onClick={pauseTimer} className="px-8 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2 font-bold">
                      <Pause className="w-5 h-5" /> Pausar
                    </button>
                  )}
                  <button onClick={resetTimer} className="p-3 text-[var(--text-secondary)] bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition-colors" title="Resetar">
                    <Coffee className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setIsBreak(false); setPomodoroTime(25 * 60); pauseTimer(); }} className={`py-2 text-sm font-bold rounded-lg transition-all ${!isBreak && pomodoroTime === 25 * 60 ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)]' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]'}`}>
                    25m Foco
                  </button>
                  <button onClick={() => { setIsBreak(false); setPomodoroTime(30 * 60); pauseTimer(); }} className={`py-2 text-sm font-bold rounded-lg transition-all ${!isBreak && pomodoroTime === 30 * 60 ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)]' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]'}`}>
                    30m Foco
                  </button>
                  <button onClick={() => { setIsBreak(true); setPomodoroTime(5 * 60); pauseTimer(); }} className={`py-2 text-sm font-bold rounded-lg transition-all ${isBreak && pomodoroTime === 5 * 60 ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]'}`}>
                    5m Pausa
                  </button>
                  <button onClick={() => { setIsBreak(true); setPomodoroTime(15 * 60); pauseTimer(); }} className={`py-2 text-sm font-bold rounded-lg transition-all ${isBreak && pomodoroTime === 15 * 60 ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]'}`}>
                    15m Pausa
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Alarm */}
              <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[var(--accent-primary)]" />
                  Alarme
                </h2>
                <div className="flex flex-col gap-4">
                  <input 
                    type="time" 
                    value={alarmTime} 
                    onChange={(e) => setAlarmTime(e.target.value)} 
                    disabled={isAlarmActive}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-2xl text-center rounded-xl p-3 focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <button 
                    onClick={toggleAlarm}
                    className={`w-full py-3 rounded-xl font-bold transition-colors ${isAlarmActive ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] hover:opacity-90'}`}
                  >
                    {isAlarmActive ? 'Desativar Alarme' : 'Ativar Alarme'}
                  </button>
                </div>
              </div>

              {/* Stopwatch */}
              <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Timer className="w-5 h-5 text-[var(--accent-primary)]" />
                  Cronômetro
                </h2>
                <div className="text-center mb-6">
                  <div className="text-4xl font-mono font-bold text-[var(--text-primary)]">{formatStopwatch(stopwatchTime)}</div>
                </div>
                <div className="flex gap-2">
                  {!isStopwatchRunning ? (
                    <button onClick={startStopwatch} className="flex-1 py-2 bg-[var(--accent-primary)] text-[var(--accent-contrast)] rounded-lg font-bold hover:opacity-90 transition-colors">Iniciar</button>
                  ) : (
                    <button onClick={pauseStopwatch} className="flex-1 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors">Pausar</button>
                  )}
                  <button onClick={resetStopwatch} className="px-4 py-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors">Zerar</button>
                </div>
              </div>

              {/* Countdown */}
              <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Hourglass className="w-5 h-5 text-[var(--accent-primary)]" />
                  Contagem
                </h2>
                <div className="text-center mb-4">
                  <div className="text-4xl font-mono font-bold text-[var(--text-primary)]">{formatTime(countdownTime)}</div>
                </div>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => { setInitialCountdownTime(60); setCountdownTime(60); }} className="flex-1 py-1 text-xs bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] rounded text-[var(--text-secondary)]">1m</button>
                  <button onClick={() => { setInitialCountdownTime(5 * 60); setCountdownTime(5 * 60); }} className="flex-1 py-1 text-xs bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] rounded text-[var(--text-secondary)]">5m</button>
                  <button onClick={() => { setInitialCountdownTime(15 * 60); setCountdownTime(15 * 60); }} className="flex-1 py-1 text-xs bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] rounded text-[var(--text-secondary)]">15m</button>
                </div>
                <div className="flex gap-2">
                  {!isCountdownRunning ? (
                    <button onClick={startCountdown} className="flex-1 py-2 bg-[var(--accent-primary)] text-[var(--accent-contrast)] rounded-lg font-bold hover:opacity-90 transition-colors">Iniciar</button>
                  ) : (
                    <button onClick={pauseCountdown} className="flex-1 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors">Pausar</button>
                  )}
                  <button onClick={resetCountdown} className="px-4 py-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors">Zerar</button>
                </div>
              </div>
            </div>

            {/* Reading Section */}
            <div className="bg-[var(--bg-surface)] p-8 rounded-2xl border border-[var(--border-color)] shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-3">
                  <Volume2 className="w-6 h-6 text-[var(--accent-primary)]" />
                  Ler em Voz Alta
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[var(--text-secondary)] font-medium">Velocidade de Leitura</span>
                  <div className="flex bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-color)]">
                    {[1, 1.25, 1.5, 1.75, 2].map(speed => (
                      <button 
                        key={speed}
                        onClick={() => setReadingSpeed(speed)}
                        className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${readingSpeed === speed ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-12 bg-[var(--bg-primary)] rounded-3xl border border-dashed border-[var(--border-color)]">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${isReading ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] scale-110 shadow-xl shadow-[var(--accent-primary)]/20 animate-pulse' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}>
                  <Volume2 className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  {isReading ? 'Lendo sua nota agora...' : 'Pronto para ler sua nota'}
                </h3>
                <p className="text-[var(--text-secondary)] text-center max-w-md mb-8">
                  {isReading 
                    ? 'Aproveite a leitura enquanto você foca em outras tarefas ou apenas relaxa.' 
                    : 'Selecione uma nota e clique no botão abaixo para que o Nox leia o conteúdo para você.'}
                </p>
                
                <div className="flex gap-4">
                  {!isReading ? (
                    <button 
                      onClick={() => startReading()}
                      className="px-10 py-4 bg-[var(--accent-primary)] text-[var(--accent-contrast)] rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-[var(--accent-primary)]/20 flex items-center gap-3"
                    >
                      <Play className="w-6 h-6" /> Começar Leitura
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => pauseReading()}
                        className="px-10 py-4 bg-amber-500 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-amber-500/20 flex items-center gap-3"
                      >
                        <Pause className="w-6 h-6" /> Pausar
                      </button>
                      <button 
                        onClick={() => stopReading()}
                        className="px-10 py-4 bg-red-500 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-red-500/20 flex items-center gap-3"
                      >
                        Parar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96 shrink-0 sticky top-8">
            <NoxFlowGames isBreak={isBreak} />
          </div>
        </div>
      </div>
    </div>
  );
}
