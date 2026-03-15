import React, { useState } from 'react';
import { Shield, AlertTriangle, Trash2 } from 'lucide-react';

interface WelcomeModalProps {
  onAccept: () => void;
  isFirstVisit: boolean;
}

export function WelcomeModal({ onAccept, isFirstVisit }: WelcomeModalProps) {
  const [hasConsented, setHasConsented] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-text-primary">Bem-vindo ao Nox</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Seu novo bloco de notas focado em privacidade e velocidade.
          </p>
        </div>

        <div className="space-y-4 text-sm text-text-secondary">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div>
              <strong className="text-text-primary block">100% Local e Seguro</strong>
              Seus dados nunca saem do seu dispositivo. Não há servidores, contas ou senhas.
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <strong className="text-text-primary block">Armazenamento Limitado</strong>
              Usamos o <code className="bg-surface px-1 py-0.5 rounded text-xs">localStorage</code> do seu navegador, que tem um limite de cerca de 5MB.
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Trash2 className="w-5 h-5 text-error" />
            </div>
            <div>
              <strong className="text-text-primary block">Risco de Perda de Dados</strong>
              Se você limpar o cache ou os dados do seu navegador, <strong>suas notas serão apagadas permanentemente</strong>. Use a função de backup com frequência.
            </div>
          </div>
        </div>

        {isFirstVisit && (
          <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-border">
            <input
              type="checkbox"
              id="consent"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-border bg-surface text-success focus:ring-success focus:ring-offset-surface cursor-pointer"
            />
            <label htmlFor="consent" className="text-sm text-text-secondary cursor-pointer select-none">
              Eu entendo que minhas notas são salvas apenas neste navegador e serão perdidas se eu limpar os dados de navegação.
            </label>
          </div>
        )}

        <button
          onClick={onAccept}
          disabled={isFirstVisit && !hasConsented}
          className={`w-full font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface ${
            isFirstVisit && !hasConsented
              ? 'bg-surface text-text-muted cursor-not-allowed'
              : 'bg-accent hover:bg-accent-soft text-accent-contrast'
          }`}
        >
          {isFirstVisit ? 'Começar a usar' : 'Fechar'}
        </button>
      </div>
    </div>
  );
}