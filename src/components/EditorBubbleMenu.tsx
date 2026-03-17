import React from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Bold, Italic, Underline, Link as LinkIcon, Code } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  return (
    <BubbleMenu editor={editor}>
      <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-color)] p-1 rounded-lg shadow-xl backdrop-blur-md">
        <button 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          className={`p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors ${editor.isActive('bold') ? 'text-[var(--accent-primary)] bg-[var(--bg-hover)]' : 'text-[var(--text-secondary)]'}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          className={`p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors ${editor.isActive('italic') ? 'text-[var(--accent-primary)] bg-[var(--bg-hover)]' : 'text-[var(--text-secondary)]'}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          className={`p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors ${editor.isActive('underline') ? 'text-[var(--accent-primary)] bg-[var(--bg-hover)]' : 'text-[var(--text-secondary)]'}`}
        >
          <Underline className="w-4 h-4" />
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleCode().run()} 
          className={`p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors ${editor.isActive('code') ? 'text-[var(--accent-primary)] bg-[var(--bg-hover)]' : 'text-[var(--text-secondary)]'}`}
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
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>
    </BubbleMenu>
  );
}
