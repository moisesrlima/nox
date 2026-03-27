import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  template: {
    title: string;
    description: string;
    content: string;
  } | null;
}

export function TemplatePreviewModal({ isOpen, onClose, onConfirm, template }: TemplatePreviewModalProps) {
  if (!template) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-primary)]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{template.title}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">{template.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors text-[var(--text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-primary)]">
              <div className="prose prose-sm dark:prose-invert max-w-none markdown-body text-[var(--text-primary)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {template.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--border-color)] flex items-center justify-end gap-3 bg-[var(--bg-primary)]/50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex items-center gap-2 px-6 py-2 bg-[var(--accent-primary)] hover:opacity-90 text-[var(--accent-contrast)] rounded-xl font-medium transition-all shadow-lg shadow-[var(--accent-primary)]/20 active:scale-95"
              >
                <Check className="w-4 h-4" />
                Usar este Template
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
