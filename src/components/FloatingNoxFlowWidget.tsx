import React, { useState, useRef, useEffect } from 'react';
import { useNoxFlow } from '../contexts/NoxFlowContext';
import { Play, Pause, Radio, Clock, Bell, Timer, Hourglass, X, GripHorizontal, Volume2 } from 'lucide-react';

export function FloatingNoxFlowWidget() {
  const {
    isPlaying, currentStation, radioStations, togglePlayPause,
    pomodoroTime, isTimerRunning, isBreak, pauseTimer, startPomodoro, startBreak, resumeTimer, resetTimer,
    isAlarmActive, alarmTime, toggleAlarm,
    stopwatchTime, isStopwatchRunning, pauseStopwatch, startStopwatch, resetStopwatch,
    countdownTime, isCountdownRunning, pauseCountdown, startCountdown, resetCountdown,
    initialCountdownTime,
    isReading, readingSpeed, setReadingSpeed, startReading, stopReading, pauseReading, resumeReading
  } = useNoxFlow();

  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const hasActiveRadio = isPlaying;
  const hasActiveTimer = isTimerRunning || pomodoroTime < (isBreak ? 5 * 60 : 25 * 60);
  const hasActiveAlarm = isAlarmActive;
  const hasActiveStopwatch = isStopwatchRunning || stopwatchTime > 0;
  const hasActiveCountdown = isCountdownRunning || (countdownTime > 0 && countdownTime < initialCountdownTime);
  const hasActiveReading = isReading;

  const activeWidgetsCount = 
    (hasActiveRadio ? 1 : 0) + 
    (hasActiveTimer ? 1 : 0) + 
    (hasActiveAlarm ? 1 : 0) + 
    (hasActiveStopwatch ? 1 : 0) + 
    (hasActiveCountdown ? 1 : 0) +
    (hasActiveReading ? 1 : 0);

  const hasActiveWidgets = activeWidgetsCount > 0;

  useEffect(() => {
    if (activeWidgetsCount > 0 && !isVisible) {
      setIsVisible(true);
    }
  }, [activeWidgetsCount]);

  if (!hasActiveWidgets || !isVisible) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
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
    <div 
      className="fixed z-50 w-64 bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-2xl rounded-xl overflow-hidden flex flex-col"
      style={{ left: position.x, top: position.y }}
    >
      <div 
        className="flex items-center justify-between px-3 py-2 bg-[var(--bg-hover)] cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <GripHorizontal className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Nox Flow</span>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {hasActiveRadio && (
          <div className="flex items-center justify-between bg-[var(--bg-primary)] p-2 rounded-lg border border-[var(--border-color)]/50">
            <div className="flex items-center gap-2 min-w-0">
              <Radio className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
              <span className="text-xs font-medium truncate">{radioStations[currentStation].name}</span>
            </div>
            <button onClick={togglePlayPause} className="p-1.5 bg-[var(--accent-primary)] text-[var(--accent-contrast)] rounded-full hover:scale-105 transition-transform shrink-0">
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        )}

        {hasActiveTimer && (
          <div className="flex items-center justify-between bg-[var(--bg-primary)] p-2 rounded-lg border border-[var(--border-color)]/50">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isBreak ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`} />
              <span className={`text-sm font-mono font-bold ${isBreak ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>
                {formatTime(pomodoroTime)}
              </span>
            </div>
            <div className="flex gap-1">
              <button onClick={isTimerRunning ? pauseTimer : resumeTimer} className="p-1.5 bg-amber-500 text-white rounded-full hover:scale-105 transition-transform">
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button onClick={resetTimer} className="p-1.5 bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:scale-105 transition-transform">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {hasActiveAlarm && (
          <div className="flex items-center justify-between bg-[var(--bg-primary)] p-2 rounded-lg border border-[var(--border-color)]/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-sm font-mono font-bold">{alarmTime}</span>
            </div>
            <button onClick={toggleAlarm} className="p-1.5 bg-red-500 text-white rounded-full hover:scale-105 transition-transform">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {hasActiveStopwatch && (
          <div className="flex items-center justify-between bg-[var(--bg-primary)] p-2 rounded-lg border border-[var(--border-color)]/50">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-sm font-mono font-bold">{formatStopwatch(stopwatchTime)}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={isStopwatchRunning ? pauseStopwatch : startStopwatch} className="p-1.5 bg-amber-500 text-white rounded-full hover:scale-105 transition-transform">
                {isStopwatchRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button onClick={resetStopwatch} className="p-1.5 bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:scale-105 transition-transform">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {hasActiveCountdown && (
          <div className="flex items-center justify-between bg-[var(--bg-primary)] p-2 rounded-lg border border-[var(--border-color)]/50">
            <div className="flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-sm font-mono font-bold">{formatTime(countdownTime)}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={isCountdownRunning ? pauseCountdown : startCountdown} className="p-1.5 bg-amber-500 text-white rounded-full hover:scale-105 transition-transform">
                {isCountdownRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button onClick={resetCountdown} className="p-1.5 bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:scale-105 transition-transform">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        {hasActiveReading && (
          <div className="flex items-center justify-between bg-[var(--bg-primary)] p-2 rounded-lg border border-[var(--border-color)]/50">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-xs font-medium truncate max-w-[80px]">Lendo nota...</span>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => isReading ? pauseReading() : resumeReading()} 
                className="p-1.5 bg-amber-500 text-white rounded-full hover:scale-105 transition-transform"
              >
                {isReading ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button 
                onClick={() => stopReading()} 
                className="p-1.5 bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:scale-105 transition-transform"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
