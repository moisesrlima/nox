import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Note } from '../types';
import { Download, Edit3, Eye, FileText, Menu, FileCode2, FileType2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface EditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onToggleSidebar: () => void;
}

export function Editor({ note, onUpdateNote, onToggleSidebar }: EditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (note) {
      setMode('edit');
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

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateNote(note.id, { content: e.target.value, updatedAt: Date.now() });
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
        ${previewRef.current?.innerHTML || '<h1>Erro ao gerar HTML</h1>'}
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
    if (!previewRef.current) return;
    
    const element = document.createElement('div');
    element.innerHTML = previewRef.current.innerHTML;
    element.style.padding = '20px';
    element.style.color = '#000';
    element.style.fontFamily = 'system-ui, sans-serif';
    
    // Apply basic styles for PDF
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
      margin:       10,
      filename:     `${note.title || 'nota'}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-zinc-950 overflow-hidden">
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
              onClick={() => setMode('edit')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'edit'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'preview'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Eye className="w-4 h-4" />
              Visualizar
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
        {mode === 'edit' ? (
          <textarea
            value={note.content}
            onChange={handleContentChange}
            placeholder="Comece a escrever em Markdown..."
            className="w-full h-full p-6 bg-transparent text-zinc-300 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder-zinc-700"
            spellCheck="false"
          />
        ) : (
          <div 
            ref={previewRef}
            className="w-full h-full p-6 overflow-y-auto prose prose-invert prose-zinc max-w-none prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-a:text-emerald-400 hover:prose-a:text-emerald-300 prose-img:rounded-xl prose-img:border prose-img:border-zinc-800"
          >
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({node, ...props}) => <img {...props} referrerPolicy="no-referrer" />
              }}
            >
              {note.content || '*Nenhum conteúdo*'}
            </ReactMarkdown>
          </div>
        )}
      </div>
      
      {/* Mobile mode toggle */}
      <div className="sm:hidden fixed bottom-6 right-6 z-20">
        <button
          onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
          className="bg-zinc-100 text-zinc-900 p-4 rounded-full shadow-lg shadow-black/50 hover:bg-white transition-colors"
        >
          {mode === 'edit' ? <Eye className="w-6 h-6" /> : <Edit3 className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
