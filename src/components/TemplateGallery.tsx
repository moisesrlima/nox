import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, Plus, Layout, User, GraduationCap, Briefcase, Rocket, Brain, Coffee } from 'lucide-react';
import { TEMPLATES, createNoteFromTemplate } from '../templates';
import { Note } from '../types';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { AdUnit } from './AdUnit';

interface TemplateGalleryProps {
  onClose: () => void;
  onSelectTemplate: (note: Note) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: Layout },
  { id: 'Produtividade', name: 'Produtividade', icon: Rocket },
  { id: 'Organização', name: 'Organização', icon: Brain },
  { id: 'Estudantes', name: 'Estudantes', icon: GraduationCap },
  { id: 'Criadores', name: 'Criadores', icon: Coffee },
  { id: 'Profissional', name: 'Profissional', icon: Briefcase },
  { id: 'Pessoal', name: 'Pessoal', icon: User },
];

export function TemplateGallery({ onClose, onSelectTemplate }: TemplateGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<{ id: string; title: string; description: string; content: string; category: string } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (templateId: string) => {
    const newNote = createNoteFromTemplate(templateId);
    onSelectTemplate(newNote);
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-6 bg-[var(--bg-surface)]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors text-[var(--text-secondary)]"
            title="Voltar ao Editor"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Galeria de Templates</h1>
        </div>

        <div className="relative max-w-md w-full mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <input
            type="text"
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all"
          />
        </div>
      </header>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 p-4 overflow-x-auto no-scrollbar border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
        {CATEGORIES.map(category => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] shadow-lg shadow-[var(--accent-primary)]/20'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]'
              }`}
            >
              <Icon size={16} />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredTemplates.map((template, index) => (
            <React.Fragment key={template.id}>
              {index === 6 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="col-span-1"
                >
                  <AdUnit slot="TEMPLATE_GALLERY_SLOT" />
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[var(--accent-primary)]/5 hover:border-[var(--accent-primary)]/30 transition-all flex flex-col"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 bg-[var(--bg-hover)] text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider rounded">
                      {template.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                    {template.description}
                  </p>
                </div>
                <div className="p-4 bg-[var(--bg-hover)]/30 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setPreviewTemplate(template);
                      setIsPreviewOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-xl text-sm font-bold hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
                  >
                    <Layout size={14} />
                    Visualizar
                  </button>
                  <button
                    onClick={() => handleSelect(template.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--accent-primary)] text-[var(--accent-contrast)] rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-md shadow-[var(--accent-primary)]/20"
                  >
                    <Plus size={14} />
                    Usar
                  </button>
                </div>
              </motion.div>
            </React.Fragment>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mb-4 border border-[var(--border-color)]">
              <Search size={32} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Nenhum template encontrado</h3>
            <p className="text-[var(--text-secondary)]">Tente buscar por outros termos ou categorias.</p>
          </div>
        )}
      </div>

      <TemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirm={() => previewTemplate && handleSelect(previewTemplate.id)}
        template={previewTemplate}
      />
    </div>
  );
}
