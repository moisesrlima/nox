import React from 'react';
import { Type, List, Minus, Table, CheckSquare, Image } from 'lucide-react';

export const getSlashCommands = () => [
    {
        title: 'Título 1',
        description: 'Cabeçalho de seção grande.',
        icon: <Type className="w-5 h-5" />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
        },
    },
    {
        title: 'Título 2',
        description: 'Cabeçalho de seção médio.',
        icon: <Type className="w-5 h-5 opacity-70" />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
        },
    },
    {
        title: 'Lista',
        description: 'Crie uma lista com marcadores.',
        icon: <List className="w-5 h-5" />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        title: 'Divisor',
        description: 'Separe seções com uma linha.',
        icon: <Minus className="w-5 h-5" />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        },
    },
    {
        title: 'Tabela',
        description: 'Adicione uma tabela simples.',
        icon: <Table className="w-5 h-5" />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
    },
    {
        title: 'Checklist',
        description: 'Crie uma lista de tarefas.',
        icon: <CheckSquare className="w-5 h-5" />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
    },
    {
        title: 'Imagem',
        description: 'Adicione uma imagem por URL.',
        icon: <Image className="w-5 h-5" />,
        command: ({ editor, range }) => {
            const url = window.prompt('URL da imagem:');
            if (url) {
                editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
            } else {
                editor.chain().focus().deleteRange(range).run();
            }
        },
    },
];