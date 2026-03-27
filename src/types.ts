export type ThemeId = 'zinc' | 'sapphire' | 'olive' | 'sakura' | 'cyberpunk' | 'nord' | 'dracula' | 'sepia' | 'forest' | 'midnight' | 'crimson' | 'minimal-light';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  isDark: boolean;
  colors: {
    primary: string;
    surface: string;
    hover: string;
    active: string;
    accent: string;
    accentSoft: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
  };
  font: string;
}

export const THEMES: Theme[] = [
  {
    id: 'zinc',
    name: 'Zinc (Padrão)',
    description: 'O clássico tema escuro minimalista do NoxNote.',
    isDark: true,
    colors: {
      primary: '#09090b',
      surface: '#18181b',
      hover: '#27272a',
      active: '#3f3f46',
      accent: '#3c61dd',
      accentSoft: '#27272a',
      textPrimary: '#f4f4f5',
      textSecondary: '#a1a1aa',
      textMuted: '#52525b',
      border: '#27272a',
    },
    font: 'Inter',
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    description: 'Um tema claro e refrescante com tons de azul safira.',
    isDark: false,
    colors: {
      primary: '#e7edfe',
      surface: '#f0f4ff',
      hover: '#dbe4ff',
      active: '#c1d0ff',
      accent: '#3c61dd',
      accentSoft: '#E7EDFE',
      textPrimary: '#0f172a',
      textSecondary: '#1e293b',
      textMuted: '#64748b',
      border: '#e2e8f0',
    },
    font: 'Inter',
  },
  {
    id: 'olive',
    name: 'Olive',
    description: 'Inspirado na natureza, com tons terrosos e orgânicos.',
    isDark: false,
    colors: {
      primary: '#f5f5f1',
      surface: '#fafaf8',
      hover: '#f0f0e8',
      active: '#e8e8e0',
      accent: '#5a5a43',
      accentSoft: '#F5F5F1',
      textPrimary: '#161814',
      textSecondary: '#2d3029',
      textMuted: '#8a8f7d',
      border: '#e8e8e0',
    },
    font: 'Manrope',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    description: 'Suave e delicado, inspirado nas flores de cerejeira.',
    isDark: false,
    colors: {
      primary: '#F4C6CF',
      surface: '#F8D4DA',
      hover: '#FCE2E7',
      active: '#e9bdc5',
      accent: '#3A2A2E',
      accentSoft: '#F4C6CF',
      textPrimary: '#3A2A2E',
      textSecondary: '#4A3A3E',
      textMuted: '#8A7A7E',
      border: '#E4B6BF',
    },
    font: 'Inter',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon, futurismo e alta tecnologia.',
    isDark: true,
    colors: {
      primary: '#050505',
      surface: '#0d0d0d',
      hover: '#1a1a1a',
      active: '#262626',
      accent: '#ff0055',
      accentSoft: '#0d0d0d',
      textPrimary: '#00ffcc',
      textSecondary: '#ff0055',
      textMuted: '#4d4d4d',
      border: '#1a1a1a',
    },
    font: 'JetBrains Mono',
  },
  {
    id: 'nord',
    name: 'Nord',
    description: 'Cores frias e árticas para um ambiente de foco sereno.',
    isDark: true,
    colors: {
      primary: '#2e3440',
      surface: '#3b4252',
      hover: '#434c5e',
      active: '#4c566a',
      accent: '#88c0d0',
      accentSoft: '#3b4252',
      textPrimary: '#eceff4',
      textSecondary: '#d8dee9',
      textMuted: '#4c566a',
      border: '#434c5e',
    },
    font: 'Inter',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    description: 'O famoso tema dark amado por desenvolvedores.',
    isDark: true,
    colors: {
      primary: '#282a36',
      surface: '#44475a',
      hover: '#6272a4',
      active: '#bd93f9',
      accent: '#bd93f9',
      accentSoft: '#282a36',
      textPrimary: '#f8f8f2',
      textSecondary: '#6272a4',
      textMuted: '#44475a',
      border: '#44475a',
    },
    font: 'Fira Code',
  },
  {
    id: 'sepia',
    name: 'Sepia',
    description: 'Conforto visual clássico, como ler em papel antigo.',
    isDark: false,
    colors: {
      primary: '#f4ecd8',
      surface: '#fdf6e3',
      hover: '#eee8d5',
      active: '#93a1a1',
      accent: '#b58900',
      accentSoft: '#f4ecd8',
      textPrimary: '#586e75',
      textSecondary: '#657b83',
      textMuted: '#93a1a1',
      border: '#eee8d5',
    },
    font: 'Libre Baskerville',
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Profundo e calmo, como uma floresta à noite.',
    isDark: true,
    colors: {
      primary: '#0b120b',
      surface: '#1a241a',
      hover: '#2a362a',
      active: '#3a4a3a',
      accent: '#4ade80',
      accentSoft: '#1a241a',
      textPrimary: '#ecfdf5',
      textSecondary: '#a7f3d0',
      textMuted: '#3a4a3a',
      border: '#2a362a',
    },
    font: 'Inter',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Escuridão total para quem trabalha tarde da noite.',
    isDark: true,
    colors: {
      primary: '#000000',
      surface: '#0a0a0a',
      hover: '#141414',
      active: '#1f1f1f',
      accent: '#ffffff',
      accentSoft: '#0a0a0a',
      textPrimary: '#ffffff',
      textSecondary: '#a3a3a3',
      textMuted: '#404040',
      border: '#141414',
    },
    font: 'Inter',
  },
  {
    id: 'crimson',
    name: 'Crimson',
    description: 'Elegância e poder com tons de vermelho profundo.',
    isDark: true,
    colors: {
      primary: '#1a0a0a',
      surface: '#2a1414',
      hover: '#3a1a1a',
      active: '#4a1f1f',
      accent: '#ef4444',
      accentSoft: '#2a1414',
      textPrimary: '#fee2e2',
      textSecondary: '#fca5a5',
      textMuted: '#4a1f1f',
      border: '#3a1a1a',
    },
    font: 'Inter',
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Simplicidade extrema em branco e cinza.',
    isDark: false,
    colors: {
      primary: '#ffffff',
      surface: '#fafafa',
      hover: '#f4f4f5',
      active: '#e4e4e7',
      accent: '#18181b',
      accentSoft: '#f4f4f5',
      textPrimary: '#18181b',
      textSecondary: '#52525b',
      textMuted: '#a1a1aa',
      border: '#e4e4e7',
    },
    font: 'Inter',
  },
];

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  folderId?: string;
}

export const INITIAL_NOTE: Note = {
  id: 'initial-note-1',
  title: 'Bem-vindo ao Nox Note',
  content: `# Bem-vindo ao **Nox Note**

O **Nox Note** é um bloco de notas **minimalista**, criado para quem valoriza **foco, simplicidade e privacidade**.

> 🛡️ **Local-first:** Suas notas ficam no seu navegador para acesso rápido.
> ☁️ **Sincronização em Nuvem:** Conecte sua conta Google para salvar tudo no Google Drive!

---

## ✍️ Escreva do seu jeito

Você pode usar **Markdown** ou o **editor visual (WYSIWYG)** para formatar suas ideias facilmente.

Exemplo de formatação:

- **Negrito**
- *Itálico*
- \`código\`
- ~~texto riscado~~

---

## 🧠 Ferramentas para foco

O Nox Note também ajuda você a **entrar no fluxo de trabalho**:

- ⏱️ Temporizador **Foco & Pausa**
- 🎧 **Rádio Lo-Fi** integrada
- 🔊 **Leitura em voz alta** das suas notas (Texto → Fala)

---

## ☁️ Sincronização e Nuvem

Agora você não precisa mais se preocupar em perder suas notas se limpar o cache do navegador:

- Faça login com o **Google Drive** no menu inferior esquerdo.
- Suas notas serão sincronizadas automaticamente na nuvem.
- Acesse de qualquer dispositivo com segurança!

---

## ✅ Exemplo de Checklist

- [ ] Escrever ideias
- [ ] Conectar conta do Google Drive
- [ ] Ouvir Lo-Fi
- [ ] Exportar nota em PDF

---

## 📦 Exportação de Notas

Você pode exportar suas anotações facilmente:

| Formato | Uso |
|--------|-----|
| PDF | Compartilhar ou imprimir |
| HTML | Publicar na web |
| TXT | Arquivo simples |

---

## 🚀 Simples assim

1. Capture ideias rapidamente
2. Organize com Markdown
3. Sincronize com a nuvem
4. Exporte quando precisar

---

**Nox Note**
*Pensar, escrever e focar — sem distrações.*
`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};