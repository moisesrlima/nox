import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Note } from '../types';
import { 
  Download, Edit3, Eye, FileText, Menu, FileCode2, FileType2, Type, Code,
  Bold, Italic, Underline, Link as LinkIcon, Search,
  Heading1, Heading2, Heading3, Strikethrough, List, ListOrdered, CheckSquare, Quote, Minus, Table as TableIcon, Image as ImageIcon,
  HelpCircle, X, Undo, Redo
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
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TiptapUnderline from '@tiptap/extension-underline';
import Typography from '@tiptap/extension-typography';
import TiptapLink from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';
import { getSlashCommands, CommandItem } from './EditorCommands';
import { EditorTopBar } from './EditorTopBar';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { EditorSlashMenu } from './EditorSlashMenu';
import { readNote, stopReading } from './EditorReading';

interface EditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onToggleSidebar: () => void;
  currentThemeId: string;
}

export function Editor({ note, onUpdateNote, onToggleSidebar, currentThemeId }: EditorProps) {
  const [mode, setMode] = useState<'visual' | 'markdown'>('visual');
  const [slashMenu, setSlashMenu] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isGlobalPlaying, setIsGlobalPlaying] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isUpdatingFromNote = useRef(false);

  const isDarkTheme = currentThemeId === 'zinc';

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
        case 'checklist': editor.commands.toggleTaskList(); break;
        case 'código': case 'codeblock': editor.commands.toggleCodeBlock(); break;
        case 'divisor': case 'hr': editor.commands.setHorizontalRule(); break;
        case 'imagem': case 'image':
          handleImageInsert(true);
          break;
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
        case 'checklist': snippet = '- [ ] '; break;
        case 'código': case 'codeblock': snippet = '\n```\n\n```\n'; break;
        case 'imagem': case 'image':
          handleImageInsert(true);
          return; // handleImageInsert will handle the update
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
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      TiptapUnderline,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Typography,
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: '-',
        linkify: true,
        breaks: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl border border-[var(--border-color)] shadow-sm max-w-full h-auto my-4',
        },
      }),
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
        class: `prose ${isDarkTheme ? 'prose-invert prose-zinc' : 'prose-slate'} max-w-none focus:outline-none min-h-full p-6 prose-pre:bg-[var(--bg-surface)] prose-pre:border prose-pre:border-[var(--border-color)] prose-a:text-[var(--accent-primary)] hover:prose-a:opacity-80 prose-img:rounded-xl prose-img:border prose-img:border-[var(--border-color)]`,
      },
      handleKeyDown: (view, event) => {
        if (event.key === '/') {
          const { selection } = view.state;
          const isAtStart = selection.$from.parentOffset === 0;
          const textBefore = selection.$from.parent.textContent.slice(0, selection.$from.parentOffset);
          const prevChar = textBefore.slice(-1);
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
          if (event.key.length === 1 || event.key === 'Backspace') {
            setSlashMenu(prev => ({ ...prev, active: false }));
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

  const handleImageInsert = (isSlash: boolean = false) => {
    const choice = window.confirm('Deseja fazer upload de uma imagem do seu computador? (Clique em Cancelar para inserir via link)');
    if (choice) {
      // Store whether it was a slash command to handle replacement correctly
      (imageInputRef.current as any)._isSlash = isSlash;
      imageInputRef.current?.click();
    } else {
      const url = window.prompt('Insira a URL da imagem:');
      if (url) {
        insertImage(url, isSlash);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const isSlash = (event.target as any)._isSlash || false;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        insertImage(base64, isSlash);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
    (event.target as any)._isSlash = false;
  };

  const insertImage = (src: string, isSlash: boolean = false) => {
    if (mode === 'visual' && editor) {
      editor.chain().focus().setImage({ src }).run();
    } else if (mode === 'markdown' && note) {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const snippet = `\n![imagem](${src})\n`;
      
      // If it's a slash command, we need to remove the '/'
      const newContent = isSlash 
        ? note.content.substring(0, start - 1) + snippet + note.content.substring(end)
        : note.content.substring(0, start) + snippet + note.content.substring(end);
        
      onUpdateNote(note.id, { content: newContent, updatedAt: Date.now() });
      
      if (editor) {
        isUpdatingFromNote.current = true;
        editor.commands.setContent(newContent);
        isUpdatingFromNote.current = false;
      }

      setTimeout(() => {
        textarea.focus();
        const newPos = isSlash ? start - 1 + snippet.length : start + snippet.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    }
  };

  // Default to visual mode when switching notes
  useEffect(() => {
    if (note) {
      setMode('visual');
    }
  }, [note?.id]);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-muted)]">
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
    
    // Set focus back and adjust selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const insertMarkdownSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const newContent = note.content.substring(0, start) + snippet + note.content.substring(textarea.selectionEnd);
    onUpdateNote(note.id, { content: newContent, updatedAt: Date.now() });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 0);
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
          table { border-collapse: collapse; width: 100%; margin: 1.5rem 0; font-size: 0.9rem; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          th { background-color: #f9fafb; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; color: #374151; }
          td { color: #4b5563; }
          tr:nth-child(even) { background-color: #fcfcfc; }
          tr:hover { background-color: #f9fafb; }
          hr { break-after: page; page-break-after: always; border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
          .watermark { margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; text-align: center; font-size: 0.75rem; color: #9ca3af; }
          .watermark a { color: #3b82f6; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        ${editor?.getHTML() || '<h1>Erro ao gerar HTML</h1>'}
        <div class="watermark">
          <p><a href="https://nox-note.vercel.app/">Feito com NoxNote</a></p>
          <p>qrcode feito com NoxNote</p>
        </div>
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
    
    const watermark = document.createElement('div');
    watermark.innerHTML = `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999;">
        <p><a href="https://nox-note.vercel.app/" style="color: #3b82f6; text-decoration: none; font-weight: bold;">Feito com NoxNote</a></p>
        <p>qrcode feito com NoxNote</p>
      </div>
    `;
    element.appendChild(watermark);

    const style = document.createElement('style');
    style.innerHTML = `
      body { color: #000 !important; background: #fff !important; }
      pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; }
      code { font-family: monospace; }
      blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f4f4f4; }
      hr { break-after: page; page-break-after: always; border: none; margin: 0; height: 0; }
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

  const exportImage = () => {
    if (!editor) return;
    const element = document.createElement('div');
    element.innerHTML = editor.getHTML();
    element.style.padding = '40px';
    element.style.width = '800px';
    element.style.background = '#fff';
    element.style.color = '#000';
    element.style.fontFamily = 'system-ui, sans-serif';
    
    const watermark = document.createElement('div');
    watermark.innerHTML = `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 14px; color: #666;">
        <p style="margin: 4px 0;">Baixei esse planner insano no <strong>Nox Note</strong></p>
        <p style="margin: 4px 0;"><a href="https://nox-note.vercel.app/" style="color: #3b82f6; text-decoration: none; font-weight: bold;">Feito com NoxNote</a></p>
        <p style="margin: 4px 0; font-size: 10px; opacity: 0.5;">qrcode feito com NoxNote</p>
      </div>
    `;
    element.appendChild(watermark);

    const style = document.createElement('style');
    style.innerHTML = `
      body { color: #000 !important; background: #fff !important; }
      pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; }
      code { font-family: monospace; }
      blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
      table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
      th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
      th { background-color: #f4f4f4; font-weight: bold; }
      img { max-width: 100%; border-radius: 8px; }
    `;
    element.appendChild(style);

    // Use html2pdf's internal html2canvas to get an image
    const worker = html2pdf().from(element).set({
      margin: 0,
      filename: `${note.title || 'nota'}.png`,
      image: { type: 'png', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'px', format: [800, element.scrollHeight + 100], orientation: 'portrait' }
    });

    worker.toImg().outputImg().then((img: HTMLImageElement) => {
      const link = document.createElement('a');
      link.href = img.src;
      link.download = `${note.title || 'nota'}.png`;
      link.click();
    });
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashMenu.active) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % commands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + commands.length) % commands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = commands[selectedIndex];
        handleCommandSelect(cmd.title);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSlashMenu(prev => ({ ...prev, active: false }));
      } else if (e.key.length === 1 || e.key === 'Backspace') {
        setSlashMenu(prev => ({ ...prev, active: false }));
      }
    }
  };

  const handleGlobalPlayPause = () => {
    if (isGlobalPlaying) {
      if (isReading) {
        stopReading({
          onReadingChange: setIsReading,
          onGlobalPlayingChange: setIsGlobalPlaying
        });
      }
      setIsGlobalPlaying(false);
      window.dispatchEvent(new CustomEvent('radio-control', { detail: { action: 'pause' } }));
    } else {
      window.dispatchEvent(new CustomEvent('radio-control', { detail: { action: 'play' } }));
      setIsGlobalPlaying(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[var(--bg-primary)] overflow-hidden relative">
      <EditorTopBar
        note={note}
        mode={mode}
        setMode={setMode}
        onToggleSidebar={onToggleSidebar}
        onTitleChange={handleTitleChange}
        onExportTxt={exportTxt}
        onExportHtml={exportHtml}
        onExportPdf={exportPdf}
        onExportImage={exportImage}
        isReading={isReading}
        isGlobalPlaying={isGlobalPlaying}
        onToggleReading={() => {
          if (isReading) {
            stopReading({ onReadingChange: setIsReading, onGlobalPlayingChange: setIsGlobalPlaying });
          } else {
            readNote({ note, mode, editor, onReadingChange: setIsReading, onGlobalPlayingChange: setIsGlobalPlaying });
          }
        }}
        onGlobalPlayPause={handleGlobalPlayPause}
        onUndo={() => editor?.chain().focus().undo().run()}
        onRedo={() => editor?.chain().focus().redo().run()}
        canUndo={editor?.can().undo() ?? false}
        canRedo={editor?.can().redo() ?? false}
      />

      <div className="flex-1 overflow-hidden relative">
        <input 
          type="file" 
          ref={imageInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
        {editor && mode === 'visual' && (
          <EditorBubbleMenu editor={editor} />
        )}

        {slashMenu.active && (
          <EditorSlashMenu
            x={slashMenu.x}
            y={slashMenu.y}
            commands={commands}
            selectedIndex={selectedIndex}
            onSelectCommand={handleCommandSelect}
            onMouseEnter={setSelectedIndex}
          />
        )}

        {mode === 'markdown' ? (
          <div className="w-full h-full flex flex-col">
            {/* Full-width toolbar for Markdown mode */}
            <div className="w-full flex-none bg-[var(--bg-surface)] border-b border-[var(--border-color)] p-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <button onClick={() => applyMarkdownStyle('# ', '')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Título 1 (# texto)"><Heading1 className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('## ', '')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Título 2 (## texto)"><Heading2 className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('### ', '')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Título 3 (### texto)"><Heading3 className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
              <button onClick={() => applyMarkdownStyle('**')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Negrito (**texto**)"><Bold className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('*')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Itálico (*texto*)"><Italic className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('<u>', '</u>')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Sublinhado (<u>texto</u>)"><Underline className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('~~')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Tachado (~~texto~~)"><Strikethrough className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
              <button onClick={() => applyMarkdownStyle('[', '](url)')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Link ([texto](url))"><LinkIcon className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('`', '`')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Código inline (`código`)"><Code className="w-4 h-4" /></button>
              <button onClick={() => insertMarkdownSnippet('\n```\n\n```\n')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Bloco de código (```código```)"><FileCode2 className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
              <button onClick={() => applyMarkdownStyle('- ', '')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Lista (- item)"><List className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('1. ', '')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Lista numerada (1. item)"><ListOrdered className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('- [ ] ', '')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Checklist (- [ ] item)"><CheckSquare className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
              <button onClick={() => applyMarkdownStyle('> ', '')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Citação (> texto)"><Quote className="w-4 h-4" /></button>
              <button onClick={() => insertMarkdownSnippet('\n---\n')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Divisor (---)"><Minus className="w-4 h-4" /></button>
              <button onClick={() => handleImageInsert()} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Imagem (![alt](url))"><ImageIcon className="w-4 h-4" /></button>
              <button onClick={() => insertMarkdownSnippet('\n| Coluna 1 | Coluna 2 |\n|----------|----------|\n| Dado 1   | Dado 2   |\n')} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Tabela"><TableIcon className="w-4 h-4" /></button>
              
              <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
              <button 
                onClick={() => editor?.chain().focus().undo().run()} 
                disabled={!editor?.can().undo()}
                className={`p-1.5 rounded transition-colors ${editor?.can().undo() ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]' : 'text-[var(--text-muted)] cursor-not-allowed'}`}
                title="Desfazer (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button 
                onClick={() => editor?.chain().focus().redo().run()} 
                disabled={!editor?.can().redo()}
                className={`p-1.5 rounded transition-colors ${editor?.can().redo() ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]' : 'text-[var(--text-muted)] cursor-not-allowed'}`}
                title="Refazer (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </button>

              <div className="flex-1" />
              <button 
                onClick={() => setShowCheatsheet(true)} 
                className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 text-xs font-medium pr-3" 
                title="Guia de Markdown"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Guia Markdown</span>
              </button>
            </div>
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={note.content}
                onChange={handleMarkdownChange}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Comece a escrever em Markdown..."
                className="absolute inset-0 w-full h-full p-8 bg-transparent text-[var(--text-primary)] font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder-[var(--text-muted)]"
                spellCheck="false"
              />
            </div>
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
          className="bg-[var(--text-primary)] text-[var(--bg-primary)] p-4 rounded-full shadow-lg shadow-black/50 hover:opacity-90 transition-colors"
        >
          {mode === 'markdown' ? <Type className="w-6 h-6" /> : <Code className="w-6 h-6" />}
        </button>
      </div>

      {showCheatsheet && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Code className="w-5 h-5 text-[var(--accent-primary)]" />
                Guia Rápido de Markdown
              </h3>
              <button onClick={() => setShowCheatsheet(false)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto text-sm text-[var(--text-primary)] space-y-6">
              <div>
                <h4 className="text-[var(--text-primary)] font-medium mb-2 uppercase tracking-wider text-xs">Formatação Básica</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex justify-between bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]"><span>**Negrito**</span> <span className="font-bold text-[var(--text-primary)]">Negrito</span></div>
                  <div className="flex justify-between bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]"><span>*Itálico*</span> <span className="italic text-[var(--text-primary)]">Itálico</span></div>
                  <div className="flex justify-between bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]"><span>~~Tachado~~</span> <span className="line-through text-[var(--text-primary)]">Tachado</span></div>
                  <div className="flex justify-between bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]"><span>`Código`</span> <span className="font-mono bg-[var(--bg-hover)] px-1 rounded text-[var(--text-primary)]">Código</span></div>
                </div>
              </div>
              
              <div>
                <h4 className="text-[var(--text-primary)] font-medium mb-2 uppercase tracking-wider text-xs">Títulos</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]"><span># Título 1</span> <span className="text-xl font-bold text-[var(--text-primary)]">Título 1</span></div>
                  <div className="flex justify-between items-center bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]"><span>## Título 2</span> <span className="text-lg font-bold text-[var(--text-primary)]">Título 2</span></div>
                  <div className="flex justify-between items-center bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]"><span>### Título 3</span> <span className="text-base font-bold text-[var(--text-primary)]">Título 3</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-[var(--text-primary)] font-medium mb-2 uppercase tracking-wider text-xs">Listas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)] flex flex-col gap-1">
                    <span>- Item 1</span>
                    <span>- Item 2</span>
                  </div>
                  <div className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)] flex flex-col gap-1">
                    <span>1. Primeiro</span>
                    <span>2. Segundo</span>
                  </div>
                  <div className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)] flex flex-col gap-1 sm:col-span-2">
                    <span>- [ ] Tarefa pendente</span>
                    <span>- [x] Tarefa concluída</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[var(--text-primary)] font-medium mb-2 uppercase tracking-wider text-xs">Outros Elementos</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]">
                    <span>[Link](https://...)</span>
                    <span className="text-[var(--accent-primary)] underline">Link</span>
                  </div>
                  <div className="flex justify-between items-center bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]">
                    <span>&gt; Citação</span>
                    <span className="border-l-2 border-[var(--border-color)] pl-2 text-[var(--text-secondary)]">Citação</span>
                  </div>
                  <div className="flex justify-between items-center bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]">
                    <span>--- (Três traços)</span>
                    <span className="text-[var(--text-muted)] text-xs">Linha divisória</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 p-3 rounded-lg flex items-start gap-3">
                <div className="mt-0.5">💡</div>
                <p className="text-sm text-[var(--text-primary)]">
                  <strong>Dica Pro:</strong> Você também pode digitar <kbd className="bg-[var(--bg-hover)] border border-[var(--border-color)] px-1.5 py-0.5 rounded text-xs font-mono">/</kbd> em uma linha vazia para abrir o menu rápido de comandos!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
