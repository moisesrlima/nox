import React from 'react';
import { CommandItem } from './EditorCommands';

interface EditorSlashMenuProps {
  x: number;
  y: number;
  commands: CommandItem[];
  selectedIndex: number;
  onSelectCommand: (title: string) => void;
  onMouseEnter: (index: number) => void;
}

export function EditorSlashMenu({
  x,
  y,
  commands,
  selectedIndex,
  onSelectCommand,
  onMouseEnter
}: EditorSlashMenuProps) {
  return (
    <div 
      className="fixed z-50 w-64 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-2xl py-2 overflow-hidden"
      style={{ left: x, top: y }}
    >
      <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Comandos</div>
      {commands.map((cmd, i) => (
        <button
          key={cmd.title}
          onClick={() => onSelectCommand(cmd.title.toLowerCase())}
          onMouseEnter={() => onMouseEnter(i)}
          className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${selectedIndex === i ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
        >
          <div className={`p-1.5 rounded-lg ${selectedIndex === i ? 'bg-[var(--bg-primary)] text-[var(--accent-primary)]' : 'bg-[var(--bg-hover)]'}`}>
            {cmd.icon}
          </div>
          <div>
            <div className="text-sm font-medium">{cmd.title}</div>
            <div className="text-[10px] opacity-60">{cmd.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
