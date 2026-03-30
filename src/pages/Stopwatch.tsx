import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon, Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

export function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = () => {
    if (!isRunning) trackEvent('Stopwatch', 'Started');
    else trackEvent('Stopwatch', 'Paused');
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    trackEvent('Stopwatch', 'Reset');
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const addLap = () => {
    trackEvent('Stopwatch', 'Lap Added');
    setLaps((prevLaps) => [time, ...prevLaps]);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <TimerIcon className="w-8 h-8 text-blue-500" />
          Cronômetro
        </h2>
      </div>

      <div className="bg-white dark:bg-neutral-800 p-12 rounded-3xl shadow-sm border border-neutral-200 dark:border-neutral-700 mb-8 flex flex-col items-center justify-center">
        <div className="text-7xl font-mono tracking-tighter mb-12">
          {formatTime(time)}
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={resetTimer}
            disabled={time === 0}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={`w-20 h-20 flex items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-95 ${
              isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          
          <button 
            onClick={addLap}
            disabled={!isRunning}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
          >
            <Flag className="w-6 h-6" />
          </button>
        </div>
      </div>

      {laps.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 font-medium text-neutral-500 dark:text-neutral-400 flex justify-between">
            <span>Volta</span>
            <span>Tempo</span>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-700 max-h-64 overflow-y-auto">
            {laps.map((lapTime, index) => (
              <div key={index} className="px-6 py-4 flex justify-between font-mono text-lg">
                <span className="text-neutral-500 dark:text-neutral-400">
                  #{laps.length - index}
                </span>
                <span>{formatTime(lapTime)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
