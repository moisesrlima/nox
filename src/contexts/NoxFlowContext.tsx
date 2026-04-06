import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface NoxFlowContextType {
  // Radio
  isPlaying: boolean;
  currentStation: number;
  volume: number;
  togglePlayPause: () => void;
  changeStation: (direction: 'next' | 'prev') => void;
  setVolume: (volume: number) => void;
  radioStations: { name: string; url: string }[];
  
  // Timer (Pomodoro)
  pomodoroTime: number;
  setPomodoroTime: (time: number) => void;
  focusDuration: number;
  setFocusDuration: (time: number) => void;
  breakDuration: number;
  setBreakDuration: (time: number) => void;
  isTimerRunning: boolean;
  isBreak: boolean;
  setIsBreak: (isBreak: boolean) => void;
  sessions: number;
  startPomodoro: () => void;
  startBreak: () => void;
  resumeTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;

  // Alarm
  alarmTime: string;
  setAlarmTime: (time: string) => void;
  isAlarmActive: boolean;
  toggleAlarm: () => void;

  // Stopwatch
  stopwatchTime: number;
  isStopwatchRunning: boolean;
  startStopwatch: () => void;
  pauseStopwatch: () => void;
  resetStopwatch: () => void;

  // Countdown
  countdownTime: number;
  setCountdownTime: (time: number | ((prev: number) => number)) => void;
  initialCountdownTime: number;
  isCountdownRunning: boolean;
  setInitialCountdownTime: (time: number) => void;
  startCountdown: () => void;
  pauseCountdown: () => void;
  resetCountdown: () => void;

  // Reading (TTS)
  isReading: boolean;
  readingSpeed: number;
  setReadingSpeed: (speed: number) => void;
  startReading: (text?: string) => void;
  stopReading: () => void;
  pauseReading: () => void;
  resumeReading: () => void;
  readingText: string;
  setReadingText: (text: string) => void;
}

const NoxFlowContext = createContext<NoxFlowContextType | undefined>(undefined);

export function NoxFlowProvider({ children }: { children: React.ReactNode }) {
  // --- Radio ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const radioStations = [
    { name: 'Lo-Fi Fire FM', url: 'https://stream.laut.fm/lo-firefm' },
    { name: 'Radio Record Lo-Fi', url: 'https://online.radiorecord.com.ua/lofi' },
    { name: 'Lo-Fi Radio', url: 'https://live.lofiradio.ru/mp3_128' },
    { name: 'Zen Lo-Fi', url: 'https://stream.zeno.fm/z65dsrrsrg0uv' },
  ];

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.src = radioStations[currentStation].url;
        audioRef.current.volume = volume;
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  const changeStation = (direction: 'next' | 'prev') => {
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

  const handleSetVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // --- Timer (Pomodoro) ---
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const pomodoroIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPomodoro = () => {
    setIsTimerRunning(true);
    setIsBreak(false);
    setPomodoroTime(focusDuration);
  };

  const startBreak = () => {
    setIsTimerRunning(true);
    setIsBreak(true);
    setPomodoroTime(breakDuration);
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    if (pomodoroIntervalRef.current) {
      clearInterval(pomodoroIntervalRef.current);
      pomodoroIntervalRef.current = null;
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setIsBreak(false);
    setPomodoroTime(focusDuration);
    if (pomodoroIntervalRef.current) {
      clearInterval(pomodoroIntervalRef.current);
      pomodoroIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isTimerRunning && pomodoroTime > 0) {
      pomodoroIntervalRef.current = setInterval(() => {
        setPomodoroTime(time => {
          if (time <= 1) {
            setIsTimerRunning(false);
            if (!isBreak) {
              setSessions(prev => prev + 1);
              if (Notification.permission === 'granted') {
                new Notification('Foco Concluído!', {
                  body: 'Hora de uma pausa! Aproveite os mini games.',
                  icon: '/favicon.ico'
                });
              }
              // Auto-transition to break state but stay paused
              setIsBreak(true);
              return breakDuration;
            } else {
              if (Notification.permission === 'granted') {
                new Notification('Pausa Concluída!', {
                  body: 'Hora de voltar ao foco!',
                  icon: '/favicon.ico'
                });
              }
              // Auto-transition to focus state but stay paused
              setIsBreak(false);
              return focusDuration;
            }
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (pomodoroIntervalRef.current) {
        clearInterval(pomodoroIntervalRef.current);
        pomodoroIntervalRef.current = null;
      }
    }
    return () => {
      if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current);
    };
  }, [isTimerRunning, pomodoroTime, isBreak]);

  // --- Alarm ---
  const [alarmTime, setAlarmTime] = useState('');
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        await Notification.requestPermission();
      }
    }
  };

  const toggleAlarm = async () => {
    if (isAlarmActive) {
      setIsAlarmActive(false);
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    } else {
      if (!alarmTime) return;
      await requestNotificationPermission();
      setIsAlarmActive(true);
    }
  };

  useEffect(() => {
    if (isAlarmActive && alarmTime) {
      alarmIntervalRef.current = setInterval(() => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        if (currentTime === alarmTime) {
          setIsAlarmActive(false);
          if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nox Flow', { body: 'Seu alarme disparou!' });
          } else {
            alert('Seu alarme disparou!');
          }
        }
      }, 1000);
    }
    return () => {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    };
  }, [isAlarmActive, alarmTime]);

  // --- Stopwatch ---
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startStopwatch = () => setIsStopwatchRunning(true);
  const pauseStopwatch = () => setIsStopwatchRunning(false);
  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
  };

  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime(prev => prev + 1);
      }, 1000);
    } else {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [isStopwatchRunning]);

  // --- Countdown ---
  const [initialCountdownTime, setInitialCountdownTime] = useState(60);
  const [countdownTime, setCountdownTime] = useState(60);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = () => setIsCountdownRunning(true);
  const pauseCountdown = () => setIsCountdownRunning(false);
  const resetCountdown = () => {
    setIsCountdownRunning(false);
    setCountdownTime(initialCountdownTime);
  };

  useEffect(() => {
    if (isCountdownRunning && countdownTime > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdownTime(prev => {
          if (prev <= 1) {
            setIsCountdownRunning(false);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Nox Flow', { body: 'A contagem regressiva terminou!' });
            } else {
              alert('A contagem regressiva terminou!');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isCountdownRunning, countdownTime]);

  // --- Reading (TTS) ---
  const [isReading, setIsReading] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1);
  const [readingText, setReadingText] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
  };

  const startReading = (text?: string) => {
    const textToRead = text || readingText;
    if (!textToRead.trim()) {
      alert('Não há texto para ler!');
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'pt-BR';
      utterance.rate = readingSpeed;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Seu navegador não suporta leitura em voz alta.');
    }
  };

  const pauseReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsReading(false);
    }
  };

  const resumeReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsReading(true);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <NoxFlowContext.Provider value={{
      isPlaying, currentStation, volume, togglePlayPause, changeStation, setVolume: handleSetVolume, radioStations,
      pomodoroTime, setPomodoroTime, focusDuration, setFocusDuration, breakDuration, setBreakDuration,
      isTimerRunning, isBreak, setIsBreak, sessions, startPomodoro, startBreak, resumeTimer, pauseTimer, resetTimer,
      alarmTime, setAlarmTime, isAlarmActive, toggleAlarm,
      stopwatchTime, isStopwatchRunning, startStopwatch, pauseStopwatch, resetStopwatch,
      countdownTime, setCountdownTime, initialCountdownTime, isCountdownRunning, setInitialCountdownTime, startCountdown, pauseCountdown, resetCountdown,
      isReading, readingSpeed, setReadingSpeed, startReading, stopReading, pauseReading, resumeReading, readingText, setReadingText
    }}>
      {children}
    </NoxFlowContext.Provider>
  );
}

export function useNoxFlow() {
  const context = useContext(NoxFlowContext);
  if (context === undefined) {
    throw new Error('useNoxFlow must be used within a NoxFlowProvider');
  }
  return context;
}
