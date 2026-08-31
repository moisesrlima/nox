import React from 'react';
import { X, ExternalLink, Coffee } from 'lucide-react';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal "Sobre" — apresentação do projeto AppsForAll e do criador.
 * Disparado a partir do menu lateral (botão "Sobre").
 */
export function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div
        className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
          <h2
            id="about-modal-title"
            className="text-lg font-bold text-[var(--text-primary)]"
          >
            Sobre o AppsForAll
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto text-sm text-[var(--text-secondary)] space-y-5 leading-relaxed">
          <section>
            <h3 className="font-bold text-[var(--text-primary)] mb-2">
              Sobre o AppsForAll
            </h3>
            <p>
              O <strong className="text-[var(--text-primary)]">AppsForAll</strong> nasceu da paixão
              por um ecossistema de aplicativos mais aberto, acessível e universal.
              Acreditamos no poder dos Progressive Web Apps (PWAs) para quebrar as barreiras
              entre plataformas e oferecer experiências incríveis diretamente do navegador.
            </p>
            <p className="mt-3">
              Esta plataforma é uma curadoria cuidadosa de PWAs, criados por mim ou com minha
              contribuição, projetados para serem úteis, rápidos e confiáveis.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-[var(--text-primary)] mb-2">O Criador</h3>
            <p>
              Olá, eu sou{' '}
              <strong className="text-[var(--text-primary)]">Moisés Rabelo</strong> 👋
            </p>
            <p className="mt-2">
              Criador apaixonado por tecnologia, IA, design e projetos criativos. Seu apoio
              ajuda a transformar ideias em realidade. ☕ 🚀 🧩 ❤️ 🙏
            </p>
          </section>

          <section className="space-y-2 pt-2">
            <a
              href="https://pagaum.cafe/eusoumoisesrabelo?ref=badge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors"
            >
              <Coffee className="w-5 h-5" />
              Paga um café
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <a
              href="https://appsforall.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] font-bold hover:opacity-90 transition-opacity"
            >
              Visitar AppsForAll
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}