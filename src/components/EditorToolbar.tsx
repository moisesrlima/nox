import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Markdown } from 'tiptap-markdown';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import { CustomTaskItem } from './CustomTaskItem';
import SlashCommandExtension from './SlashCommand.tsx';
import { Bold, Italic, Underline, Strikethrough, Link as LinkIcon, Heading1, Heading2, Heading3, List, ListOrdered, ListTodo, Quote, Code, Table as TableIcon } from 'lucide-react';

interface EditorToolbarProps {
  editor: any;
  mode: 'visual' | 'markdown';
  onImageUploadTrigger: () => void;
}

export function EditorToolbar({
  editor,
  mode,
  onImageUploadTrigger
}: EditorToolbarProps) {
  if (mode === 'visual' && editor) {
    return (
      <BubbleMenu editor={editor}>
        <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg shadow-xl backdrop-blur-md">
          <button 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            className={`p-1.5 rounded hover:bg-hover transition-colors ${editor.isActive('bold') ? 'text-accent bg-hover' : 'text-text-secondary'}`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            className={`p-1.5 rounded hover:bg-hover transition-colors ${editor.isActive('italic') ? 'text-accent bg-hover' : 'text-text-secondary'}`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            className={`p-1.5 rounded hover:bg-hover transition-colors ${editor.isActive('underline') ? 'text-accent bg-hover' : 'text-text-secondary'}`}
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button 
            onClick={() => {
              const url = window.prompt('URL:');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }} 
            className={`p-1.5 rounded hover:bg-hover transition-colors ${editor.isActive('link') ? 'text-accent bg-hover' : 'text-text-secondary'}`}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
      </BubbleMenu>
    );
  }

  return null;
}

interface MarkdownToolbarProps {
  onApplyStyle: (prefix: string, suffix?: string) => void;
}

export function MarkdownToolbar({ onApplyStyle }: MarkdownToolbarProps) {
  const buttons = [
    { icon: Heading1, style: '# ', tooltip: 'Título 1' },
    { icon: Heading2, style: '## ', tooltip: 'Título 2' },
    { icon: Heading3, style: '### ', tooltip: 'Título 3' },
    { separator: true }, 
    { icon: Bold, style: '**', tooltip: 'Negrito' },
    { icon: Italic, style: '*', tooltip: 'Itálico' },
    { icon: Underline, style: '<u>', suffix: '</u>', tooltip: 'Sublinhado' },
    { icon: Strikethrough, style: '~~', tooltip: 'Riscado' },
    { separator: true },
    { icon: LinkIcon, style: '[', suffix: '](url)', tooltip: 'Link' },
    { icon: Quote, style: '> ', tooltip: 'Citação' },
    { icon: Code, style: '```\n', suffix: '\n```', tooltip: 'Bloco de Código' },
    { separator: true },
    { icon: List, style: '- ', tooltip: 'Lista' },
    { icon: ListOrdered, style: '1. ', tooltip: 'Lista Ordenada' },
    { icon: ListTodo, style: '- [ ] ', tooltip: 'Lista de Tarefas' },
    { separator: true },
    { icon: TableIcon, style: '| Cabeçalho 1 | Cabeçalho 2 |\n|---|---|\n| Célula 1 | Célula 2 |\n', tooltip: 'Tabela' },
  ];

  return (
    <div className="w-full sticky top-0 z-10 bg-surface/80 backdrop-blur-sm border-b border-border/50 flex items-center justify-center flex-wrap gap-1 px-4 py-2">
      {buttons.map((btn, index) => (
        btn.separator ? (
          <div key={index} className="w-px h-5 bg-border/50 mx-1" />
        ) : (
          <button
            key={index}
            onClick={() => onApplyStyle(btn.style!, btn.suffix)}
            className="p-2 rounded hover:bg-hover text-text-secondary transition-colors"
            title={btn.tooltip}
          >
            <btn.icon className="w-4 h-4" />
          </button>
        )
      ))}
    </div>
  );
}

export function createEditorExtensions() {
  return [
    StarterKit.configure({
      link: {
        openOnClick: false,
      },
    }),
    Markdown,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Image,
    TaskList,
    CustomTaskItem.configure({
      nested: true,
    }),
    Placeholder.configure({
      placeholder: "Digite '/' para comandos...",
    }),
    SlashCommandExtension,
  ];
}