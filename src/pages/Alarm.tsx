import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, BellRing } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

interface Alarm {
  id: string;
  time: string; // HH:MM
  active: boolean;
}

export function Alarm() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newTime, setNewTime] = useState('07:00');
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      alarms.forEach(alarm => {
        if (alarm.active && alarm.time === currentTime && now.getSeconds() === 0) {
          triggerAlarm(alarm);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [alarms]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Este navegador não suporta notificações de desktop.');
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const triggerAlarm = (alarm: Alarm) => {
    trackEvent('Alarm', 'Triggered', alarm.time);
    
    // Play sound
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch (e) {
      console.error('Audio play failed', e);
    }

    // Show Notification
    if (Notification.permission === 'granted') {
      new Notification('Alarme!', {
        body: `Seu alarme para ${alarm.time} está tocando!`,
        icon: '/vite.svg'
      });
    } else {
      alert(`Alarme! ${alarm.time}`);
    }
  };

  const addAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (permission === 'default') {
      requestPermission();
    }
    
    const newAlarm: Alarm = {
      id: crypto.randomUUID(),
      time: newTime,
      active: true
    };
    
    setAlarms([...alarms, newAlarm].sort((a, b) => a.time.localeCompare(b.time)));
    trackEvent('Alarm', 'Created', newTime);
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id));
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-500" />
          Alarme
        </h2>
        {permission !== 'granted' && (
          <button 
            onClick={requestPermission}
            className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400"
          >
            Habilitar Notificações
          </button>
        )}
      </div>

      <form onSubmit={addAlarm} className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 mb-8 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
            Horário do Alarme
          </label>
          <input 
            type="time" 
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="w-full text-4xl font-mono bg-transparent border-b-2 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 outline-none pb-2 transition-colors"
            required
          />
        </div>
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-colors flex items-center justify-center shadow-sm"
        >
          <Plus className="w-6 h-6" />
        </button>
      </form>

      <div className="space-y-4">
        {alarms.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 dark:text-neutral-500 flex flex-col items-center">
            <BellRing className="w-12 h-12 mb-4 opacity-20" />
            <p>Nenhum alarme configurado</p>
          </div>
        ) : (
          alarms.map(alarm => (
            <div 
              key={alarm.id} 
              className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                alarm.active 
                  ? 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-sm' 
                  : 'bg-neutral-50 dark:bg-neutral-800/50 border-transparent opacity-60'
              }`}
            >
              <div className="text-4xl font-mono tracking-tight">
                {alarm.time}
              </div>
              <div className="flex items-center gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={alarm.active}
                    onChange={() => toggleAlarm(alarm.id)}
                  />
                  <div className="w-14 h-7 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                </label>
                <button 
                  onClick={() => deleteAlarm(alarm.id)}
                  className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
