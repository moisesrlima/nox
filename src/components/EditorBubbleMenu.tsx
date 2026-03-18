import React from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Bold, Italic, Underline, Link as LinkIcon, Code, Plus, Trash2, Table as TableIcon, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const isTable = editor.isActive('table');

  return (
    <BubbleMenu editor={editor}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-color)] p-1 rounded-lg shadow-xl backdrop-blur-md">
          <button 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            className={`p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors ${editor.isActive('bold') ? 'text-[var(--accent-primary)] bg-[var(--bg-hover)]' : 'text-[var(--text-secondary)]'}`}
            title="Negrito"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            className={`p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors ${editor.isActive('italic') ? 'text-[var(--accent-primary)] bg-[var(--bg-hover)]' : 'text-[var(--text-secondary)]'}`}
            title="Itálico"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            className={`p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors ${editor.isActive('underline') ? 'text-[var(--accent-primary)] bg-[var(--bg-hover)]' : 'text-[var(--text-secondary)]'}`}
            title="Sublinhado"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleCode().run()} 
            className={`p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors ${editor.isActive('code') ? 'text-[var(--accent-primary)] bg-[var(--bg-hover)]' : 'text-[var(--text-secondary)]'}`}
            title="Código"
          >
            <Code className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
          <button 
            onClick={() => {
              const url = window.prompt('URL:');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }} 
            className={`p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors ${editor.isActive('link') ? 'text-[var(--accent-primary)] bg-[var(--bg-hover)]' : 'text-[var(--text-secondary)]'}`}
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        {isTable && (
          <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-color)] p-1 rounded-lg shadow-xl backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
            <button 
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Adicionar linha acima"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button 
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Adicionar linha abaixo"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[var(--border-color)] mx-0.5" />
            <button 
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Adicionar coluna à esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Adicionar coluna à direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[var(--border-color)] mx-0.5" />
            <button 
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors"
              title="Excluir linha"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors"
              title="Excluir coluna"
            >
              <Trash2 className="w-4 h-4 rotate-90" />
            </button>
            <div className="w-px h-4 bg-[var(--border-color)] mx-0.5" />
            <button 
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors"
              title="Excluir tabela"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </BubbleMenu>
  );
}
