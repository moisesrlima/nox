import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Note } from '../types';
import { Type, Code, Menu, Volume2 } from 'lucide-react';
import { useEditor } from '@tiptap/react';

import { EditorHeader } from './EditorHeader';
import { EditorToolbar, MarkdownToolbar, createEditorExtensions } from './EditorToolbar';
import { EditorContent } from '@tiptap/react';
import { exportTxt, exportHtml, exportPdf } from './EditorExport';
import { readNote, stopReading } from './EditorReading';
import { getSlashCommands } from './EditorCommands';

interface EditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onToggleSidebar: () => void;
  onFirstUserInput?: () => void;
}

export function Editor({ note, onUpdateNote, onToggleSidebar, onFirstUserInput }: EditorProps) {
  const [mode, setMode] = useState<'visual' | 'markdown'>('visual');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isGlobalPlaying, setIsGlobalPlaying] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdatingFromNote = useRef(false);

  // Use refs to avoid stale closures in Tiptap handlers
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

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



  const handleFirstInput = useCallback(() => {
    const props = { onFirstUserInput } as any;
    if (props.onFirstUserInput && typeof props.onFirstUserInput === 'function') {
      props.onFirstUserInput();
    }
  }, [onFirstUserInput]);

  const handleTitleChange = (value: string) => {
    if (value.length > 0) {
      handleFirstInput();
    }
    onUpdateNote(note!.id, { title: value, updatedAt: Date.now() });
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    console.log('Debug: handleMarkdownChange called, content length:', newContent.length);
    // Só chama se o conteúdo for diferente do inicial
    if (newContent.length > 0 && newContent !== note!.content) {
      handleFirstInput();
    }
    onUpdateNote(note!.id, { content: newContent, updatedAt: Date.now() });
    
    // Sync back to Tiptap
    if (editor && newContent !== (editor.storage as any).markdown.getMarkdown()) {
      isUpdatingFromNote.current = true;
      editor.commands.setContent(newContent);
      isUpdatingFromNote.current = false;
    }
  };

  const applyMarkdownStyle = (prefix: string, suffix?: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = note!.content.substring(start, end);

    if (suffix === undefined) {
      const newContent = note!.content.substring(0, start) + prefix + selectedText + note!.content.substring(end);
      onUpdateNote(note!.id, { content: newContent, updatedAt: Date.now() });
    } else { 
      const newContent = note!.content.substring(0, start) + prefix + selectedText + suffix + note!.content.substring(end);
      onUpdateNote(note!.id, { content: newContent, updatedAt: Date.now() });
    }
    textarea.focus();
  };

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

  // Tiptap Editor
  const editor = useEditor({
    extensions: createEditorExtensions(),
    content: note?.content || '',
    onUpdate: ({ editor }) => {
      if (isUpdatingFromNote.current || !note) return;
      
      const markdown = (editor.storage as any).markdown.getMarkdown();
      if (note && markdown !== note.content) {
        onUpdateNote(note.id, { content: markdown, updatedAt: Date.now() });
      }
    },
  }, [note?.id]);

  useEffect(() => {
    if (!editor || !note) {
      return;
    }
    const markdown = (editor.storage as any).markdown.getMarkdown();
    if (note.content !== markdown) {
      isUpdatingFromNote.current = true;
      editor.commands.setContent(note.content, { emitUpdate: false });
      isUpdatingFromNote.current = false;
    }
  }, [note?.content, editor]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-text-secondary mb-2">Nenhuma nota selecionada</h2>
          <p className="text-text-muted">Selecione uma nota na barra lateral ou crie uma nova</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <EditorHeader
        note={note}
        mode={mode}
        isFullscreen={isFullscreen}
        isReading={isReading}
        isMobileMenuOpen={isMobileMenuOpen}
        isGlobalPlaying={isGlobalPlaying}
        onToggleSidebar={onToggleSidebar}
        onModeChange={setMode}
        onTitleChange={handleTitleChange}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onExportTxt={() => exportTxt({ note })}
        onExportHtml={() => exportHtml({ note, editor })}
        onExportPdf={() => exportPdf({ note, editor })}
        onToggleReading={() => {
          if (isReading) {
            stopReading({ onReadingChange: setIsReading, onGlobalPlayingChange: setIsGlobalPlaying });
          } else {
            readNote({ note, mode, editor, onReadingChange: setIsReading, onGlobalPlayingChange: setIsGlobalPlaying });
          }
        }}
        onToggleFullscreen={toggleFullscreen}
        onGlobalPlayPause={handleGlobalPlayPause}
      />

      <div className="flex-none px-4 py-2 bg-surface/30 border-b border-border/50 flex items-center gap-4 text-xs text-text-secondary">
        <span>Criado: {format(note.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
        <span>Modificado: {format(note.updatedAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
      </div>

      <div className="flex-1 relative overflow-y-auto">
        <EditorToolbar 
          editor={editor} 
          mode={mode} 
          onImageUploadTrigger={() => fileInputRef.current?.click()} 
        />

        {mode === 'markdown' ? (
          <div className="w-full h-full relative">
            <MarkdownToolbar onApplyStyle={applyMarkdownStyle} />
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
            <EditorContent editor={editor} className="prose prose-stone dark:prose-invert max-w-none p-16 focus:outline-none" />
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