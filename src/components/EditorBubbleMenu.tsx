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
      <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg shadow-xl backdrop-blur-md">
        <button 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('bold') ? 'text-[var(--accent-primary)] bg-zinc-800' : 'text-zinc-400'}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('italic') ? 'text-[var(--accent-primary)] bg-zinc-800' : 'text-zinc-400'}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('underline') ? 'text-[var(--accent-primary)] bg-zinc-800' : 'text-zinc-400'}`}
        >
          <Underline className="w-4 h-4" />
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleCode().run()} 
          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('code') ? 'text-[var(--accent-primary)] bg-zinc-800' : 'text-zinc-400'}`}
        >
          <Code className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-zinc-800 mx-1" />
        <button 
          onClick={() => {
            const url = window.prompt('URL:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }} 
          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('link') ? 'text-[var(--accent-primary)] bg-zinc-800' : 'text-zinc-400'}`}
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>
    </BubbleMenu>
  );
}
