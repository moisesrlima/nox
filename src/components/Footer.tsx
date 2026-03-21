import React from 'react';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)] border-t border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-muted)]">
      <div className="max-w-full flex items-center justify-center gap-4">
        <a
          href="/privacy-policy.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--text-secondary)] transition-colors"
        >
          Política de Privacidade
        </a>
        <span>•</span>
        <a
          href="/terms-of-service.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--text-secondary)] transition-colors"
        >
          Termos de Serviço
        </a>
        <span>•</span>
        <a
          href="/google9ca2185b737e34d3.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--text-secondary)] transition-colors"
        >
          Verificação Google
        </a>
      </div>
    </footer>
  );
}