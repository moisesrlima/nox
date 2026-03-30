import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AlarmClock, Timer, Hourglass, ExternalLink } from 'lucide-react';

export function Layout() {
  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Timer className="w-6 h-6 text-blue-500" />
            TempoTools
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/tools/alarm"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
              }`
            }
          >
            <AlarmClock className="w-5 h-5" />
            Alarme
          </NavLink>
          <NavLink
            to="/tools/stopwatch"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
              }`
            }
          >
            <Timer className="w-5 h-5" />
            Cronômetro
          </NavLink>
          <NavLink
            to="/tools/timer"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
              }`
            }
          >
            <Hourglass className="w-5 h-5" />
            Contagem Regressiva
          </NavLink>
        </nav>
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          <button 
            onClick={() => window.open(window.location.href, '_blank')}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir em nova página
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
