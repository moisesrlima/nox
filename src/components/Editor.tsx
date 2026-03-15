import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Note } from '../types';
import { 
  Download, Edit3, Eye, FileText, Menu, FileCode2, FileType2, Type, Code,
  Bold, Italic, Underline, Link as LinkIcon, Search
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

// Tiptap imports
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Markdown } from 'tiptap-markdown';
import { getSlashCommands, CommandItem } from './EditorCommands';

interface EditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onToggleSidebar: () => void;
}

export function Editor({ note, onUpdateNote, onToggleSidebar }: EditorProps) {
  const [mode, setMode] = useState<'visual' | 'markdown'>('visual');
  const [slashMenu, setSlashMenu] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUpdatingFromNote = useRef(false);

  // Use refs to avoid stale closures in Tiptap handlers
  const slashMenuRef = useRef(slashMenu);
  const selectedIndexRef = useRef(selectedIndex);
  const modeRef = useRef(mode);
  const commands = getSlashCommands((type) => handleCommandSelect(type));
  const commandsRef = useRef(commands);

  useEffect(() => { slashMenuRef.current = slashMenu; }, [slashMenu]);
  useEffect(() => { selectedIndexRef.current = selectedIndex; }, [selectedIndex]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { commandsRef.current = commands; }, [commands]);

  const handleCommandSelect = (type: string) => {
    const currentMode = modeRef.current;
    if (currentMode === 'visual' && editor) {
      // Remove the slash
      const { from } = editor.state.selection;
      editor.commands.deleteRange({ from: from - 1, to: from });

      const normalizedType = type.toLowerCase();
      switch (normalizedType) {
        case 'título 1': case 'h1': editor.commands.setHeading({ level: 1 }); break;
        case 'título 2': case 'h2': editor.commands.setHeading({ level: 2 }); break;
        case 'lista': case 'list': editor.commands.toggleBulletList(); break;
        case 'divisor': case 'hr': editor.commands.setHorizontalRule(); break;
        case 'tabela': case 'table': 
          editor.commands.insertContent('| Produto | Quantidade | Preço |\n|---------|------------|-------|\n| Maçã    | 10         | R$ 2  |\n| Banana  | 5          | R$ 3  |\n| Laranja | 8          | R$ 4  |');
          break;
      }
    } else if (currentMode === 'markdown' && textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = note?.content || '';
      
      let snippet = '';
      const normalizedType = type.toLowerCase();
      switch (normalizedType) {
        case 'título 1': case 'h1': snippet = '# '; break;
        case 'título 2': case 'h2': snippet = '## '; break;
        case 'lista': case 'list': snippet = '- '; break;
        case 'divisor': case 'hr': snippet = '\n---\n'; break;
        case 'tabela': case 'table': snippet = '| Produto | Quantidade | Preço |\n|---------|------------|-------|\n| Maçã    | 10         | R$ 2  |\n| Banana  | 5          | R$ 3  |\n| Laranja | 8          | R$ 4  |'; break;
      }

      // Replace the slash (which is at start-1)
      const newContent = content.substring(0, start - 1) + snippet + content.substring(end);
      onUpdateNote(note!.id, { content: newContent, updatedAt: Date.now() });
      
      // Update Tiptap if needed
      if (editor) {
        isUpdatingFromNote.current = true;
        editor.commands.setContent(newContent);
        isUpdatingFromNote.current = false;
      }
    }
    setSlashMenu(prev => ({ ...prev, active: false }));
  };

  // Tiptap Editor
  const editor = useEditor({
    extensions: [
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
      Placeholder.configure({
        placeholder: "Digite '/' para comandos...",
      }),
    ],
    content: note?.content || '',
    onUpdate: ({ editor }) => {
      if (note && !isUpdatingFromNote.current) {
        const markdown = (editor.storage as any).markdown.getMarkdown();
        onUpdateNote(note.id, { content: markdown, updatedAt: Date.now() });
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-zinc max-w-none focus:outline-none min-h-full p-6 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-a:text-emerald-400 hover:prose-a:text-emerald-300 prose-img:rounded-xl prose-img:border prose-img:border-zinc-800',
      },
      handleKeyDown: (view, event) => {
        if (event.key === '/') {
          const { selection } = view.state;
          const isAtStart = selection.$from.parentOffset === 0;
          const prevChar = selection.$from.nodeBefore?.textContent?.slice(-1);
          const isAfterSpace = prevChar === ' ';

          if (isAtStart || isAfterSpace) {
            const { from } = selection;
            const coords = view.coordsAtPos(from);
            setSlashMenu({ x: coords.left, y: coords.bottom + 5, active: true });
            setSelectedIndex(0);
            return false;
          }
        }
        
        if (slashMenuRef.current.active) {
          if (event.key === 'ArrowDown') {
            setSelectedIndex(prev => (prev + 1) % commands.length);
            return true;
          }
          if (event.key === 'ArrowUp') {
            setSelectedIndex(prev => (prev - 1 + commands.length) % commands.length);
            return true;
          }
          if (event.key === 'Enter') {
            const cmd = commandsRef.current[selectedIndexRef.current];
            handleCommandSelect(cmd.title);
            return true;
          }
          if (event.key === 'Escape') {
            setSlashMenu(prev => ({ ...prev, active: false }));
            return true;
          }
        }
        return false;
      }
    },
  });

  // Sync Tiptap when note changes
  useEffect(() => {
    if (note && editor && note.content !== (editor.storage as any).markdown.getMarkdown()) {
      isUpdatingFromNote.current = true;
      editor.commands.setContent(note.content);
      isUpdatingFromNote.current = false;
    }
  }, [note?.id, editor]);

  // Default to visual mode when switching notes
  useEffect(() => {
    if (note) {
      setMode('visual');
    }
  }, [note?.id]);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-zinc-500">
        <FileText className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">Selecione uma nota ou crie uma nova</p>
      </div>
    );
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNote(note.id, { title: e.target.value, updatedAt: Date.now() });
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onUpdateNote(note.id, { content: newContent, updatedAt: Date.now() });
    
    // Sync back to Tiptap
    if (editor && newContent !== (editor.storage as any).markdown.getMarkdown()) {
      isUpdatingFromNote.current = true;
      editor.commands.setContent(newContent);
      isUpdatingFromNote.current = false;
    }

    // Slash command detection for textarea
    const cursor = e.target.selectionStart;
    const lastChar = newContent[cursor - 1];
    const prevChar = newContent[cursor - 2];
    const lineStart = newContent.lastIndexOf('\n', cursor - 2) + 1;
    
    if (lastChar === '/' && (cursor - 1 === lineStart || prevChar === ' ')) {
      const rect = e.target.getBoundingClientRect();
      // Simple approximation for caret position in textarea
      setSlashMenu({ x: rect.left + 20, y: rect.top + 100, active: true });
      setSelectedIndex(0);
    } else if (slashMenu.active) {
      setSlashMenu(prev => ({ ...prev, active: false }));
    }
  };

  const applyMarkdownStyle = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = note.content.substring(start, end);
    const newContent = note.content.substring(0, start) + prefix + selectedText + suffix + note.content.substring(end);
    onUpdateNote(note.id, { content: newContent, updatedAt: Date.now() });
  };

  const exportTxt = () => {
    const blob = new Blob([note.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title || 'nota'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportHtml = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${note.title}</title>
        <style>
          body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
          pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
          code { font-family: monospace; background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; }
          blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        ${editor?.getHTML() || '<h1>Erro ao gerar HTML</h1>'}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title || 'nota'}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (!editor) return;
    const element = document.createElement('div');
    element.innerHTML = editor.getHTML();
    element.style.padding = '20px';
    element.style.color = '#000';
    element.style.fontFamily = 'system-ui, sans-serif';
    const style = document.createElement('style');
    style.innerHTML = `
      body { color: #000 !important; background: #fff !important; }
      pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; }
      code { font-family: monospace; }
      blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f4f4f4; }
    `;
    element.appendChild(style);
    const opt = {
      margin: 10,
      filename: `${note.title || 'nota'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-zinc-950 overflow-hidden relative">
      <header className="flex-none h-16 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-950/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={note.title}
            onChange={handleTitleChange}
            placeholder="Título da nota"
            className="flex-1 bg-transparent text-xl font-semibold text-zinc-100 placeholder-zinc-600 focus:outline-none truncate"
          />
        </div>

        <div className="flex items-center gap-2 ml-4">
          <div className="hidden sm:flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <button
              onClick={() => setMode('visual')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'visual' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Type className="w-4 h-4" /> Visual
            </button>
            <button
              onClick={() => setMode('markdown')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'markdown' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Code className="w-4 h-4" /> Markdown
            </button>
          </div>

          <div className="relative group">
            <button className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Exportar</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1">
              <button onClick={exportTxt} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                <FileType2 className="w-4 h-4" /> TXT
              </button>
              <button onClick={exportHtml} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                <FileCode2 className="w-4 h-4" /> HTML
              </button>
              <button onClick={exportPdf} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                <FileText className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-none px-4 py-2 bg-zinc-900/30 border-b border-zinc-800/50 flex items-center gap-4 text-xs text-zinc-500">
        <span>Criado: {format(note.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
        <span>Modificado: {format(note.updatedAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {editor && mode === 'visual' && (
          <BubbleMenu editor={editor}>
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg shadow-xl backdrop-blur-md">
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('bold') ? 'text-emerald-400 bg-zinc-800' : 'text-zinc-400'}`}>
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('italic') ? 'text-emerald-400 bg-zinc-800' : 'text-zinc-400'}`}>
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('underline') ? 'text-emerald-400 bg-zinc-800' : 'text-zinc-400'}`}>
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-zinc-800 mx-1" />
              <button onClick={() => {
                const url = window.prompt('URL:');
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }} className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('link') ? 'text-emerald-400 bg-zinc-800' : 'text-zinc-400'}`}>
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>
          </BubbleMenu>
        )}

        {slashMenu.active && (
          <div 
            className="fixed z-50 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 overflow-hidden"
            style={{ left: slashMenu.x, top: slashMenu.y }}
          >
            <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Comandos</div>
            {commands.map((cmd, i) => (
              <button
                key={cmd.title}
                onClick={() => handleCommandSelect(cmd.title.toLowerCase())}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${selectedIndex === i ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'}`}
              >
                <div className={`p-1.5 rounded-lg ${selectedIndex === i ? 'bg-zinc-700 text-emerald-400' : 'bg-zinc-800'}`}>
                  {cmd.icon}
                </div>
                <div>
                  <div className="text-sm font-medium">{cmd.title}</div>
                  <div className="text-[10px] opacity-60">{cmd.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {mode === 'markdown' ? (
          <div className="w-full h-full relative">
            {/* Floating toolbar for Markdown mode */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 p-1 rounded-lg shadow-xl backdrop-blur-md">
              <button onClick={() => applyMarkdownStyle('**')} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 transition-colors"><Bold className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('*')} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 transition-colors"><Italic className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('<u>', '</u>')} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 transition-colors"><Underline className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('[', '](url)')} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 transition-colors"><LinkIcon className="w-4 h-4" /></button>
            </div>
            <textarea
              ref={textareaRef}
              value={note.content}
              onChange={handleMarkdownChange}
              placeholder="Comece a escrever em Markdown..."
              className="w-full h-full p-16 bg-transparent text-zinc-300 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder-zinc-700"
              spellCheck="false"
            />
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
      
      <div className="sm:hidden fixed bottom-6 right-6 z-20">
        <button
          onClick={() => setMode(mode === 'visual' ? 'markdown' : 'visual')}
          className="bg-zinc-100 text-zinc-900 p-4 rounded-full shadow-lg shadow-black/50 hover:bg-white transition-colors"
        >
          {mode === 'markdown' ? <Type className="w-6 h-6" /> : <Code className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
