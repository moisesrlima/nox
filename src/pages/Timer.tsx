import React, { useState, useEffect } from 'react';
import { Hourglass, Play, Pause, RotateCcw } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

export function Timer() {
  const [inputHours, setInputHours] = useState('0');
  const [inputMinutes, setInputMinutes] = useState('5');
  const [inputSeconds, setInputSeconds] = useState('0');
  
  const [remainingTime, setRemainingTime] = useState(300); // in seconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            triggerAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingTime]);

  const triggerAlarm = () => {
    trackEvent('Timer', 'Finished');
    
    // Play sound
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.4); // G5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.error('Audio play failed', e);
    }

    if (Notification.permission === 'granted') {
      new Notification('Tempo Esgotado!', {
        body: 'Sua contagem regressiva terminou.',
        icon: '/vite.svg'
      });
    } else {
      alert('Tempo Esgotado!');
    }
  };

  const startTimer = () => {
    if (remainingTime === 0) {
      const totalSeconds = 
        (parseInt(inputHours) || 0) * 3600 + 
        (parseInt(inputMinutes) || 0) * 60 + 
        (parseInt(inputSeconds) || 0);
      
      if (totalSeconds > 0) {
        setRemainingTime(totalSeconds);
      } else {
        return;
      }
    }
    trackEvent('Timer', 'Started');
    setIsRunning(true);
  };

  const pauseTimer = () => {
    trackEvent('Timer', 'Paused');
    setIsRunning(false);
  };

  const resetTimer = () => {
    trackEvent('Timer', 'Reset');
    setIsRunning(false);
    const totalSeconds = 
      (parseInt(inputHours) || 0) * 3600 + 
      (parseInt(inputMinutes) || 0) * 60 + 
      (parseInt(inputSeconds) || 0);
    setRemainingTime(totalSeconds);
  };

  const handleInputChange = () => {
    if (!isRunning) {
      const totalSeconds = 
        (parseInt(inputHours) || 0) * 3600 + 
        (parseInt(inputMinutes) || 0) * 60 + 
        (parseInt(inputSeconds) || 0);
      setRemainingTime(totalSeconds);
    }
  };

  useEffect(() => {
    handleInputChange();
  }, [inputHours, inputMinutes, inputSeconds]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = remainingTime === 0 ? 0 : (remainingTime / ((parseInt(inputHours) || 0) * 3600 + (parseInt(inputMinutes) || 0) * 60 + (parseInt(inputSeconds) || 0))) * 100;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Hourglass className="w-8 h-8 text-blue-500" />
          Contagem Regressiva
        </h2>
      </div>

      <div className="bg-white dark:bg-neutral-800 p-12 rounded-3xl shadow-sm border border-neutral-200 dark:border-neutral-700 mb-8 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Progress bar background */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />

        {!isRunning && remainingTime === ((parseInt(inputHours) || 0) * 3600 + (parseInt(inputMinutes) || 0) * 60 + (parseInt(inputSeconds) || 0)) ? (
          <div className="flex items-center gap-4 mb-12 text-center">
            <div className="flex flex-col">
              <input 
                type="number" 
                min="0" 
                value={inputHours} 
                onChange={(e) => setInputHours(e.target.value)}
                className="w-20 text-5xl font-mono text-center bg-transparent border-b-2 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 outline-none pb-2"
              />
              <span className="text-sm text-neutral-500 mt-2">Horas</span>
            </div>
            <span className="text-5xl font-mono pb-8">:</span>
            <div className="flex flex-col">
              <input 
                type="number" 
                min="0" 
                max="59"
                value={inputMinutes} 
                onChange={(e) => setInputMinutes(e.target.value)}
                className="w-20 text-5xl font-mono text-center bg-transparent border-b-2 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 outline-none pb-2"
              />
              <span className="text-sm text-neutral-500 mt-2">Minutos</span>
            </div>
            <span className="text-5xl font-mono pb-8">:</span>
            <div className="flex flex-col">
              <input 
                type="number" 
                min="0" 
                max="59"
                value={inputSeconds} 
                onChange={(e) => setInputSeconds(e.target.value)}
                className="w-20 text-5xl font-mono text-center bg-transparent border-b-2 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 outline-none pb-2"
              />
              <span className="text-sm text-neutral-500 mt-2">Segundos</span>
            </div>
          </div>
        ) : (
          <div className="text-8xl font-mono tracking-tighter mb-12">
            {formatTime(remainingTime)}
          </div>
        )}
        
        <div className="flex items-center gap-6">
          <button 
            onClick={resetTimer}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          
          <button 
            onClick={isRunning ? pauseTimer : startTimer}
            className={`w-20 h-20 flex items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-95 ${
              isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}
