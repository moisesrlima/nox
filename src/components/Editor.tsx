import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Note } from '../types';
import { 
  Download, Edit3, Eye, FileText, Menu, FileCode2, FileType2, Type, Code,
  Bold, Italic, Underline, Link as LinkIcon, Search, Maximize2, Minimize2, PanelLeftClose, Volume2
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
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import { CustomTaskItem } from './CustomTaskItem';
import { getSlashCommands, CommandItem } from './EditorCommands';

interface EditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onToggleSidebar: () => void;
}

export function Editor({ note, onUpdateNote, onToggleSidebar }: EditorProps) {
  const [mode, setMode] = useState<'visual' | 'markdown'>('visual');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [slashMenu, setSlashMenu] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      if (mode === 'visual' && editor) {
        editor.chain().focus().setImage({ src: result }).run();
      } else if (mode === 'markdown' && textareaRef.current && note) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const imageMarkdown = `![Imagem](${result})`;
        const newContent = note.content.substring(0, start) + imageMarkdown + note.content.substring(end);
        onUpdateNote(note.id, { content: newContent, updatedAt: Date.now() });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Erro ao ativar tela cheia:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Erro ao sair da tela cheia:', err);
      });
    }
  };

  // Monitorar mudanças no estado de tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
        case 'checklist': case 'todo': editor.commands.toggleTaskList(); break;
        case 'imagem': case 'image': 
          const url = window.prompt('URL da imagem (deixe vazio para fazer upload):');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          } else {
            fileInputRef.current?.click();
          }
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
        case 'checklist': case 'todo': snippet = '- [ ] '; break;
        case 'imagem': case 'image': 
          const url = window.prompt('URL da imagem (deixe vazio para fazer upload):');
          if (url) {
            snippet = `![Imagem](${url})`;
          } else {
            fileInputRef.current?.click();
            return; // O handler do input fará a inserção
          }
          break;
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
      Image,
      TaskList,
      CustomTaskItem.configure({
        nested: true,
      }),
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
        class: 'prose max-w-none focus:outline-none min-h-full p-6 prose-pre:bg-surface prose-pre:border prose-pre:border-border prose-a:text-accent hover:prose-a:text-accent-soft prose-img:rounded-xl prose-img:border prose-img:border-border',
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
  }, [note?.id]); // Re-criar editor quando a nota mudar

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
    console.log('Debug Editor: note is null, showing placeholder message');
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-text-muted">
        <FileText className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">Selecione uma nota ou crie uma nova</p>
      </div>
    );
  }

  console.log('Debug Editor: note is valid, rendering full editor', { noteId: note.id, title: note.title });

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

  const readNote = () => {
    if (!note) return;
    
    const textToRead = mode === 'visual' && editor 
      ? editor.getText()
      : note.content;
    
    if (!textToRead.trim()) {
      alert('A nota está vazia!');
      return;
    }
    
    if ('speechSynthesis' in window) {
      // Cancelar qualquer leitura anterior
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'pt-BR';
      utterance.rate = 1;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Seu navegador não suporta leitura em voz alta.');
    }
  };

  const stopReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <header className="flex-none h-16 border-b border-border flex items-center justify-between px-4 bg-background/50 backdrop-blur-sm z-10">
        {/* Left side: Sidebar toggle and Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-hover rounded-lg transition-colors"
              title="Alternar menu lateral"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>
          <input
            type="text"
            value={note.title}
            onChange={handleTitleChange}
            placeholder="Título da nota"
            className="flex-1 bg-transparent text-xl font-semibold text-text-primary placeholder-text-muted focus:outline-none truncate"
          />
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center bg-surface rounded-lg p-1 border border-border">
              <button
                onClick={() => setMode('visual')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === 'visual' ? 'bg-accent text-accent-contrast shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-hover/50'
                }`}
              >
                <Type className="w-4 h-4" /> Visual
              </button>
              <button
                onClick={() => setMode('markdown')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === 'markdown' ? 'bg-accent text-accent-contrast shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-hover/50'
                }`}
              >
                <Code className="w-4 h-4" /> Markdown
              </button>
            </div>

            <div className="relative group">
              <button className="p-2 text-text-muted hover:text-text-primary hover:bg-hover rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Exportar</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1">
                <button onClick={exportTxt} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors">
                  <FileType2 className="w-4 h-4" /> TXT
                </button>
                <button onClick={exportHtml} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors">
                  <FileCode2 className="w-4 h-4" /> HTML
                </button>
                <button onClick={exportPdf} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors">
                  <FileText className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>

            <button
              onClick={isReading ? stopReading : readNote}
              className={`p-2 rounded-lg transition-colors ${
                isReading 
                  ? 'text-accent bg-accent/10' 
                  : 'text-text-muted hover:text-text-primary hover:bg-hover'
              }`}
              title={isReading ? "Parar leitura" : "Ler nota em voz alta"}
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-hover rounded-lg transition-colors"
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Actions (Hamburger Menu) */}
          <div className="relative md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-hover rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {isMobileMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl z-50 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="px-4 py-2">
                  <p className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2">Modo</p>
                  <div className="flex items-center bg-background rounded-lg p-1 border border-border">
                    <button
                      onClick={() => setMode('visual')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        mode === 'visual' ? 'bg-accent text-accent-contrast shadow-sm' : 'text-text-secondary'
                      }`}
                    >
                      <Type className="w-4 h-4" /> Visual
                    </button>
                    <button
                      onClick={() => setMode('markdown')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        mode === 'markdown' ? 'bg-accent text-accent-contrast shadow-sm' : 'text-text-secondary'
                      }`}
                    >
                      <Code className="w-4 h-4" /> Markdown
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-border my-1" />

                <div className="px-4 py-2">
                  <p className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2">Ações</p>
                  <button onClick={isReading ? stopReading : readNote} className="w-full flex items-center gap-3 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors rounded-md">
                    <Volume2 className="w-4 h-4" />
                    <span>{isReading ? "Parar leitura" : "Ler nota em voz alta"}</span>
                  </button>
                  <button onClick={toggleFullscreen} className="w-full flex items-center gap-3 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors rounded-md">
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    <span>{isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}</span>
                  </button>
                </div>
                
                <div className="border-t border-border my-1" />

                <div className="px-4 py-2">
                  <p className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2">Exportar</p>
                  <button onClick={exportTxt} className="w-full flex items-center gap-3 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors rounded-md">
                    <FileType2 className="w-4 h-4" /> TXT
                  </button>
                  <button onClick={exportHtml} className="w-full flex items-center gap-3 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors rounded-md">
                    <FileCode2 className="w-4 h-4" /> HTML
                  </button>
                  <button onClick={exportPdf} className="w-full flex items-center gap-3 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors rounded-md">
                    <FileText className="w-4 h-4" /> PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-none px-4 py-2 bg-surface/30 border-b border-border/50 flex items-center gap-4 text-xs text-text-muted">
        <span>Criado: {format(note.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
        <span>Modificado: {format(note.updatedAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
      </div>

      <div className="flex-1 relative overflow-y-auto">
        {editor && mode === 'visual' && (
          <BubbleMenu editor={editor}>
            <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg shadow-xl backdrop-blur-md">
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-hover transition-colors ${editor.isActive('bold') ? 'text-accent bg-hover' : 'text-text-secondary'}`}>
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-hover transition-colors ${editor.isActive('italic') ? 'text-accent bg-hover' : 'text-text-secondary'}`}>
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded hover:bg-hover transition-colors ${editor.isActive('underline') ? 'text-accent bg-hover' : 'text-text-secondary'}`}>
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-border mx-1" />
              <button onClick={() => {
                const url = window.prompt('URL:');
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }} className={`p-1.5 rounded hover:bg-hover transition-colors ${editor.isActive('link') ? 'text-accent bg-hover' : 'text-text-secondary'}`}>
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>
          </BubbleMenu>
        )}

        {slashMenu.active && (
          <div 
            className="fixed z-50 w-64 bg-surface border border-border rounded-xl shadow-2xl py-2 overflow-hidden"
            style={{ left: slashMenu.x, top: slashMenu.y }}
          >
            <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">Comandos</div>
            {commands.map((cmd, i) => (
              <button
                key={cmd.title}
                onClick={() => handleCommandSelect(cmd.title.toLowerCase())}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${selectedIndex === i ? 'bg-hover text-text-primary' : 'text-text-secondary'}`}
              >
                <div className={`p-1.5 rounded-lg ${selectedIndex === i ? 'bg-surface text-accent' : 'bg-hover'}`}>
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
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-surface/80 border border-border p-1 rounded-lg shadow-xl backdrop-blur-md">
              <button onClick={() => applyMarkdownStyle('**')} className="p-1.5 rounded hover:bg-hover text-text-secondary transition-colors"><Bold className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('*')} className="p-1.5 rounded hover:bg-hover text-text-secondary transition-colors"><Italic className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('<u>', '</u>')} className="p-1.5 rounded hover:bg-hover text-text-secondary transition-colors"><Underline className="w-4 h-4" /></button>
              <button onClick={() => applyMarkdownStyle('[', '](url)')} className="p-1.5 rounded hover:bg-hover text-text-secondary transition-colors"><LinkIcon className="w-4 h-4" /></button>
            </div>
            <textarea
              ref={textareaRef}
              value={note.content}
              onChange={handleMarkdownChange}
              placeholder="Comece a escrever em Markdown..."
              className="w-full h-full p-16 bg-transparent text-text-secondary font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder-text-muted"
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
          className="bg-text-primary text-background p-4 rounded-full shadow-lg shadow-black/50 hover:bg-white transition-colors"
        >
          {mode === 'markdown' ? <Type className="w-6 h-6" /> : <Code className="w-6 h-6" />}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
}