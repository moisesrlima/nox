
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = index => {
    const command = props.items[index];
    if (command) {
      props.command(command);
    }
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="z-50 w-64 bg-surface border border-border rounded-xl shadow-2xl py-2 overflow-hidden">
        <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">Comandos</div>
        {props.items.length ? (
            props.items.map((item, index) => (
                <button
                    key={index}
                    onClick={() => selectItem(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                        index === selectedIndex ? 'bg-hover text-text-primary' : 'text-text-secondary'
                    }`}
                >
                    <div className={`p-1.5 rounded-lg ${
                        index === selectedIndex ? 'bg-surface text-accent' : 'bg-hover'
                    }`}>
                        {item.icon}
                    </div>
                    <div>
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-[10px] opacity-60">{item.description}</div>
                    </div>
                </button>
            ))
        ) : (
            <div className="px-3 py-2 text-sm text-text-secondary">Nenhum comando encontrado.</div>
        )}
    </div>
  );
});

export default CommandList;