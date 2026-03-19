export type ThemeId = 'zinc' | 'sapphire' | 'olive' | 'sakura';

export interface Theme {
  id: ThemeId;
  name: string;
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