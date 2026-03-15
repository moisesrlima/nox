import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ResetModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetModal({ onConfirm, onCancel }: ResetModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
        <div className="flex items-center gap-4 text-error">
          <div className="p-3 bg-error/10 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">Apagar todos os dados?</h2>
        </div>
        
        <p className="text-text-secondary text-sm leading-relaxed">
          Esta ação irá <strong className="text-text-primary">excluir permanentemente todas as suas notas</strong> e restaurar o aplicativo para o estado inicial. 
          Isso não pode ser desfeito. Recomendamos fazer um backup antes.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-hover hover:bg-border text-text-primary font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-error hover:bg-error text-text-on-error font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 focus:ring-offset-surface"
          >
            Sim, apagar tudo
          </button>
        </div>
      </div>
    </div>
  );
}