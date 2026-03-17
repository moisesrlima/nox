import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ResetModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetModal({ onConfirm, onCancel }: ResetModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
        <div className="flex items-center gap-4 text-rose-500">
          <div className="p-3 bg-rose-500/10 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Apagar todos os dados?</h2>
        </div>
        
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          Esta ação irá <strong className="text-[var(--text-primary)]">excluir permanentemente todas as suas notas</strong> e restaurar o aplicativo para o estado inicial. 
          Isso não pode ser desfeito. Recomendamos fazer um backup antes.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-[var(--bg-hover)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)] focus:ring-offset-2 focus:ring-offset-[var(--bg-surface)]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-surface)]"
          >
            Sim, apagar tudo
          </button>
        </div>
      </div>
    </div>
  );
}
