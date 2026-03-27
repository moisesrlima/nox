import React from 'react';

interface WelcomeModalProps {
  onAccept: () => void;
}

export function WelcomeModal({ onAccept }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Sobre NoxNote</h2>
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
              <strong className="text-[var(--text-primary)] block">Local-First e Seguro</strong>
              Suas notas são salvas no seu dispositivo para acesso instantâneo. Você tem controle total sobre seus dados.
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <strong className="text-[var(--text-primary)] block">Sincronização na Nuvem</strong>
              Faça login com sua conta Google para sincronizar suas notas no Google Drive de forma segura e acessá-las em qualquer dispositivo.
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <strong className="text-[var(--text-primary)] block">Modo Aula (Voz → Texto)</strong>
              Transcreva suas ideias em tempo real com o novo comando de voz. Digite "/" no editor para ativar.
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <strong className="text-[var(--text-primary)] block">Templates e Temas</strong>
              Galeria completa de modelos prontos e mais de 15 temas exclusivos para personalizar sua experiência.
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <strong className="text-[var(--text-primary)] block">Backup e Sincronização</strong>
              Recomendamos ativar o Google Drive para manter suas notas seguras em todos os seus dispositivos.
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onAccept}
            className="w-full font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)] focus:ring-offset-2 focus:ring-offset-[var(--bg-surface)] bg-[var(--accent-primary)] hover:opacity-90 text-[var(--accent-contrast)]"
          >
            Fechar
          </button>
          
          <a
            href="https://appsforall.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
          >
            mais web apps como esse
          </a>
        </div>
      </div>
    </div>
  );
}
