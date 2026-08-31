import React from 'react';
import { 
  Table, List, Heading1, Heading2, Minus, CheckSquare, Code, Image, Mic
} from 'lucide-react';

export interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (editor: any) => void;
}

export const getSlashCommands = (onSelect: (cmd: string) => void): CommandItem[] => [
  {
    title: 'Título 1',
    description: 'Título de seção grande',
    icon: <Heading1 className="w-4 h-4" />,
    command: () => onSelect('h1'),
  },
  {
    title: 'Título 2',
    description: 'Título de seção média',
    icon: <Heading2 className="w-4 h-4" />,
    command: () => onSelect('h2'),
  },
  {
    title: 'Modo Aula',
    description: 'Transformar voz em texto (Modo Aula)',
    icon: <Mic className="w-4 h-4" />,
    command: () => onSelect('speech'),
  },
  {
    title: 'Lista',
    description: 'Lista com marcadores',
    icon: <List className="w-4 h-4" />,
    command: () => onSelect('list'),
  },
  {
    title: 'Checklist',
    description: 'Lista de tarefas',
    icon: <CheckSquare className="w-4 h-4" />,
    command: () => onSelect('checklist'),
  },
  {
    title: 'Imagem',
    description: 'Inserir imagem (link ou upload)',
    icon: <Image className="w-4 h-4" />,
    command: () => onSelect('image'),
  },
  {
    title: 'Código',
    description: 'Bloco de código',
    icon: <Code className="w-4 h-4" />,
    command: () => onSelect('codeblock'),
  },
  {
    title: 'Tabela',
    description: 'Tabela simples 3x2',
    icon: <Table className="w-4 h-4" />,
    command: () => onSelect('table'),
  },
  {
    title: 'Divisor',
    description: 'Linha horizontal',
    icon: <Minus className="w-4 h-4" />,
    command: () => onSelect('hr'),
  },
];
