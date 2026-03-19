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
            <div className="p-6 border-bottom border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-primary)]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{template.title}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">{template.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--hover-color)] rounded-full transition-colors text-[var(--text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-primary)]">
              <div className="prose prose-sm dark:prose-invert max-w-none markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {template.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-top border-[var(--border-color)] flex items-center justify-end gap-3 bg-[var(--bg-primary)]/50">
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
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95"
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
