import React, { useState } from 'react';

interface WelcomeModalProps {
  onAccept: () => void;
  isFirstVisit: boolean;
}

export function WelcomeModal({ onAccept, isFirstVisit }: WelcomeModalProps) {
  const [hasConsented, setHasConsented] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Bem-vindo ao Nox</h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Seu novo bloco de notas focado em privacidade e velocidade.
          </p>
        </div>

        <div className="space-y-4 text-sm text-[var(--text-secondary)]">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <strong className="text-[var(--text-primary)] block">100% Local e Seguro</strong>
              Seus dados nunca saem do seu dispositivo. Não há servidores, contas ou senhas.
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <strong className="text-[var(--text-primary)] block">Armazenamento Limitado</strong>
              Usamos o <code className="bg-[var(--bg-hover)] px-1 py-0.5 rounded text-xs">localStorage</code> do seu navegador, que tem um limite de cerca de 5MB.
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <strong className="text-[var(--text-primary)] block">Risco de Perda de Dados</strong>
              Se você limpar o cache ou os dados do seu navegador, <strong>suas notas serão apagadas permanentemente</strong>. Use a função de backup com frequência.
            </div>
          </div>
        </div>

        {isFirstVisit && (
          <div className="flex items-start gap-3 p-4 bg-[var(--bg-primary)]/50 rounded-lg border border-[var(--border-color)]">
            <input
              type="checkbox"
              id="consent"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] focus:ring-offset-[var(--bg-surface)] cursor-pointer"
            />
            <label htmlFor="consent" className="text-sm text-[var(--text-secondary)] cursor-pointer select-none">
              Eu entendo que minhas notas são salvas apenas neste navegador e serão perdidas se eu limpar os dados de navegação.
            </label>
          </div>
        )}

        <button
          onClick={onAccept}
          disabled={isFirstVisit && !hasConsented}
          className={`w-full font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)] focus:ring-offset-2 focus:ring-offset-[var(--bg-surface)] ${
            isFirstVisit && !hasConsented
              ? 'bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-not-allowed'
              : 'bg-[var(--accent-primary)] hover:opacity-90 text-[var(--bg-primary)]'
          }`}
        >
          {isFirstVisit ? 'Começar a usar' : 'Fechar'}
        </button>
      </div>
    </div>
  );
}
